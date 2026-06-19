import { Request, Response, NextFunction } from 'express';
import { EResponseError, EStatusCode } from '@packages/enum';
import { controllerResponse } from '../helpers/utils/controllerUtils';
import { verifyToken } from '../helpers/utils/tokenUtils';
import { log } from '../helpers/utils/backendUtils';
import { ELogType } from '../helpers/types/generalTypes';

const BEARER_PREFIX = 'Bearer ';

// Protects routes by requiring a valid access token in the Authorization header.
// On success the decoded payload is attached to req.user for downstream handlers.
export const authMiddleware = (
  a_Req: Request,
  a_Res: Response,
  a_Next: NextFunction,
) => {
  const authHeader = a_Req.headers.authorization;
  const token = authHeader?.startsWith(BEARER_PREFIX)
    ? authHeader.slice(BEARER_PREFIX.length)
    : undefined;

  if (!token) {
    log('[Auth] Missing or malformed Authorization header', ELogType.error);
    return controllerResponse(a_Res, EStatusCode.UNAUTHORIZED_401, {
      success: false,
      error: [EResponseError.InvalidOrExpiredToken],
    });
  }

  try {
    a_Req.user = verifyToken(token);
    return a_Next();
  } catch (err) {
    log(`[Auth] Token verification failed: ${err}`, ELogType.error);
    return controllerResponse(a_Res, EStatusCode.UNAUTHORIZED_401, {
      success: false,
      error: [EResponseError.InvalidOrExpiredToken],
    });
  }
};
