import express, { Request, Response } from 'express';
import { log, formatTimestamp } from '../helpers/utils/backendUtils';
import { ELogType } from '../helpers/types/generalTypes';
import { requestLogger, responseLogger } from '../middlewares/loggerMiddleware';
import { config } from '../config/api';
import { EBaseRoute, EResponseError, EStatusCode } from '@packages/types';
import { healthController } from '../modules/health/health.controller';
import { controllerResponse } from '../helpers/utils/controllerUtils';

const app = express();

// Read port from environment variables
const port: number = config.port;

// Middleware to parse incoming JSON requests
app.use(express.json());

// Log every incoming request
app.use(requestLogger);

// Logs all responses automatically
app.use(responseLogger);

// Health check 
app.use( EBaseRoute.health, healthController );

// Not found handler
app.use((req: Request, res: Response) => {
  log(`Endpoint not found: ${req.method} ${req.originalUrl}`, ELogType.error);
  return controllerResponse(res, EStatusCode.NOT_FOUND_404 , { error: EResponseError.EndpointNotFound })
});

// Start the server
app.listen(port, '0.0.0.0', () => {
  if (!config.logging.enable_console_log) {
    console.log(
      `[${formatTimestamp()}] [INFO] Pharos API running on port ${port}`,
    );
    console.log(`[${formatTimestamp()}] [INFO] Further logging is disabled.`);
  }
  log(`Pharos API running on port ${port}`);
});
