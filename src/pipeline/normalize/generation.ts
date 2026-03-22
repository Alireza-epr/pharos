import { EReasonCodes } from '../../enum/generlaEnum';
import { EEventType } from '../../enum/gfwEnum';
import { IConfigJSON, IRunMetadata, IScoring } from '../../types/eventTypes';
import { IGeometry } from '../../types/geoJSONTypes';
import { I4wingsEntry, TGlobalEvent } from '../../types/gfwTypes';
import {
  deepSortObject,
  getGitCommitSHA,
  hashString,
} from '../../utils/generalUtils';
import config from '../../config/globalFishingWatch.json';

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

export const generateConfidence = (a_EventEntry: TGlobalEvent | undefined) => {
  return a_EventEntry && a_EventEntry.type === EEventType.port_visit
    ? a_EventEntry.port_visit.confidence
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

export const generateScoring = (
  a_Matched: boolean,
  a_Event: TGlobalEvent | undefined,
): IScoring => {
  const confidence_proxy = 
    a_Event && a_Event.type === EEventType.port_visit 
    ? a_Event.port_visit.confidence
    : null

  const triage_score = confidence_proxy

  let reason_codes: EReasonCodes[] = [];
  let uncertainty_score = 0.2;

  if (!a_Matched) {
    reason_codes.push(EReasonCodes.unmatched_detection);
  }

  const near_coast = a_Event
    ? a_Event.distances.startDistanceFromShoreKm <=
      config.threshold.near_coast_threshold
    : false;
  if (near_coast) {
    uncertainty_score += 0.3;
    reason_codes.push(EReasonCodes.near_coast);
  }

  if(confidence_proxy === null){
    uncertainty_score += 0.3;
    reason_codes.push(EReasonCodes.missing_confidence_proxy);
  } else if(confidence_proxy <= config.threshold.low_detection_confidence_threshold) {
    uncertainty_score += 0.3;
    reason_codes.push(EReasonCodes.low_detection_confidence);
  }

  const inside_eez = a_Event ? a_Event.regions.eez.length > 0 : false;
  if (inside_eez) {
    reason_codes.push(EReasonCodes.inside_eez);
  }

  const inside_mpa = a_Event ? a_Event.regions.mpa.length > 0 : false;
  if (inside_mpa) {
    reason_codes.push(EReasonCodes.inside_mpa);
  }

  return {
    triage_score,
    uncertainty_score,
    reason_codes,
  };
};

export const generateGeom = (a_4wingsEntry: I4wingsEntry): IGeometry => {
  return {
    type: 'Point',
    coordinates: [a_4wingsEntry.lon, a_4wingsEntry.lat],
  };
};

export const generateVersion = () => {
  return __APP_VERSION__ ?? '1';
};
