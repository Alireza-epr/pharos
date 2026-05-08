import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { point } from '@turf/helpers';
import {
  FeatureCollection,
  IMultiPolygonGeometry,
  IConfigJSON,
  IEventSchema,
  I4wingsAPIResponse,
} from '@packages/types';
import {
  EValidationFailureMode,
  EValidationLabel,
  ILandPolygonProperties,
  IValidationResp,
  TValidationSample,
  TValidationGeoJSON,
} from '../../helpers/types/validationTypes';
import { detectionGFW } from '../ingest/detections';
import {
  getEntriesFrom4wingsResponse,
  log,
} from '../../helpers/utils/backendUtils';
import { createEventSchema } from '../schema/main';
import { ELogType } from '../../helpers/types/generalTypes';
import { landPolygons } from '../sample';

export const isOnLand = (
  a_LandPolygons: FeatureCollection<
    IMultiPolygonGeometry,
    ILandPolygonProperties
  >,
  a_Lon: number,
  a_Lat: number,
): boolean => {
  const pt = point([a_Lon, a_Lat]);

  return a_LandPolygons.features.some((feature) =>
    booleanPointInPolygon(pt, feature),
  );
};

export const createValidationSample = (
  a_EventSchema: IEventSchema,
): TValidationSample => {
  const isEventOnLand = isOnLand(
    landPolygons,
    a_EventSchema.lon,
    a_EventSchema.lat,
  );

  let reason_codes = a_EventSchema.scoring.reason_codes?.join(', ').trim();
  return {
    event_id: a_EventSchema.event_id,
    timestamp_utc: a_EventSchema.timestamp_utc,
    lon: a_EventSchema.lon,
    lat: a_EventSchema.lat,
    matched_flag: a_EventSchema.matched_flag,
    bathymetry:
      a_EventSchema.context_layers.Bathymetry.enrichments[0].value ?? '',
    source: a_EventSchema.source,
    triage_score: a_EventSchema.scoring.triage_score,
    uncertainty_score: a_EventSchema.scoring.uncertainty_score,
    label: isEventOnLand ? EValidationLabel.FP : EValidationLabel.TP,
    failure_mode: isEventOnLand ? EValidationFailureMode.on_land : '',
    notes: reason_codes ?? '',
  };
};

export const generateValidationGeoJSON = (
  a_ValidationSample: TValidationSample,
): TValidationGeoJSON => {
  return {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [a_ValidationSample.lon, a_ValidationSample.lat],
    },
    properties: a_ValidationSample,
  };
};

export const validationSamples = async (
  a_Config: IConfigJSON,
  a_Length: number,
): Promise<IValidationResp> => {
  log(
    'Params: ' + JSON.stringify(a_Config),
    ELogType.info,
  );
  const resp4wings = await detectionGFW<I4wingsAPIResponse>(
    a_Config
  );

  const entriesMap = getEntriesFrom4wingsResponse(
    a_Config,
    resp4wings,
  );

  const entries4wings = Array.from(entriesMap).flatMap( ([source, entries]) => entries )
  if (!entries4wings || entries4wings.length == 0) {
    log('[validationSamples] No entry found!', ELogType.warn);
    return {
      events: [],
      validationSamples: [],
      validationSamplesGeoJSON: [],
    };
  }
  const reducedEntriesNr = entries4wings.slice(0, a_Length);

  let eventSchemas: IEventSchema[] = [];
  let validationSamplesGeoJSON: TValidationGeoJSON[] = [];
  let validationSamples: TValidationSample[] = [];
  log(
    `Creating event schemas, entry count: ${reducedEntriesNr.length}...`,
    ELogType.info,
  );

  for (const entry4wings of reducedEntriesNr) {
    const eventSchema = await createEventSchema(
      a_Config,
      entry4wings,
    );

    if (!eventSchema.rejected) {
      eventSchemas.push(eventSchema);
    } else {
      log(`Entry is rejected: ${eventSchema.reason}`, ELogType.error);
    }
  }

  log('Creating validation GeoJSON samples...', ELogType.info);
  for (const eventSchema of eventSchemas) {
    const validationSample = createValidationSample(eventSchema);
    validationSamples.push(validationSample);
    const validationSampleGeoJSON = generateValidationGeoJSON(validationSample);
    validationSamplesGeoJSON.push(validationSampleGeoJSON);
  }

  return {
    events: eventSchemas,
    validationSamples,
    validationSamplesGeoJSON,
  };
};