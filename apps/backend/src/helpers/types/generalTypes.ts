import { EContextLayers } from '@packages/enum';
import { IContextLayer, IScoring } from '@packages/types';

export interface IBackendConfig {
  logging: {
    enable_console_log: boolean;
    enable_log: boolean;
    log_file_path: string;
  };
  auth: {
    gfw_token: string;
    jwt_secret: string;
    jwt_expiry: string; // JWT expiration time
    refresh_token_expiry: string; // Refresh token expiration time
  };
  port: number;
}

export enum ELogType {
  info = 'INFO',
  warn = 'WARN',
  error = 'ERROR',
  request = 'REQUEST',
  success = 'SUCCESS',
}

export interface IEventProperties {
  event_id: string;
  timestamp_utc: string;
  matched_flag: boolean;
  lat: number;
  lon: number;
  confidence_proxy: 2 | 3 | 4 | null;
  distance_to_coast_km: number | null;
  context_layers: Record<EContextLayers, IContextLayer>;
  scoring: IScoring
}

export enum EGeoJSONEventMissingness {
  event_id = 'event_id',
  timestamp_utc = 'timestamp_utc',
  lat = 'lat',
  lon = 'lon',
  confidence_proxy = 'confidence_proxy',
  distance_to_coast_km = 'distance_to_coast_km',
}

export interface IMatchingStats {
  matched: number,
  unmatched: number
}

export type TFixedLengthArray<T, N extends number, R extends T[] = []> =
  R['length'] extends N ? R : TFixedLengthArray<T, N, [...R, T]>;