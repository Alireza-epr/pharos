import {
  EReasonCodes,
  ERejectedEventSchemaReasons,
  EContextLayerDatasets,
  EContextLayers,
  EFetchMethods,
  EHotspotTimeBins,
  EConfidenceTiers,
} from "@packages/enum";
import { IGeometry } from "./geoJSONTypes";
import {
  I4wingsEntry,
  I4wingsReportGetURLParams,
  I4wingsReportPostBodyParams,
  I4wingsReportPostURLParams,
  IEventPostBodyParams,
  IEventPostURLParams,
  T4wingsSource,
  TEventSource,
  TGlobalEvent,
} from "./gfwTypes";
import { TBuildRange } from "./generalTypes";

export interface IContextLayer {
  dataset: EContextLayerDatasets;
  version: string;
  enrichments: IContextLayerEnrichment[];
}

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

export interface IHotspot {
  cell_id: string;
  time_bin: string;
  count_total: number;
  count_unmatched: number;
  count_high_score_unmatched: number;
  mean_score: number | null;
  mean_uncertainty: number | null;
  pct_near_coast: number;
  recurrence_count: number;
  time_bins_total: number;
  time_bins_with_unmatched: number;
}

export interface IEventSchema {
  distance_to_coast_km: number;
  context_layers: Record<EContextLayers, IContextLayer>;
  version: string;
  event_id: string;
  timestamp_utc: string;
  lon: number;
  lat: number;
  geom: IGeometry;
  matched_flag: boolean | undefined;
  source: string;
  confidence_proxy: 2 | 3 | 4 | null;
  confidence_tier: EConfidenceTiers;
  raw_metadata: I4wingsEntry;
  raw_event_metadata: TGlobalEvent | null;
  run_metadata: IRunMetadata;
  scoring: IScoring;
  rejected: false;
  hotspot_cell_id: string;
}

export interface IRejectedEventSchema {
  rejected: true;
  reason: ERejectedEventSchemaReasons;
  raw_metadata: I4wingsEntry;
}

export interface IConfigJSON {
  URL: string;
  method: EFetchMethods
  body_params: I4wingsReportPostBodyParams;
  url_params: I4wingsReportGetURLParams;
  threshold: IThresholdConfig;
  hotspot: IHotspotConfig;
  output: string;
}

export interface IThresholdConfig {
  near_coast_threshold: number,
  low_confidence_proxy_threshold: number,
  shallow_water_threshold: number,
  deep_water_threshold: number,
  low_triage_score_threshold: number,
  medium_triage_score_threshold: number,
  high_triage_score_threshold: number
}

export interface IHotspotConfig {
  resolution: TBuildRange<16>,
  timeBin: EHotspotTimeBins
}

export interface IContextLayerEnrichment {
  id?: string;
  label?: string;
  value?: string;
}
export interface IContextLayer {
  dataset: EContextLayerDatasets;
  version: string;
  enrichments: IContextLayerEnrichment[];
}
