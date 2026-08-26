import {
  EReasonCodes,
  EReasonCodesStatic,
  EEventType,
  EVessleType,
  EConfidenceTiers,
  EGeoJSONGeometryType,
  EHiddenConfig,
} from '@packages/enum';
import {
  IConfigJSON,
  IEventSchema,
  IRunMetadata,
  IScoring,
  IGeometry,
  TGlobalEvent,
  I4wingsEntry,
} from '@packages/types';
import {
  deepSortObject,
  deepStripHidden,
  getExecutionDuration,
  isNumber,
  stripHiddenConfiguration,
} from '@packages/utils';
import {
  getContextLayersFromEvents,
  getSourcesFromEvents,
  hashString,
} from '../../helpers/utils/backendUtils';
import { isNoisyCase, missingRequiredFields } from './validation';
import { isNearCoast } from '../features/coast_distance';
import pkg from '../../../package.json';
import { vesselZone } from '../features/bathymetry';

export const backendVersion = pkg.version;

export const generateSources = (
  a_Config: IConfigJSON,
  a_4wingsEntry: I4wingsEntry,
) => {
  if (a_4wingsEntry.dataset.length !== 0) return a_4wingsEntry.dataset;
  // In unmatched cases, the dataset field is empty and we use the requested SAR dataset as the source.
  const sarDataset = Object.entries(a_Config.url_params)
    .filter(([, value]) => typeof value === 'string' && value.includes('sar'))
    .map(([, value]) => value)[0];
  return sarDataset as string;
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
  a_EventEntry: TGlobalEvent | null,
): 2 | 3 | 4 | null => {
  return a_EventEntry && a_EventEntry.type === EEventType.port_visit
    ? (Number(a_EventEntry.port_visit.confidence) as 2 | 3 | 4)
    : null;
};

export const generateConfidence_heuristic = (
  a_4wingsEntry: I4wingsEntry,
): EConfidenceTiers => {
  let confidenceScore = 0;

  const MEDIUM_THRESHOLD = 0.4;
  const HIGH_THRESHOLD = 0.7;
  // Detection-based confidence
  if (a_4wingsEntry.detections) {
    // detections is available in public-global-sar-presence dataset
    if (a_4wingsEntry.detections <= 1) {
      confidenceScore = 0.1;
    } else if (a_4wingsEntry.detections <= 3) {
      confidenceScore = 0.4;
    } else if (a_4wingsEntry.detections >= 4) {
      confidenceScore = 0.7;
    }

    // Noisy affect
    if (isNoisyCase(a_4wingsEntry)) {
      confidenceScore -= 0.2;
    }
  } else if (a_4wingsEntry.hours) {
    // other datasets have hours parameter
    if (a_4wingsEntry.hours < 2) {
      confidenceScore = 0.1;
    } else if (a_4wingsEntry.hours < 4) {
      confidenceScore = 0.4;
    } else if (a_4wingsEntry.hours >= 4) {
      confidenceScore = 0.7;
    }
  }

  // Clamp score to valid range
  confidenceScore = Math.max(0, Math.min(confidenceScore, 1));
  if (confidenceScore >= HIGH_THRESHOLD) {
    return EConfidenceTiers.high;
  }

  if (confidenceScore >= MEDIUM_THRESHOLD) {
    return EConfidenceTiers.medium;
  }

  return EConfidenceTiers.low;
};

