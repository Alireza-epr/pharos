import dotenv from '@dotenvx/dotenvx';
// Load environment variables from .env file
dotenv.config();
import { IBackendConfig } from '../helpers/types/generalTypes';

export const config: IBackendConfig = {
  logging: {
    enable_console_log: process.env['ENABLE_CONSOLE_LOG'] === '1', // true if env var is '1',
    enable_log: process.env['ENABLE_LOG'] === '1', // true if env var is '1'
    log_file_path: './logs/api.log',
  },
  auth: {
    gfw_token: process.env.GFW_TOKEN ?? '',
  },
  port: parseInt(process.env.PORT || '1370', 10),
};
