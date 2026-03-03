import {
  IConfigJSON,
  IEventSchema,
  IRunMetadata,
  IScoring,
} from '../types/eventTypes';
import {
  I4wingsEntry,
  I4wingsAPIResponse,
  TGlobalEvent,
  T4wingsSource,
  I4wingsReportPostBodyParams,
  IEventPostBodyParams,
} from '../types/gfwTypes';
import {
  deepSortObject,
  getGitCommitSHA,
  hashString,
  log,
} from '../utils/generalUtils';
import config from '../config/globalFishingWatch.json';
import { EReasonCodes } from '../enum/generlaEnum';
import { IGeometry } from '../types/geoJSONTypes';
import { E4wingsDatasets, EEventType } from '../enum/gfwEnum';

export const createEventSchema = async (
  a_Configuration: Set<IConfigJSON>,
  a_4wingsEntry: I4wingsEntry,
  a_EventEntry?: TGlobalEvent,
): Promise<IEventSchema> => {
  const sources = Array.from(a_Configuration)
    .map((config) => config.source)
    .join(', ');

  const event_id = await generateEventId(
    a_4wingsEntry.entryTimestamp,
    a_4wingsEntry.lon,
    a_4wingsEntry.lat,
    sources,
  );

  const matched_flag = isMatchedCase(a_4wingsEntry);

  const confidence_fields =
    a_EventEntry && a_EventEntry.type === EEventType.port_visit
      ? a_EventEntry.port_visit.confidence
      : null;

  const run_metadata = await generateRunMetadata(a_Configuration);

  const scoring = generateScoring(matched_flag, a_EventEntry);

  let geom: IGeometry | undefined;

  const configJSON = Array.from(a_Configuration).find(
    (config) => config.body_params !== null,
  );
  if (configJSON) {
    if (configJSON.body_params) {
      // 4wings request
      if ((configJSON.body_params as I4wingsReportPostBodyParams).geojson) {
        geom = (configJSON.body_params as I4wingsReportPostBodyParams).geojson;
      } else if ((configJSON.body_params as IEventPostBodyParams).geometry) {
        // event request
        geom = (configJSON.body_params as IEventPostBodyParams).geometry;
      }
    }
  }

  const eventSchema: IEventSchema = {
    version: 1,
    event_id,
    timestamp_utc: a_4wingsEntry.entryTimestamp,
    matched_flag,
    confidence_fields,
    lat: a_4wingsEntry.lat,
    lon: a_4wingsEntry.lon,
    source: sources,
    raw_metadata: a_4wingsEntry,
    raw_event_metadata: a_EventEntry ?? null,
    run_metadata,
    scoring,
    geom: geom ?? null,
  };

  return eventSchema;
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

export const generateRunMetadata = async (
  a_Configuration: Set<IConfigJSON>,
): Promise<IRunMetadata> => {
  const canonicalObject = deepSortObject(Array.from(a_Configuration));
  const canonicalString = JSON.stringify(canonicalObject);
  const config_hash = await hashString(canonicalString);

  return {
    code_version: getGitCommitSHA(),
    config_json: a_Configuration,
    config_hash,
  };
};

export const generateScoring = (
  a_Matched: boolean,
  a_Event: TGlobalEvent | undefined,
): IScoring => {
  const triage_score =
    a_Event && a_Event.type === EEventType.port_visit
      ? a_Event.port_visit.confidence
      : 1;

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

  const low_detection_confidence =
    a_Event && a_Event.type === EEventType.port_visit
      ? a_Event.port_visit.confidence <=
        config.threshold.low_detection_confidence_threshold
      : false;
  if (low_detection_confidence) {
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

export const getSourceFrom4wingsResponse = (
  a_4wingsResponse: I4wingsAPIResponse,
  a_Dataset: E4wingsDatasets,
) => {
  const source = a_4wingsResponse.entries
    .flatMap((entry) => Object.keys(entry))
    .find((source) => source.startsWith(a_Dataset));
  return source as T4wingsSource;
};

export const getEntriesFrom4wingsResponse = (
  a_4wingsResponse: I4wingsAPIResponse,
  a_Source: T4wingsSource,
) => {
  for (const responseEntry of a_4wingsResponse.entries) {
    const entries = responseEntry[a_Source];
    if (entries) return entries;
  }

  return undefined;
};

export const isMatchedCase = (a_4wingsEntry: I4wingsEntry) => {
  return a_4wingsEntry.dataset.length !== 0;
};
