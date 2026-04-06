import express, { Request, Response } from 'express';
import { log, formatTimestamp } from '../helpers/utils/backendUtils';
import { ELogType } from '../helpers/types/generalTypes';
import { requestLogger, responseLogger } from '../middlewares/loggerMiddleware';
import { config } from '../config/api';

const app = express();

// Read port from environment variables
const port: number = config.port;

// Middleware to parse incoming JSON requests
app.use(express.json());

// Log every incoming request
app.use(requestLogger);

// Logs all responses automatically
app.use(responseLogger);

// Not found handler
app.use((req: Request, res: Response) => {
  log(`Endpoint not found: ${req.method} ${req.originalUrl}`, ELogType.error);
  //return controllerResponse(res, EStatusCode.NOT_FOUND_404 , { error: EResponseError.EndpointNotFound })
});

// Start the server
app.listen(port, () => {
  if (!config.logging.enable_console_log) {
    console.log(
      `[${formatTimestamp()}] [INFO] Pharos API running on port ${port}`,
    );
    console.log(`[${formatTimestamp()}] [INFO] Further logging is disabled.`);
  }
  log(`Pharos API running on port ${port}`);
});
