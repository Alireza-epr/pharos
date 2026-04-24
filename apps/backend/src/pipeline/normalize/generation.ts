import { EReasonCodes, EReasonCodesStatic, EEventType } from '@packages/enum';
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
  const event = a_EventSchema.raw_event_metadata;
  const entry = a_EventSchema.raw_metadata;
  const confidence_proxy =
    event && event.type === EEventType.port_visit
      ? +event.port_visit.confidence
      : null;

  const triage_score = confidence_proxy;

  let reason_codes: EReasonCodes[] = [];
  let uncertainty_score = 0.2;

  const missingFields = missingRequiredFields(entry);
  for (const field of missingFields) {
    reason_codes.push(`missing_required_field:${field}`);
  }

  const noisy = isNoisyCase(entry);
  if (noisy) {
    reason_codes.push(EReasonCodesStatic.noisy_vessel);
  }

  const matched = isMatchedCase(entry);
  if (!matched) {
    reason_codes.push(EReasonCodesStatic.unmatched_to_public_ais);
  } else {
    reason_codes.push(EReasonCodesStatic.matched_to_public_ais);
  }

  const near_coast = isNearCoast(a_EventSchema.distance_to_coast_km);
  if (near_coast) {
    uncertainty_score += 0.3;
    reason_codes.push(EReasonCodesStatic.near_coast);
  }

  if (confidence_proxy === null) {
    //unmatched or without port event
    uncertainty_score += 0.3;
    reason_codes.push(EReasonCodesStatic.missing_confidence_proxy);
  } else if (
    //matched with port event
    confidence_proxy <= config.threshold.low_detection_confidence_threshold
  ) {
    uncertainty_score += 0.3;
    reason_codes.push(EReasonCodesStatic.low_detection_confidence);
  }

  const inside_eez = a_EventSchema.context_layers.EEZ.enrichments.length > 0 ? true : false
  if (inside_eez) {
    reason_codes.push(EReasonCodesStatic.inside_eez);
  }

  const inside_mpa = a_EventSchema.context_layers.MPA.enrichments.length > 0 ? true : false
  if (inside_mpa) {
    reason_codes.push(EReasonCodesStatic.inside_mpa);
  }

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
