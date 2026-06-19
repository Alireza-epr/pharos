import express, { Request, Response } from 'express';
import { log, formatTimestamp } from '../helpers/utils/backendUtils';
import { ELogType } from '../helpers/types/generalTypes';
import { requestLogger, responseLogger } from '../middlewares/loggerMiddleware';
import { config } from '../config/api';
import { EResponseError, EStatusCode } from '@packages/enum';
import { EBaseRoutes } from '@packages/enum';
import systemRoutes from '../modules/system/system.routes';
import authRoutes from '../modules/auth/auth.routes';
import eventsRoutes from '../modules/events/events.routes';
import exportsRoutes from '../modules/exports/exports.routes';
import { controllerResponse } from '../helpers/utils/controllerUtils';
import { attachGitCommitSHA } from '../middlewares/gitMiddleware';
import { attachStartTime } from '../middlewares/timeMiddleware';
import { cors, corsCheck } from '../middlewares/corsMiddleware';

const app = express();

// Read port from environment variables
const port: number = config.port;
// Trust reverse proxies (e.g. Nginx) so req.ip reflects the real client IP instead of the proxy IP
app.set('trust proxy', true);

// Check CORS
app.use(corsCheck);

// Middleware to parse incoming JSON requests
app.use(express.json());

// Log every incoming request
app.use(requestLogger);

// Logs all responses automatically
app.use(responseLogger);

// Custom CORS middleware
app.use(cors);

// --- Attachments ---

app.use(attachStartTime);
app.use(attachGitCommitSHA);

// --- Endpoints ---

const prependRoute = '/v1';
// System - no auth required
app.use(prependRoute + EBaseRoutes.system, systemRoutes);
// Auth
app.use(prependRoute + EBaseRoutes.auth, authRoutes);
// Events
app.use(prependRoute + EBaseRoutes.events, eventsRoutes);
// Exports
app.use(prependRoute + EBaseRoutes.exports, exportsRoutes);

// Not found handler
app.use((req: Request, res: Response) => {
  log(`Endpoint not found: ${req.method} ${req.originalUrl}`, ELogType.error);
  return controllerResponse(res, EStatusCode.NOT_FOUND_404, {
    success: false,
    error: [EResponseError.EndpointNotFound],
  });
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
