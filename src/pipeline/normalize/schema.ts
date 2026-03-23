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
import { generateDistanceToCoast } from '../features/coast_distance';
import { isMatchedCase, isValidCoordinate } from './validation';
import {
  generateConfidence,
  generateEventId,
  generateGeom,
  generateRunMetadata,
  generateScoring,
  generateSources,
  generateVersion,
} from './generation';

export const createEventSchema = async (
  a_Configuration: Set<IConfigJSON>,
  a_4wingsEntry: I4wingsEntry,
  a_EventEntry?: TGlobalEvent,
): Promise<IEventSchema | IRejectedEventSchema> => {
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

  const version = generateVersion();

  const sources = generateSources(a_Configuration);

  const event_id = await generateEventId(
    a_4wingsEntry.entryTimestamp,
    a_4wingsEntry.lon,
    a_4wingsEntry.lat,
    sources,
  );

  const matched_flag = isMatchedCase(a_4wingsEntry);

  const confidence_fields = generateConfidence(a_EventEntry);

  const run_metadata = await generateRunMetadata(a_Configuration);

  const scoring = generateScoring(a_4wingsEntry, a_EventEntry);

  let geom: IGeometry = generateGeom(a_4wingsEntry);

  const eez = generateEEZ(a_EventEntry);
  const mpa = generateMPA(a_EventEntry);
  const rfmo = generateRFMO(a_EventEntry);

  const context_layers = {
    [EContextLayers.eez]: eez,
    [EContextLayers.mpa]: mpa,
    [EContextLayers.rfmo]: rfmo,
  };

  const distance_to_coast_km = generateDistanceToCoast(a_EventEntry);

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
    context_layers,
    distance_to_coast_km,
    scoring,
    geom: geom,
    rejected: false,
  };

  return eventSchema;
};
