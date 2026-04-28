import {
  IConfigJSON,
  IEventSchema,
  IRejectedEventSchema,
  I4wingsEntry,
  TGlobalEvent,
  IGeometry,
} from '@packages/types';
import { ERejectedEventSchemaReasons, EContextLayers } from '@packages/enum';
import { getEEZContext } from '../features/eez';
import { getMPAContext } from '../features/mpa';
import { distanceToCoast } from '../features/coast_distance';
import {
  isISO8601Timestamp,
  isMatchedCase,
  isValidCoordinate,
  isVesselTypeValid,
} from './validation';
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
import { coastlinePolylines, eezPolygons, mpaPolygons } from '../sample';
import { getHotspotCellId } from '../aggregate/hotspots';
import { getBathymetryContext } from '../features/bathymetry_cached';

export const createEventSchema = async (
  a_Configuration: Set<IConfigJSON>,
  a_HotspotResolution: number,
  a_4wingsEntry: I4wingsEntry,
): Promise<IEventSchema | IRejectedEventSchema> => {
  const validTimestamp = isISO8601Timestamp(a_4wingsEntry.entryTimestamp);
  if (!validTimestamp) {
    return {
      reason: ERejectedEventSchemaReasons.notValidTimestamp,
      rejected: true,
      raw_metadata: a_4wingsEntry,
    };
  }

  const validVesselType = isVesselTypeValid(a_4wingsEntry.vesselType);
  if (!validVesselType) {
    return {
      reason: ERejectedEventSchemaReasons.notValidVesselType,
      rejected: true,
      raw_metadata: a_4wingsEntry,
    };
  }

  const timestamp_utc = a_4wingsEntry.entryTimestamp;

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

  const lon = generateCoordinate(a_4wingsEntry.lon);
  const lat = generateCoordinate(a_4wingsEntry.lat);

  const version = generateVersion();

  const sources = generateSources(a_Configuration);

  const event_id = await generateEventId(timestamp_utc, lon, lat, sources);

  const matched_flag = isMatchedCase(a_4wingsEntry);

  //const confidence_proxy = generateConfidence(a_EventEntry);

  const run_metadata = await generateRunMetadata(a_Configuration);

  let geom: IGeometry = generateGeom(lon, lat);

  //const eez = generateEEZ(a_EventEntry);
  const eez = getEEZContext(eezPolygons, lon, lat);
  //const mpa = generateMPA(a_EventEntry);
  const mpa = getMPAContext(mpaPolygons, lon, lat);
  //const rfmo = generateRFMO(a_EventEntry);
  const bathymetry = await getBathymetryContext(lon, lat);

  const context_layers = {
    [EContextLayers.eez]: eez,
    [EContextLayers.mpa]: mpa,
    [EContextLayers.bathymetry]: bathymetry,
    //[EContextLayers.rfmo]: rfmo,
  };

  //const distance_to_coast_km = generateDistanceToCoast(a_EventEntry);
  const distance_to_coast_km = distanceToCoast(
    coastlinePolylines,
    a_4wingsEntry.lon,
    a_4wingsEntry.lat,
  );

  const hotspot_cell_id = getHotspotCellId(lat, lon, a_HotspotResolution);

  const eventSchema: IEventSchema = {
    version: version,
    event_id,
    timestamp_utc,
    matched_flag,
    confidence_proxy: null,
    lat,
    lon,
    source: sources,
    raw_metadata: a_4wingsEntry,
    raw_event_metadata: null,
    run_metadata,
    context_layers,
    distance_to_coast_km,
    scoring: {
      triage_score: null,
      uncertainty_score: null,
      reason_codes: null,
    },
    geom: geom,
    rejected: false,
    hotspot_cell_id,
  };

  const scoring = generateScoring(eventSchema);

  return {
    ...eventSchema,
    scoring,
  };
};
