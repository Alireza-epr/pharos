import dotenv from '@dotenvx/dotenvx';
// Load environment variables from .env file
dotenv.config();
import { IBackendConfig } from '../helpers/types/generalTypes';

/* if (!process.env.DETECTION_TOKEN || process.env.DETECTION_TOKEN.length === 0) {
  throw new Error("DETECTION_TOKEN is required. For more information, please refer to docs/runbook.md." )
} */

export const config: IBackendConfig = {
  logging: {
    enable_console_log: process.env['ENABLE_CONSOLE_LOG'] === '1', // true if env var is '1',
    enable_log: process.env['ENABLE_LOG'] === '1', // true if env var is '1'
    log_file_path: './logs/api.log',
  },
  auth: {
    detection_token: process.env.DETECTION_TOKEN ?? '',
    jwt_secret: process.env.JWT_SECRET ?? '',
    jwt_expiry: '1h',
    refresh_token_expiry: '7d',
  },
  port: parseInt(process.env.PORT || '1370', 10),
  detection_provider_timeout_ms: parseInt(
    process.env.DETECTION_PROVIDER_TIMEOUT_MS || '30000',
    10,
  ),
  detection_provider_retries: parseInt(
    process.env.DETECTION_PROVIDER_RETRIES || '5',
    10,
  ),
  detection_provider_retry_delay_ms: parseInt(
    process.env.DETECTION_PROVIDER_RETRY_DELAY_MS || '200',
    10,
  ),
};
