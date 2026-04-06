import { Request, Response, NextFunction } from 'express';
import { ELogType } from '../helpers/types/generalTypes';
import { log } from '../helpers/utils/backendUtils';

// Middleware to log incoming requests
export const requestLogger = (
  a_Req: Request,
  a_Res: Response,
  a_Next: NextFunction,
): void => {
  log(`${a_Req.method} ${a_Req.originalUrl}`, ELogType.request);
  a_Next();
};

// Middleware to log outgoing responses
export const responseLogger = (
  a_Req: Request,
  a_Res: Response,
  a_Next: NextFunction,
): void => {
  const start = Date.now();

  // Run after res.send
  a_Res.on('finish', async () => {
    const duration = Date.now() - start;
    const message = `[Response] ${a_Req.method} ${a_Req.originalUrl} ${a_Res.statusCode} ${duration}ms`;

    let type: ELogType = ELogType.info;
    if (a_Res.statusCode >= 400 && a_Res.statusCode < 500) type = ELogType.warn;
    if (a_Res.statusCode >= 500) type = ELogType.error;

    log(message, type);
  });

  a_Next();
};

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  log(`Uncaught Exception: ${err.stack || err.message}`, ELogType.error);
});

// Handle unhandled promise rejections
process.on(
  'unhandledRejection',
  (reason: unknown, promise: Promise<unknown>) => {
    log(
      `Unhandled Rejection at: ${JSON.stringify(promise)} reason: ${String(reason)}`,
      ELogType.error,
    );
  },
);
