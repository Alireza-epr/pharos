import {
  EReasonCodes,
  ERejectedEventSchemaReasons,
  EContextLayerDatasets,
  EContextLayers,
  EFetchMethods,
  EHotspotTimeBins,
  EConfidenceTiers,
  EHotspotStrength,
  EThresholdConfig,
} from "@packages/enum";
import { IGeometry } from "./geoJSONTypes";
import {
  I4wingsEntry,
  I4wingsReportGetURLParams,
  I4wingsReportPostBodyParams,
  TGlobalEvent,
} from "./gfwTypes";
import { TBuildRange } from "./generalTypes";
import { IFilteringParams } from "./routeTypes";

export interface IContextLayer {
  dataset: EContextLayerDatasets;
  version: string;
  enrichments: IContextLayerEnrichment[];
}

export interface IRunMetadata {
  config_hash: string;
  config_json: IConfigJSON[];
  git_commit_version: string;
  run_time: string,
  dataset_version: string | undefined, 
  context_layer_versions: string | undefined,
  execution_duration_sec: number | undefined
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
  run_metadata: IRunMetadata | null;
  scoring: IScoring;
  rejected: false;
  hotspot: IEventHotspot | null;
}

export interface IEventHotspot {
  cell_id: string;
  signals: IEventHotspotSignal;
}

export interface IEventHotspotSignal extends Pick<
  IHotspot,
  "recurrence_count" | "time_bins_with_unmatched"
> {
  hotspot_strength: EHotspotStrength;
}

export interface IRejectedEventSchema extends Pick<
  IEventSchema,
  "run_metadata" | "raw_metadata" | "raw_event_metadata" | "version"
> {
  reasons: ERejectedEventSchemaReasons[];
  rejected: true;
}

export interface IConfigJSON {
  URL: string;
  method: EFetchMethods;
  body_params: I4wingsReportPostBodyParams;
  url_params: I4wingsReportGetURLParams;
  threshold: Record<EThresholdConfig, number>;
  hotspot: IHotspotConfig;
  output?: string;
  filter: IFilteringParams;
  sort: ISortOption[];
}


export interface IHotspotConfig {
  resolution: TBuildRange<16>;
  timeBin: EHotspotTimeBins;
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

export type TSortDirection = "asc" | "desc";

export interface ISortOption {
  sortBy: string;
  direction?: TSortDirection;
}
