import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { point } from '@turf/helpers';
import {
  FeatureCollection,
  IMultiPolygonGeometry,
} from '../../types/geoJSONTypes';
import {
  EValidationFailureMode,
  EValidationLabel,
  ILandPolygonProperties,
  IValidationResp,
  IValidationSample,
  TValidationGeoJSON,
} from '../../types/validationTypes';
import { IConfigJSON, IEventSchema } from '../../types/eventTypes';
import { readLandPolygons } from './dataset';
import { detectionGetGFW, detectionPostGFW } from '../ingest/detections';
import {
  I4wingsAPIResponse,
  I4wingsReportGetURLParams,
  I4wingsReportPostBodyParams,
  I4wingsReportPostURLParams,
  IEventGetURLParams,
  T4wingsSource,
  TEventSource,
} from '../../types/gfwTypes';
import { getEntriesFrom4wingsResponse, log, sortEventSchema } from '../../utils/generalUtils';
import { ELogLevel } from '../../enum/generlaEnum';
import { createEventSchema } from '../normalize/schema';
import { EFetchMethods } from '../../enum/gfwEnum';

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
): IValidationSample => {
  const landPolygons = readLandPolygons();
  const isEventOnLand = isOnLand(
    landPolygons,
    a_EventSchema.lon,
    a_EventSchema.lat,
  );
  return {
    event_id: a_EventSchema.event_id,
    timestamp_utc: a_EventSchema.timestamp_utc,
    lon: a_EventSchema.lon,
    lat: a_EventSchema.lat,
    matched_flag: a_EventSchema.matched_flag,
    source: a_EventSchema.source,
    triage_score: a_EventSchema.scoring.triage_score,
    uncertainty_score: a_EventSchema.scoring.uncertainty_score,
    label: isEventOnLand ? EValidationLabel.FP : EValidationLabel.TP,
    failure_mode: isEventOnLand ? EValidationFailureMode.on_land : '',
    notes: '',
  };
};

export const generateValidationGeoJSON = (
  a_ValidationSample: IValidationSample,
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

export const getValidationSamples = async (
  a_BaseURL: string,
  a_Source: T4wingsSource,
  a_URLParam: I4wingsReportGetURLParams,
  a_Length: number,
): Promise<IValidationResp> => {
  const metadata: IConfigJSON = {
    source: a_Source,
    base_url: a_BaseURL,
    method: EFetchMethods.get,
    url_params: a_URLParam,
    body_params: null,
  };
  const configuration = new Set<IConfigJSON>();
  //log("Params:", JSON.stringify(a_URLParam), ELogLevel.message, "3")

  const resp4wings = await detectionGetGFW<I4wingsAPIResponse>(
    a_BaseURL,
    a_Source,
    a_URLParam,
  );

  const entries4wings = getEntriesFrom4wingsResponse(
    resp4wings.results,
    a_Source as T4wingsSource,
  );
  if (!entries4wings || entries4wings.length == 0) {
    log('Warning', 'No entry found!', ELogLevel.warning, '3');
    return {
      metadata,
      events: [],
      validationSamples: [],
      validationSamplesGeoJSON: [],
    };
  }
  const reducedEntriesNr = entries4wings.slice(0, a_Length);

  let eventSchemas: IEventSchema[] = [];
  let validationSamplesGeoJSON: TValidationGeoJSON[] = [];
  let validationSamples: IValidationSample[] = [];
  log(
    `Creating event schemas, no. entry: ${reducedEntriesNr.length}...`,
    '',
    ELogLevel.message,
    '3',
  );

  for (const entry4wings of reducedEntriesNr) {
    configuration.clear();
    configuration.add(resp4wings.metadata);
    const eventSchema = await createEventSchema(configuration, entry4wings);

    if (!eventSchema.rejected) {
      eventSchemas.push(eventSchema);
    }
  }

  const sortedEvents = sortEventSchema(eventSchemas)
  log('Creating validation GeoJSON samples...', '', ELogLevel.message, '3');
  for (const eventSchema of sortedEvents) {
    const validationSample = createValidationSample(eventSchema);
    validationSamples.push(validationSample);
    const validationSampleGeoJSON = generateValidationGeoJSON(validationSample);
    validationSamplesGeoJSON.push(validationSampleGeoJSON);
  }

  return {
    metadata,
    events: eventSchemas,
    validationSamples,
    validationSamplesGeoJSON,
  };
};

export const postValidationSamples = async (
  a_BaseURL: string,
  a_Source: T4wingsSource,
  a_URLParam: I4wingsReportPostURLParams,
  a_BodyParam: I4wingsReportPostBodyParams,
  a_Length: number,
): Promise<IValidationResp> => {
  const metadata: IConfigJSON = {
    source: a_Source,
    base_url: a_BaseURL,
    method: EFetchMethods.post,
    url_params: a_URLParam,
    body_params: a_BodyParam,
  };
  const configuration = new Set<IConfigJSON>();
  //log("Params:", JSON.stringify({...a_URLParam, ...a_BodyParam}), ELogLevel.message, "3")
  const resp4wings = await detectionPostGFW<I4wingsAPIResponse>(
    a_BaseURL,
    a_Source,
    a_URLParam,
    a_BodyParam,
  );

  const entries4wings = getEntriesFrom4wingsResponse(
    resp4wings.results,
    a_Source as T4wingsSource,
  );
  if (!entries4wings || entries4wings.length == 0) {
    log('Warning', 'No entry found!', ELogLevel.warning, '3');
    return {
      metadata,
      events: [],
      validationSamples: [],
      validationSamplesGeoJSON: [],
    };
  }
  const reducedEntriesNr = entries4wings.slice(0, a_Length);

  let eventSchemas: IEventSchema[] = [];
  let validationSamplesGeoJSON: TValidationGeoJSON[] = [];
  let validationSamples: IValidationSample[] = [];
  log(
    `Creating event schemas, no. entry: ${reducedEntriesNr.length}...`,
    '',
    ELogLevel.message,
    '3',
  );

  for (const entry4wings of reducedEntriesNr) {
    configuration.clear();
    configuration.add(resp4wings.metadata);
    const eventSchema = await createEventSchema(configuration, entry4wings);

    if (!eventSchema.rejected) {
      eventSchemas.push(eventSchema);
    }
  }

  log('Creating validation GeoJSON samples...', '', ELogLevel.message, '3');
  for (const eventSchema of eventSchemas) {
    const validationSample = createValidationSample(eventSchema);
    validationSamples.push(validationSample);
    const validationSampleGeoJSON = generateValidationGeoJSON(validationSample);
    validationSamplesGeoJSON.push(validationSampleGeoJSON);
  }

  return {
    metadata,
    events: eventSchemas,
    validationSamples,
    validationSamplesGeoJSON,
  };
};