export const generateRunMetadata = async (
  a_Configurations: IConfigJSON[],
  a_Events?: IEventSchema[],
  a_Start?: string,
  a_End?: string,
): Promise<IRunMetadata> => {
  const canonicalObject = deepSortObject(
    stripHiddenConfiguration(a_Configurations),
  );
  const canonicalString = JSON.stringify(canonicalObject);
  const config_hash = await hashString(canonicalString);

  const execution_duration_ms =
    a_Start && a_End ? getExecutionDuration(a_Start, a_End) : undefined;
  return {
    config_hash,
    config_json: canonicalObject,
    git_commit_version: a_Configurations[0].gitCommitSHA ?? 'N/A',
    run_time: new Date().toISOString(),
    dataset_version: a_Events
      ? a_Events.length > 0
        ? getSourcesFromEvents(a_Events)
        : undefined
      : undefined,
    context_layer_versions: a_Events
      ? a_Events.length > 0
        ? getContextLayersFromEvents(a_Events)
        : undefined
      : undefined,
    execution_duration_sec: execution_duration_ms
      ? Number((execution_duration_ms / 1000).toFixed(3))
      : undefined,
  };
};

export const generateScoring = (
  a_EventSchema: IEventSchema,
  a_Config: IConfigJSON,
): IScoring => {
  const thresholds = a_Config.threshold;
  let reason_codes: EReasonCodes[] = [];
  if (Object.keys(thresholds).length === 0) {
    reason_codes.push(EReasonCodesStatic.invalid_threshold_config);
    return {
      triage_score: null,
      uncertainty_score: null,
      reason_codes,
    };
  }
  const WEIGHTS = {
    base_uncertainty: thresholds.base_uncertainty_weight,

    missing_field: thresholds.missing_field_weight,
    noisy: thresholds.noisy_weight,
    unmatched: thresholds.unmatched_weight,

    near_coast_importance: thresholds.near_coast_importance_weight,
    eez_importance: thresholds.eez_importance_weight,
    mpa_importance: thresholds.mpa_importance_weight,

    missing_confidence_proxy: thresholds.missing_confidence_proxy_weight,
    low_confidence_proxy: thresholds.low_confidence_proxy_weight,

    low_confidence_tier: thresholds.low_confidence_tier_weight,
    medium_confidence_tier: thresholds.medium_confidence_tier_weight,
    high_confidence_tier: thresholds.high_confidence_tier_weight,
  };

  const entry = a_EventSchema.raw_metadata;

  const confidence_proxy = a_EventSchema.confidence_proxy;
  const confidence_tier = a_EventSchema.confidence_tier;

  const missings = Object.entries(WEIGHTS)
    .filter(([, v]) => v === undefined || !isNumber(v))
    .map(([k]) => k);

  if (missings.length > 0) {
    for (const missing of missings) {
      reason_codes.push(`missing_required_threshold_field:${missing}_weight`);
    }
    return {
      triage_score: null,
      uncertainty_score: null,
      reason_codes,
    };
  }

  // =========================
  // A. UNCERTAINTY (DATA QUALITY) - How much do we distrust this event?
  // =========================
  let uncertainty_score = WEIGHTS.base_uncertainty;
  const matched = a_EventSchema.matched_flag;

  const missingFields = missingRequiredFields(entry);

  if (missingFields.length > 0 && matched) {
    uncertainty_score += Math.min(
      missingFields.length * WEIGHTS.missing_field,
      0.4,
    );

    for (const field of missingFields) {
      reason_codes.push(`missing_required_field:${field}`);
    }
  }

  if (matched !== undefined) {
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
  }

  if (confidence_proxy === null) {
    uncertainty_score += WEIGHTS.missing_confidence_proxy;
    reason_codes.push(EReasonCodesStatic.missing_confidence_proxy);
  } else if (confidence_proxy <= thresholds.low_confidence_proxy_threshold) {
    uncertainty_score += WEIGHTS.low_confidence_proxy;
    reason_codes.push(EReasonCodesStatic.low_confidence_proxy);
  }

  if (confidence_tier === EConfidenceTiers.low) {
    uncertainty_score += WEIGHTS.low_confidence_tier;
    reason_codes.push(EReasonCodesStatic.low_confidence_tier);
  } else if (confidence_tier === EConfidenceTiers.high) {
    uncertainty_score += WEIGHTS.high_confidence_tier;
    reason_codes.push(EReasonCodesStatic.high_confidence_tier);
  } else if (confidence_tier === EConfidenceTiers.medium) {
    uncertainty_score += WEIGHTS.medium_confidence_tier;
    reason_codes.push(EReasonCodesStatic.medium_confidence_tier);
  }

  uncertainty_score = Number(
    Math.max(0, Math.min(1, uncertainty_score)).toFixed(2),
  );

  // =========================
  // B. IMPORTANCE (DOMAIN VALUE) - If this event is real, how important is it?
  // =========================
  let importance_score = 0;

  const inside_eez = a_EventSchema.context_layers.EEZ.enrichments.length > 0;

  const inside_mpa = a_EventSchema.context_layers.MPA.enrichments.length > 0;

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

  if (
    entry.vesselType.trim().toUpperCase() === EVessleType.Cargo &&
    inside_mpa
  ) {
    importance_score += 0.4; // high-risk combo
  }

  const bathymetry = a_EventSchema.context_layers.Bathymetry.enrichments;
  const { isShallowWater, isFishingZone, isDeepWater } = vesselZone(
    bathymetry.length > 0
      ? a_EventSchema.context_layers.Bathymetry.enrichments[0].value
      : undefined,
  );

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
  if (
    entry.vesselType.trim().toUpperCase() === EVessleType.Cargo &&
    (isFishingZone || isShallowWater)
  ) {
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
    Number((importance_score + uncertainty_score * 0.2).toFixed(2)),
  );

  return {
    triage_score,
    uncertainty_score,
    reason_codes,
  };
};

