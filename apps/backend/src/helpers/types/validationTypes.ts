import {
  IConfigJSON,
  IEventSchema,
  IRunMetadata,
  IFeature,
  IPointGeometry,
} from '@packages/types';

export interface ILandPolygonProperties {
  Location: string;
}

export interface ICoastlinePolylineProperties {
  featurecla: 'Coastline';
  scalerank: number;
  min_zoom: number;
}
export interface IEEZPolygonProperties {
  fid: number,
  MRGID: number, 
  GEONAME: string, 
  MRGID_TER1: number, 
  POL_TYPE: "200NM", 
  MRGID_SOV1: number, 
  TERRITORY1: string, 
  ISO_TER1: string, 
  SOVEREIGN1: string, 
  MRGID_TER2: null,
  MRGID_SOV2: null, 
  TERRITORY2: null, 
  ISO_TER2: null, 
  SOVEREIGN2: null, 
  MRGID_TER3: null, 
  MRGID_SOV3: null, 
  TERRITORY3: null, 
  ISO_TER3: null, 
  SOVEREIGN3: null, 
  X_1: number, 
  Y_1: number, 
  MRGID_EEZ: number, 
  AREA_KM2: number, 
  ISO_SOV1: string, 
  ISO_SOV2: string | null, 
  ISO_SOV3: string | null, 
  UN_SOV1: number, 
  UN_SOV2: number | null, 
  UN_SOV3: null, 
  UN_TER1: number | number, 
  UN_TER2: null, 
  UN_TER3: null
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
