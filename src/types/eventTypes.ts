import { EReasonCodes } from '../enum/generlaEnum';
import { EFetchMethods } from '../enum/gfwEnum';
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
  config_json: Set<IConfigJSON>;
  code_version: string;
}

export interface IScoring {
  triage_score: number | null;
  uncertainty_score: number | null;
  reason_codes: EReasonCodes[] | null;
}

export interface IEventSchema {
  version: number;
  event_id: string;
  timestamp_utc: string;
  lon: number;
  lat: number;
  geom: IGeometry | null;
  matched_flag: boolean;
  source: string;
  confidence_fields: 2 | 3 | 4 | null;
  raw_metadata: I4wingsEntry;
  raw_event_metadata: TGlobalEvent | null;
  run_metadata: IRunMetadata;
  scoring: IScoring;
}

export interface IConfigJSON {
  source: T4wingsSource | TEventSource;
  base_url: string;
  method: EFetchMethods;
  url_params: I4wingsReportPostURLParams | IEventPostURLParams | null;
  body_params: I4wingsReportPostBodyParams | IEventPostBodyParams | null;
}
