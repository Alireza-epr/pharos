import {
  IConfigJSON,
  IEventSchema,
  IRejectedEventSchema,
  IRunMetadata,
  IScoring,
} from '../../types/eventTypes';
import {
  I4wingsEntry,
  TGlobalEvent,
} from '../../types/gfwTypes';
import {
  deepSortObject,
  getGitCommitSHA,
  hashString,
} from '../../utils/generalUtils';
import config from '../../config/globalFishingWatch.json';
import { EReasonCodes, ERejectedEventSchemaReasons } from '../../enum/generlaEnum';
import { IGeometry } from '../../types/geoJSONTypes';
import { EEventType } from '../../enum/gfwEnum';

export const createEventSchema = async (
  a_Configuration: Set<IConfigJSON>,
  a_4wingsEntry: I4wingsEntry,
  a_EventEntry?: TGlobalEvent,
): Promise<IEventSchema | IRejectedEventSchema> => {

  const validCoordinates = isValidCoordinate(a_4wingsEntry.lat, a_4wingsEntry.lon)

  if(!validCoordinates){
    return {
      reason: ERejectedEventSchemaReasons.notValidCoordinates,
      rejected: true,
      raw_metadata: a_4wingsEntry
    }
  }

  const version = generateVersion()

  const sources = generateSources(a_Configuration)

  const event_id = await generateEventId(
    a_4wingsEntry.entryTimestamp,
    a_4wingsEntry.lon,
    a_4wingsEntry.lat,
    sources,
  );

  const matched_flag = isMatchedCase(a_4wingsEntry);

  const confidence_fields = generateConfidence(a_EventEntry)

  const run_metadata = await generateRunMetadata(a_Configuration);

  const scoring = generateScoring(matched_flag, a_EventEntry);

  let geom: IGeometry = generateGeom(a_4wingsEntry)

  const eventSchema: IEventSchema = {
    version: version,
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
    geom: geom,
    rejected: false
  };

  return eventSchema;
};

export const generateSources = (a_Configuration: Set<IConfigJSON>) => {
  return Array.from(a_Configuration)
    .map((config) => config.source)
    .join(', ');
}

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
}

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

export const generateGeom = (a_4wingsEntry: I4wingsEntry): IGeometry => {
  return {
    type: "Point",
    coordinates: [a_4wingsEntry.lon, a_4wingsEntry.lat]
  }
}

export const isMatchedCase = (a_4wingsEntry: I4wingsEntry) => {
  return a_4wingsEntry.dataset.length !== 0;
};

export const isValidCoordinate = (a_Lat: any, a_Lon: any) => {
   if (!Number.isFinite(a_Lat) || !Number.isFinite(a_Lon)) return false;

  if (a_Lat < -90 || a_Lat > 90) return false;
  if (a_Lon < -180 || a_Lon > 180) return false;

  return true;
}

export const generateVersion = () => {
  return __APP_VERSION__ ?? '1'
}
