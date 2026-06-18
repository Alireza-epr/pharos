import { Request, Response, NextFunction } from 'express';
import {
  getEnvVariable,
  isDevelopment,
} from '../helpers/utils/controllerUtils';
import { ECORSOrigin } from '../helpers/enum/expressEnum';
import { log } from '../helpers/utils/backendUtils';
import { ELogType } from '../helpers/types/generalTypes';

// In development any localhost origin is allowed regardless of port, so the
// frontend dev server can run on whatever port it picks.
const DEVELOPMENT_ORIGIN = /^http:\/\/localhost(:\d+)?$/;

// Resolve the allowed origin for the current request. In development we reflect
// the request origin when it is a localhost URL (a specific origin is required
// for credentialed requests, so '*' is not usable). Otherwise we use the
// configured production origin.
const getAllowedOrigin = (a_Origin?: string): string | undefined => {
  if (isDevelopment() && a_Origin && DEVELOPMENT_ORIGIN.test(a_Origin)) {
    return a_Origin;
  }
  return getEnvVariable(ECORSOrigin.production);
};

export const corsCheck = (
  a_Req: Request,
  a_Res: Response,
  a_Next: NextFunction,
) => {
  // Track CORS mismatches for this request only. Stored on res.locals so the
  // `cors` middleware can read it without leaking state across requests.
  let hasCORSMismatching = false;

  // Log the possibilities of CORS Checking

  // Check Origin
  // Requests without an Origin header (Postman, curl, same-origin, server-to-server)
  // are not cross-origin browser requests, so there is nothing for CORS to guard.
  const origin = a_Req.headers.origin;
  // Allow requests only from specific origin.
  const allowedOrigin = getAllowedOrigin(origin);
  if (origin && allowedOrigin !== origin) {
    log(`[CORS] Origin mismatched: ${origin}`, ELogType.error);
    hasCORSMismatching = true;
  }

  // Chek Methods
  const allowedMethods = process.env.CORS_METHODS?.split(',').map((m) =>
    m.trim(),
  );
  const methodsString =
    a_Req.headers['access-control-request-method'] || a_Req.method;
  const methods = methodsString.split(',').map((m) => m.trim());
  methods.forEach((m) => {
    if (!allowedMethods?.includes(m)) {
      log(`[CORS] Method mismatched: ${m}`, ELogType.error);
      hasCORSMismatching = true;
    }
  });

  // Chech Headers
  const allowedHeaders = process.env.CORS_HEADERS?.split(',').map((h) =>
    h.trim().toLowerCase(),
  );
  const headersString = a_Req.headers['access-control-request-headers'] || '';
  const headers = headersString.split(',').map((h) => h.trim());
  headers.forEach((h) => {
    if (!allowedHeaders?.includes(h) && h.length > 0) {
      log(`[CORS] Header mismatched: ${h}`, ELogType.error);
      hasCORSMismatching = true;
    }
  });

  a_Res.locals.corsMismatch = hasCORSMismatching;
  a_Next();
};

export const cors = (a_Req: Request, a_Res: Response, a_Next: NextFunction) => {
  // Allow requests only from specific origin.
  const allowedOrigin = getAllowedOrigin(a_Req.headers.origin);

  a_Res.header('Access-Control-Allow-Origin', allowedOrigin);

  // Specify which HTTP methods are allowed for cross-origin requests.
  a_Res.header('Access-Control-Allow-Methods', process.env.CORS_METHODS);

  // Specify which headers the client is allowed to send. This is required if the client sends custom headers like Authorization.
  // use standard or PascalCase names; will handle lowercase in code
  a_Res.header('Access-Control-Allow-Headers', process.env.CORS_HEADERS);

  // Specify how long the browser can cache the preflight (OPTIONS) response.
  a_Res.header('Access-Control-Max-Age', process.env.CORS_MAX_AGE); // 24 hours

  // Allow sending cookies or Authorization headers from the client.
  // Must use a specific origin (not '*') to work in browsers.
  a_Res.header(
    'Access-Control-Allow-Credentials',
    process.env.CORS_CREDENTIALS,
  );

  // Specify which headers the client is allowed to access from the response.
  // By default, some headers are not exposed to the browser.
  a_Res.header(
    'Access-Control-Expose-Headers',
    process.env.CORS_EXPOSE_HEADERS,
  );

  // Handle preflight requests (OPTIONS) immediately.
  // Browsers send these before certain cross-origin requests to check permissions.
  if (a_Req.method === 'OPTIONS') {
    if (a_Res.locals.corsMismatch) {
      log('[CORS] Send status 403 to preflight request', ELogType.error);
      return a_Res.sendStatus(403);
    } else {
      log('[CORS] Send status 200 to preflight request', ELogType.info);
      return a_Res.sendStatus(200);
    }
  }

  a_Next();
};
