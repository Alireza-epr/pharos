import {
  E4wingsDatasets,
  EEventDatasets,
  EEventType,
  EGearType,
  EMaritimeIdentificationDigits,
  ENeuralVesselType,
  ESpeedRange,
  EVessleType,
} from "@packages/enum";
import { IGeometry } from "./geoJSONTypes";

export interface IFishingEffortFilters {
  flag: EMaritimeIdentificationDigits; // flag in ('ESP', 'USA')
  geartype: EGearType;
  vessel_id: string;
  distance_from_port_km: 0 | 1 | 2 | 3 | 4 | 5; // kilometers
}

export interface ISARVesselDetectionsFilters {
  matched?: boolean;
  flag?: EMaritimeIdentificationDigits;
  vessel_id?: string;
  geartype?: EGearType;
  neural_vessel_type?: ENeuralVesselType;
  shiptype?: EVessleType;
}

export interface IAISVesselPresenceFilters {
  flag: EMaritimeIdentificationDigits;
  vessel_type: EVessleType;
  speed: ESpeedRange;
}

export type T4wingsFilter =
  | IFishingEffortFilters
  | ISARVesselDetectionsFilters
  | IAISVesselPresenceFilters;

/**
 * Report - URL Parameters for both POST and GET requests
 */
export interface I4wingsReportPostURLParams {
  "spatial-resolution"?: "LOW" | "HIGH"; // Low means at 10th degree resolution, High means at 100th degree resolution
  format: "CSV" | "TIF" | "JSON";
  "group-by"?: "VESSEL_ID" | "FLAG" | "GEARTYPE" | "FLAGANDGEARTYPE" | "MMSI";
  "temporal-resolution": "HOURLY" | "DAILY" | "MONTHLY" | "YEARLY" | "ENTIRE";
  [key: `datasets[${number}]`]: T4wingsSource;
  [key: `filters[${number}]`]: string;
  "date-range"?: string;
  "spatial-aggregation"?: boolean;
}

/**
 * Report - URL Parameters only for GET request
 * This method supports caching, which is highly beneficial for frontend/UI applications to prevent redundant requests.
 * Cached requests can be stored and reused, significantly improving response times.
 * Additionally, Global Fishing Watch caches GET requests at the gateway level.
 * If a user is expected to call the same URL multiple times, this can result in a substantial performance improvement.
 */
export interface I4wingsReportGetURLParams extends I4wingsReportPostURLParams {
  "region-dataset": "public-eez-areas" | "public-mpa-all";
  "region-id": string;
  "buffer-operation"?: "DIFFERENCE" | "DISSOLVE";
  "buffer-unit"?:
    | "MILES"
    | "NAUTICALMILES"
    | "KILOMETERS"
    | "RADIANS"
    | "DEGREES";
  "buffer-value"?: string;
}

/**
 * Report - Body only for POST request
 * Use this method to send a custom polygon.
 * This functionality is not available with the GET method.
 */
export interface I4wingsReportPostBodyParams {
  geojson?: IGeometry;
  region?: string;
  "region.dataset"?: "public-eez-areas" | "public-mpa-all";
  "region.id"?: string;
  "region.bufferOperation"?: "DIFFERENCE" | "DISSOLVE";
  "region.bufferUnit"?:
    | "MILES"
    | "NAUTICALMILES"
    | "KILOMETERS"
    | "RADIANS"
    | "DEGREES";
  "region.bufferValue"?: string;
}

export interface I4wingsAPIResponse {
  total: number;
  limit: number | null;
  offset: number | null;
  nextOffset: number | null;
  metadata: Record<string, unknown>;
  entries: Record<T4wingsSource, I4wingsEntry[]>[];
}

export interface I4wingsEntry {
  callsign: string;
  dataset: string;
  date: string; // format: YYYY-MM
  detections: number;
  entryTimestamp: string; // ISO string
  exitTimestamp: string; // ISO string
  firstTransmissionDate: string;
  flag: string;
  geartype: string;
  imo: string;
  lastTransmissionDate: string;
  lat: number;
  lon: number;
  mmsi: string;
  shipName: string;
  vesselId: string;
  vesselType: string;
}

/**
 * Event - URL Parameters for both POST and GET requests
 * We recommend use the GET endpoint if you are using the API from a Web APP because you can take advantage of the Browser cache to improve the load speed
 * Offset into the search results, used for pagination. It starts at 0.
 * It is used in combination with the param “limit”, for example you send limit = 5 and you get in the response total vessels =10.
 * So, If you send offset =0 OR you don’t send it, you will get the first 5 results (first page).
 * Therefore, in order to get the second page, you need to send offset = 5 which is the position of the first element you want from the second page. Example: 5
 */
export interface IEventPostURLParams {
  limit: number;
  offset: number;
  sort?: `+${string}` | `-${string}`; // ascending + (ASC) or descending - (DESC)
}

export interface IEventGetURLParams extends IEventPostURLParams {
  [key: `datasets[${number}]`]: TEventSource;
  [key: `vessels[${number}]`]: string;
  types?: "ENCOUNTER" | "FISHING" | "LOITERING" | "GAP" | "PORT_VISIT";
  "start-date"?: string;
  "end-date"?: string;
  "include-regions"?: boolean;
  confidences?: string; // Possible values: 2, 3, 4 Example: 3,4
  "encounter-types"?:
    | "FISHING-CARRIER"
    | "FISHING-SUPPORT"
    | "FISHING-BUNKER"
    | "FISHING-FISHING"
    | "FISHING-TANKER"
    | "CARRIER-BUNKER"
    | "BUNKER-SUPPORT";
  "vessel-types"?: EVessleType;
}

