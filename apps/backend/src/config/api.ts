import dotenv from '@dotenvx/dotenvx';
// Load environment variables from .env file
dotenv.config();
import { IBackendConfig } from '../helpers/types/generalTypes';

/* if (!process.env.DETECTION_TOKEN || process.env.DETECTION_TOKEN.length === 0) {
  throw new Error("DETECTION_TOKEN is required. For more information, please refer to docs/runbook.md." )
} */

// MCP_API_KEYS is a JSON object, label -> token (see mcp_api_keys in
// generalTypes.ts). A malformed value shouldn't crash the whole server at
// boot -- log it and fall back to "no keys configured" (every MCP request
// then correctly 401s, same as today with no key set at all). Can't use
// the app's own log()/backendUtils here -- that module imports this one.
const parseMcpApiKeys = (a_Raw: string | undefined): Record<string, string> => {
  if (!a_Raw) return {};
  try {
    const parsed: unknown = JSON.parse(a_Raw);
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      throw new Error('MCP_API_KEYS must be a JSON object of label -> token');
    }
    return parsed as Record<string, string>;
  } catch (err) {
    console.error(`[config] Invalid MCP_API_KEYS, ignoring it: ${err}`);
    return {};
  }
};

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
    mcp_api_keys: parseMcpApiKeys(process.env.MCP_API_KEYS),
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
