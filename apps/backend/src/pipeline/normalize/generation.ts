import { EReasonCodes, EReasonCodesStatic, EEventType, EVessleType } from '@packages/enum';
import {
  IConfigJSON,
  IEventSchema,
  IRunMetadata,
  IScoring,
  IGeometry,
  TGlobalEvent,
} from '@packages/types';
import { deepSortObject } from '@packages/utils';
import { getGitCommitSHA, hashString } from '../../helpers/utils/backendUtils';
import config from '../../config/pilot.json';
import {
  isMatchedCase,
  isNoisyCase,
  missingRequiredFields,
} from './validation';
import { isNearCoast } from '../features/coast_distance';
import pkg from '../../../package.json';
import { vesselZone } from '../features/bathymetry';

export const backendVersion = pkg.version;

export const generateSources = (a_Configuration: Set<IConfigJSON>) => {
  return Array.from(a_Configuration)
    .map((config) => config.source)
    .join(', ');
};

export const generateEventId = (
  a_Timestamps: string,
  a_Lon: number,
  a_Lat: number,
  a_Source: string,
) => {
  const canonical = JSON.stringify({
    timestamp: a_Timestamps,
    lon: a_Lon,
    lat: a_Lat,
    source: a_Source,
  });

  return hashString(canonical);
};

export const generateConfidence = (
  a_EventEntry: TGlobalEvent | undefined,
): 2 | 3 | 4 | null => {
  return a_EventEntry && a_EventEntry.type === EEventType.port_visit
    ? (Number(a_EventEntry.port_visit.confidence) as 2 | 3 | 4)
    : null;
};

export const generateRunMetadata = async (
  a_Configuration: Set<IConfigJSON>,
): Promise<IRunMetadata> => {
  const canonicalObject = deepSortObject(Array.from(a_Configuration));
  const canonicalString = JSON.stringify(canonicalObject);
  const config_hash = await hashString(canonicalString);

  return {
    code_version: await getGitCommitSHA(),
    config_json: canonicalObject,
    config_hash,
  };
};

export const generateScoring = (a_EventSchema: IEventSchema): IScoring => {
  const WEIGHTS = {
    base_uncertainty: 0.1,

    missing_field: 0.08,
    noisy: 0.15,
    unmatched: 0.2,

    near_coast_importance: 0.3,
    eez_importance: 0.2,
    mpa_importance: 0.5,

    missing_confidence: 0.25,
    low_confidence: 0.2,
  };

  const event = a_EventSchema.raw_event_metadata;
  const entry = a_EventSchema.raw_metadata;

  const confidence_proxy = generateConfidence(event ?? undefined);

  let reason_codes: EReasonCodes[] = [];

  // =========================
  // A. UNCERTAINTY (DATA QUALITY) - How much do we distrust this event?
  // =========================
  let uncertainty_score = WEIGHTS.base_uncertainty;
  const matched = isMatchedCase(entry);

  const missingFields = missingRequiredFields(entry);

  if (missingFields.length > 0 && matched) {
    uncertainty_score += Math.min(
      missingFields.length * WEIGHTS.missing_field,
      0.4
    );

    for (const field of missingFields) {
      reason_codes.push(`missing_required_field:${field}`);
    }
  }

  if (isNoisyCase(entry)) {
    uncertainty_score += WEIGHTS.noisy;
    reason_codes.push(EReasonCodesStatic.noisy_vessel);
  }

  

  if (!matched) {
    uncertainty_score += WEIGHTS.unmatched;
    reason_codes.push(EReasonCodesStatic.unmatched_to_public_ais);
  } else {
    reason_codes.push(EReasonCodesStatic.matched_to_public_ais);
    uncertainty_score -= 0.05; // slight confidence boost
  }

  if (confidence_proxy === null) {
    uncertainty_score += WEIGHTS.missing_confidence;
    reason_codes.push(EReasonCodesStatic.missing_confidence_proxy);
  } else if (
    confidence_proxy <= config.threshold.low_detection_confidence_threshold
  ) {
    uncertainty_score += WEIGHTS.low_confidence;
    reason_codes.push(EReasonCodesStatic.low_detection_confidence);
  }

  uncertainty_score = Number(Math.max(0, Math.min(1, uncertainty_score)).toFixed(2));

  // =========================
  // B. IMPORTANCE (DOMAIN VALUE) - If this event is real, how important is it?
  // =========================
  let importance_score = 0;

  const inside_eez =
    a_EventSchema.context_layers.EEZ.enrichments.length > 0;

  const inside_mpa =
    a_EventSchema.context_layers.MPA.enrichments.length > 0;

  if (inside_eez) {
    importance_score += WEIGHTS.eez_importance;
    reason_codes.push(EReasonCodesStatic.inside_eez);
  }

  if (inside_mpa) {
    importance_score += WEIGHTS.mpa_importance;
    reason_codes.push(EReasonCodesStatic.inside_mpa);
  }

  if (isNearCoast(a_EventSchema.distance_to_coast_km)) {
    importance_score += WEIGHTS.near_coast_importance;
    reason_codes.push(EReasonCodesStatic.near_coast);
  }

  if (entry.vesselType.trim().toUpperCase() === EVessleType.CARGO && inside_mpa) {
    importance_score += 0.4; // high-risk combo
  }

  const {isShallowWater, isFishingZone, isDeepWater} = vesselZone(a_EventSchema.context_layers.Bathymetry.enrichments[0].value)

  // 1. Fishing-relevant zone (core maritime activity zone)
  if (isFishingZone) {
    importance_score += 0.15;
    reason_codes.push(EReasonCodesStatic.bathymetry_fishing_zone);
  }

  // 2. Shallow water + EEZ = high human activity pressure zone
  if (isShallowWater && inside_eez) {
    importance_score += 0.25;
    reason_codes.push(EReasonCodesStatic.bathymetry_shallow_eez_hotspot);
  }

  // 3. Shallow water + MPA = ecological sensitivity (very important)
  if (isShallowWater && inside_mpa) {
    importance_score += 0.3;
    reason_codes.push(EReasonCodesStatic.bathymetry_mpa_shallow_zone);
  }

  // 4. Cargo vessel in fishing/shallow zones = anomaly signal
  if (entry.vesselType.trim().toUpperCase() === EVessleType.CARGO && (isFishingZone || isShallowWater)) {
    importance_score += 0.2;
    reason_codes.push(EReasonCodesStatic.bathymetry_cargo_anomaly_zone);
  }

  // 5. Deep water = low interaction area (slight context boost only if MPA)
  if (isDeepWater && inside_mpa) {
    importance_score += 0.05;
    reason_codes.push(EReasonCodesStatic.bathymetry_deep_mpa);
  }

  importance_score = Math.max(0, Math.min(1, importance_score));

  // =========================
  // C. TRIAGE SCORE - What should a human/system investigate first?
  // =========================
  const triage_score = Math.min(
    1,
    Number((importance_score + uncertainty_score * 0.2).toFixed(2))
  );
  
  return {
    triage_score,
    uncertainty_score,
    reason_codes,
  };
};

export const generateGeom = (a_Lon: number, a_Lat: number): IGeometry => {
  return {
    type: 'Point',
    coordinates: [a_Lon, a_Lat],
  };
};

export const generateVersion = () => {
  return backendVersion ?? '1';
};

export const generateCoordinate = (a_Coordinate: number) => {
  return +a_Coordinate.toFixed(3);
};
