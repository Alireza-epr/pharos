import {
  IConfigJSON,
  IEventSchema,
  IRejectedEventSchema,
} from '../../types/eventTypes';
import { I4wingsEntry, TGlobalEvent } from '../../types/gfwTypes';
import { ERejectedEventSchemaReasons } from '../../enum/generlaEnum';
import { IGeometry } from '../../types/geoJSONTypes';
import { EContextLayers } from '../../enum/gfwEnum';
import { generateEEZ } from '../features/eez';
import { generateRFMO } from '../features/rfmo';
import { generateMPA } from '../features/mpa';
import { distanceToCoast, generateDistanceToCoast } from '../features/coast_distance';
import { isISO8601Timestamp, isMatchedCase, isValidCoordinate } from './validation';
import {
  generateConfidence,
  generateCoordinate,
  generateEventId,
  generateGeom,
  generateRunMetadata,
  generateScoring,
  generateSources,
  generateVersion,
} from './generation';
import { coastlinePolylines } from '../sample';

export const createEventSchema = async (
  a_Configuration: Set<IConfigJSON>,
  a_4wingsEntry: I4wingsEntry,
  a_EventEntry?: TGlobalEvent,
): Promise<IEventSchema | IRejectedEventSchema> => {

  const validTimestamp = isISO8601Timestamp(a_4wingsEntry.entryTimestamp)
  if (!validTimestamp) {
    return {
      reason: ERejectedEventSchemaReasons.notValidTimestamp,
      rejected: true,
      raw_metadata: a_4wingsEntry,
    };
  }

  const timestamp_utc = a_4wingsEntry.entryTimestamp

  const validCoordinates = isValidCoordinate(
    a_4wingsEntry.lat,
    a_4wingsEntry.lon,
  );

  if (!validCoordinates) {
    return {
      reason: ERejectedEventSchemaReasons.notValidCoordinates,
      rejected: true,
      raw_metadata: a_4wingsEntry,
    };
  }

  const lon = generateCoordinate(a_4wingsEntry.lon) 
  const lat = generateCoordinate(a_4wingsEntry.lat) 

  const version = generateVersion();

  const sources = generateSources(a_Configuration);

  const event_id = await generateEventId(
    timestamp_utc,
    lon,
    lat,
    sources,
  );

  const matched_flag = isMatchedCase(a_4wingsEntry);

  const confidence_fields = generateConfidence(a_EventEntry);

  const run_metadata = await generateRunMetadata(a_Configuration);

  let geom: IGeometry = generateGeom(lon, lat);

  const eez = generateEEZ(a_EventEntry);
  const mpa = generateMPA(a_EventEntry);
  const rfmo = generateRFMO(a_EventEntry);

  const context_layers = {
    [EContextLayers.eez]: eez,
    [EContextLayers.mpa]: mpa,
    [EContextLayers.rfmo]: rfmo,
  };

  //const distance_to_coast_km = generateDistanceToCoast(a_EventEntry);
  const distance_to_coast_km = distanceToCoast(coastlinePolylines,a_4wingsEntry.lon, a_4wingsEntry.lat);
  
  const eventSchema: IEventSchema = {
    version: version,
    event_id,
    timestamp_utc,
    matched_flag,
    confidence_fields,
    lat,
    lon,
    source: sources,
    raw_metadata: a_4wingsEntry,
    raw_event_metadata: a_EventEntry ?? null,
    run_metadata,
    context_layers,
    distance_to_coast_km,
    scoring: {
      triage_score: null,
      uncertainty_score: null,
      reason_codes: null
    },
    geom: geom,
    rejected: false,
  };

  const scoring = generateScoring(eventSchema);

  return {
    ...eventSchema,
    scoring
  };
};