/**
 * Recompute `scoring` for a batch of served events against the CURRENT
 * request's `threshold`. An event served from the partition cache carries
 * whatever `scoring` was baked in by the request that originally populated
 * that partition (or, in dev fixture mode, the bundled sample's own scoring)
 * — potentially a different threshold than this request's. `generateScoring`
 * only reads immutable, already-cached facts off the event (`matched_flag`,
 * `confidence_proxy`/`confidence_tier`, `context_layers`,
 * `distance_to_coast_km`, `raw_metadata`) plus `a_Config.threshold`, so it's
 * safe and cheap to re-run unconditionally on every response.
 *
 * Must run before any score-based filtering (`applyFilter`'s
 * `triage_score_min`/`max`, `uncertainty_score_min`/`max`,
 * `reason_codes_include`/`exclude`) so those predicates evaluate against the
 * current config too, not a stale cached score.
 */
export const rescoreEvents = (
  a_Events: IEventSchema[],
  a_Config: IConfigJSON,
): IEventSchema[] =>
  a_Events.map((event) => ({
    ...event,
    scoring: generateScoring(event, a_Config),
  }));

/**
 * Stamp the events actually being returned with the `run_metadata` computed
 * for THIS request. A cached event's own `run_metadata` otherwise still
 * describes whichever request originally fetched it into the partition
 * (config hash, git commit, run time) — misleading for an exported evidence
 * bundle, which must reflect the query that actually produced it, not
 * whatever happened to populate the cache.
 */
export const stampRunMetadata = (
  a_Events: IEventSchema[],
  a_RunMetadata: IRunMetadata,
): IEventSchema[] =>
  a_Events.map((event) => ({ ...event, run_metadata: a_RunMetadata }));

export const generateGeom = (a_Lon: number, a_Lat: number): IGeometry => {
  return {
    type: EGeoJSONGeometryType.Point,
    coordinates: [a_Lon, a_Lat],
  };
};

export const generateVersion = () => {
  return backendVersion ?? '1';
};

export const generateCoordinate = (a_Coordinate: number) => {
  return +a_Coordinate.toFixed(3);
};

export const getISO8601 = (a_DateStr: string): string => {
  // Convert "YYYY-MM-DD HH:mm" → "YYYY-MM-DDTHH:mm:00Z"
  const iso =
    a_DateStr.replace(' ', 'T') + // "2025-10-15T05:00"
    ':00Z'; // "2025-10-15T05:00:00Z"

  return iso;
};
