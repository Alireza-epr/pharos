import { IConfigJSON, IEventSchema, IRunMetadata } from './eventTypes';
import { FeatureCollection, IFeature, IPointGeometry } from './geoJSONTypes';

export interface ILandPolygonProperties {
  Location: string;
}

export interface ICoastlinePolylineProperties {
  featurecla: 'Coastline';
  scalerank: number;
  min_zoom: number;
}

export enum EValidationLabel {
  TP = 'TP',
  FP = 'FP',
  Ambiguous = 'Ambiguous',
}

export enum EValidationFailureMode {
  coast_clutter = 'coast_clutter',
  static_structure = 'static_structure',
  on_land = 'on_land',
  unknown = 'unknown',
}

export interface IValidationSample {
  event_id: string;
  timestamp_utc: string;
  lon: number;
  lat: number;
  matched_flag: boolean;
  source: string;
  triage_score: number | null;
  uncertainty_score: number | null;
  label: EValidationLabel;
  failure_mode: EValidationFailureMode | '';
  notes: string;
}

export type TValidationGeoJSON = IFeature<IPointGeometry, IValidationSample>;

export interface IValidationResp {
  metadata: IConfigJSON;
  events: IEventSchema[];
  validationSamples: IValidationSample[];
  validationSamplesGeoJSON: TValidationGeoJSON[];
}

export enum EValidationStrata {
  distance_to_coast = 'distance_to_coast',
  confidence_tier = 'confidence_tier',
  density = 'density',
}

export interface IValidationStrata {
  geoJSON: TValidationGeoJSON[];
  csv: string;
}

export interface IValidationManifest {
  strata: EValidationStrata;
  stratum_sample_sizes: {
    [key: string]: number;
  };
  run_metadata: IRunMetadata;
}
