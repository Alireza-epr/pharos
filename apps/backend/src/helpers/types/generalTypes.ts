import { EReasonCodes } from '@packages/enum';
import { IEventSchema } from '@packages/types';

export interface IBackendConfig {
  logging: {
    enable_console_log: boolean;
    enable_log: boolean;
    log_file_path: string;
  };
  auth: {
    detection_token: string;
    jwt_secret: string;
    jwt_expiry: string; // JWT expiration time
    refresh_token_expiry: string; // Refresh token expiration time
  };
  port: number;
  detection_provider_timeout_ms: number;
  detection_provider_retries: number;
  detection_provider_retry_delay_ms: number;
}

export enum ELogType {
  info = 'INFO',
  warn = 'WARN',
  error = 'ERROR',
  request = 'REQUEST',
  success = 'SUCCESS',
}

export type TEventProperties = Omit<
  IEventSchema,
  | 'version'
  | 'geom'
  | 'source'
  | 'raw_metadata'
  | 'raw_event_metadata'
  | 'run_metadata'
  | 'rejected'
  | 'hotspot'
>;

export type TEventCSVRow =
  | (Pick<
      IEventSchema,
      | 'event_id'
      | 'timestamp_utc'
      | 'matched_flag'
      | 'lat'
      | 'lon'
      | 'confidence_proxy'
      | 'confidence_tier'
      | 'distance_to_coast_km'
    > & {
      bathymetry_m: string | undefined;
      mpa: string | undefined;
      eez: string | undefined;
      triage_score: number | null;
      uncertainty_score: number | null;
    })
  | Record<EReasonCodes, boolean | undefined>;

export interface IBathymetryTile {
  file: string;
  bbox: [number, number, number, number];
}

export interface IBathymetryCachedTile {
  file: string;
  image: any;
  bbox: [number, number, number, number];
}
export interface ICSVGroup<T> {
  title: string;
  samples: T[];
}

export interface IAuditLog {
  user: string;
  date: string;
  eventCount: number;
  configHash: string;
  filename: string;
}

export interface IExportBuffer {
  filename: string;
  buffer: Buffer<ArrayBufferLike> | null;
}
