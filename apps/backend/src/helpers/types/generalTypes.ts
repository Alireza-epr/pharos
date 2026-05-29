import { EContextLayers } from '@packages/enum';
import { IContextLayer, IEventSchema, IScoring } from '@packages/types';

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

export interface IBathymetryTile {
  file: string;
  bbox: [number, number, number, number];
}

export interface IBathymetryCachedTile {
  file: string;
  image: any;
  bbox: [number, number, number, number];
}