export interface IEventPostBodyParams {
  datasets: TEventSource[];
  vessels: string[];
  types?: "ENCOUNTER" | "FISHING" | "LOITERING" | "GAP" | "PORT_VISIT";
  startDate?: string;
  endDate?: string;
  //"include-regions"?: boolean,
  confidences?: string; // Possible values: 2, 3, 4 Example: 3,4
  encounterTypes?:
    | "FISHING-CARRIER"
    | "FISHING-SUPPORT"
    | "FISHING-BUNKER"
    | "FISHING-FISHING"
    | "FISHING-TANKER"
    | "CARRIER-BUNKER"
    | "BUNKER-SUPPORT";
  duration?: number; // Minimum duration (greater than or equal to), in minutes, of the event. Example: 30
  vesselTypes?: EVessleType[];
  vesselGroups?: string[]; // Ids of the vessel groups. Must be an array Example: ['my-vessel-group']
  flags?: string[]; // Flags of the vessels involved in the events, in ISO3. Must be an array. Example: ['ESP', 'FRA']
  geometry?: IGeometry; // Region where the events happen.
  region?: {};
  "region.id"?: {};
  "region.dataset"?: {};
}

export interface IEventAPIResponse<T> {
  metadata: IMetadata;
  limit: number;
  offset: number;
  nextOffset: number | null;
  total: number;
  entries: T[];
}

export interface IMetadata {
  datasets: string[];
  vessels: string[];
  dateRange: {
    from: string | null;
    to: string | null;
  };
  encounterTypes?: string[];
  geometry?: any;
}

export interface IPosition {
  lat: number;
  lon: number;
}

export interface IRegions {
  mpa: string[];
  eez: string[];
  rfmo: string[];
  fao: string[];
  majorFao: string[];
  eez12Nm: string[];
  highSeas: string[];
  mpaNoTakePartial: string[];
  mpaNoTake: string[];
}

export interface IDistances {
  startDistanceFromShoreKm: number; //At the beginning of the detection/event, the vessel was km away from shore.
  endDistanceFromShoreKm: number; //At the end of the event, it was km from shore.
  startDistanceFromPortKm: number; //Distance from the nearest port (in km) at event start.
  endDistanceFromPortKm: number; //Distance from the nearest port (in km) at event end.
}

export interface IVessel {
  id: string;
  name: string;
  ssvid: string;
  flag?: string;
  type?: string;
  nextPort?: string | null;
}

export interface IVesselWithDetails extends IVessel {
  flag: string;
  type: string;
  nextPort: string | null;
}

export interface IBaseEvent {
  id: string;
  type: EEventType;
  start: string;
  end: string;
  position: IPosition;
  regions: IRegions;
  boundingBox: number[];
  distances: IDistances;
  vessel: IVessel;
}

export interface IFishingEvent extends IBaseEvent {
  type: EEventType.fishing;
  fishing: {
    totalDistanceKm: number;
    averageSpeedKnots: number;
    averageDurationHours: number;
    potentialRisk: boolean;
  };
}

export interface IEncounterEvent extends IBaseEvent {
  type: EEventType.encounter;
  encounter: {
    vessel: {
      id: string;
      flag: string;
      name: string;
      type: string;
      ssvid: string;
    };
    medianDistanceKilometers: number;
    medianSpeedKnots: number;
    type: string;
    potentialRisk: boolean;
  };
}

export interface ILoiteringEvent extends IBaseEvent {
  type: EEventType.loitering;
  loitering: {
    totalTimeHours: number;
    totalDistanceKm: number;
    averageSpeedKnots: number;
    averageDistanceFromShoreKm: number;
  };
}

export interface IPortVisitEvent extends IBaseEvent {
  type: EEventType.port_visit;
  port_visit: {
    visitId: string;
    confidence: "2" | "3" | "4";
    durationHrs: number;
    startAnchorage: IAnchorage;
    intermediateAnchorage: IAnchorage;
    endAnchorage: IAnchorage;
  };
}

export interface IGapEvent extends IBaseEvent {
  type: EEventType.gap;
  vessel: IVesselWithDetails;

  gap: {
    intentionalDisabling: boolean;

    // API returns these as strings
    distanceKm: string;
    impliedSpeedKnots: string;

    durationHours: number;
    positions12HoursBeforeSat: string;
    positionsPerDaySatReception: number;

    offPosition: IPosition;
    onPosition: {
      lat: string; // API returns string
      lon: string; // API returns string
    };
  };
}

export interface IAnchorage {
  anchorageId: string;
  atDock: boolean;
  distanceFromShoreKm: number;
  flag: string;
  id: string;
  lat: number;
  lon: number;
  name: string;
  topDestination: string;
}

export type TGlobalEvent =
  | IGapEvent
  | IFishingEvent
  | IEncounterEvent
  | ILoiteringEvent
  | IPortVisitEvent;

export type T4wingsSource = `${E4wingsDatasets}:v${number}.${number}`;
export type TEventSource = `${EEventDatasets}:v${number}.${number}`;
