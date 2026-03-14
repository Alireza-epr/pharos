import { EReasonCodes, ERejectedEventSchemaReasons } from '../enum/generlaEnum';
import { EContextLayerDatasets, EContextLayers, EFetchMethods } from '../enum/gfwEnum';
import { IGeometry } from './geoJSONTypes';
import {
  I4wingsEntry,
  I4wingsReportPostBodyParams,
  I4wingsReportPostURLParams,
  IEventPostBodyParams,
  IEventPostURLParams,
  T4wingsSource,
  TEventSource,
  TGlobalEvent,
} from './gfwTypes';

export interface IRunMetadata {
  config_hash: string;
  config_json: IConfigJSON[];
  code_version: string;
}

export interface IScoring {
  triage_score: number | null;
  uncertainty_score: number | null;
  reason_codes: EReasonCodes[] | null;
}

export interface IEventSchema {
  distance_to_coast_km: number | null,
  context_layers: Record< EContextLayers, IContextLayer>
  version: string;
  event_id: string;
  timestamp_utc: string;
  lon: number;
  lat: number;
  geom: IGeometry;
  matched_flag: boolean;
  source: string;
  confidence_fields: 2 | 3 | 4 | null;
  raw_metadata: I4wingsEntry;
  raw_event_metadata: TGlobalEvent | null;
  run_metadata: IRunMetadata;
  scoring: IScoring;
  rejected: boolean
}

export interface IRejectedEventSchema {
  rejected: boolean,
  reason: ERejectedEventSchemaReasons,
  raw_metadata: I4wingsEntry
}

export interface IConfigJSON {
  source: T4wingsSource | TEventSource;
  base_url: string;
  method: EFetchMethods;
  url_params: I4wingsReportPostURLParams | IEventPostURLParams | null;
  body_params: I4wingsReportPostBodyParams | IEventPostBodyParams | null;
}

export interface IContextLayerEnrichment {
  id: string,
  label: string
}
export interface IContextLayer {
  dataset: EContextLayerDatasets,
  version: string,
  enrichments: IContextLayerEnrichment[]
}