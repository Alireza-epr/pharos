import { Request, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { controllerResponse } from '../../helpers/utils/controllerUtils';
import { EResponseError, EResponseMessage, EStatusCode } from '@packages/enum';
import { users } from './auth.users';
import { log } from '../../helpers/utils/backendUtils';
import { ELogType } from '../../helpers/types/generalTypes';
import {
  generateToken,
  getUser,
  verifyToken,
} from '../../helpers/utils/tokenUtils';
import { EJWTErrorName } from '../../helpers/enum/tokenEnum';

export const loginController = (a_Req: Request, a_Res: Response) => {
  // --- User/Pass Login ---
  // Support both JSON body and query parameters
  const username = a_Req.body?.username || a_Req.query?.username;
  const password = a_Req.body?.password || a_Req.query?.password;

  if (username && password) {
    // Simulated database record
    const userFromDB = users.find(
      (u) => u.username === username && u.password === password,
    );

    if (userFromDB) {
      log(`[Login] User ${username} logged in`, ELogType.success);
      const user = getUser(userFromDB.username, userFromDB.role); //Get User from DB
      return controllerResponse(a_Res, EStatusCode.OK_200, {
        success: true,
        accessToken: user.accessToken,
        refreshToken: user.refreshToken,
      });
    } else {
      log(`[Login] Failed login attempt for user: ${username}`, ELogType.error);
      return controllerResponse(a_Res, EStatusCode.UNAUTHORIZED_401, {
        success: false,
        error: [EResponseError.InvalidCredentials],
      });
    }
  } else {
    return controllerResponse(a_Res, EStatusCode.BAD_REQUEST_400, {
      success: false,
      error: [EResponseError.CredentialIsRequired],
    });
  }
};

export const refreshController = (a_Req: Request, a_Res: Response) => {
  // Exchange a valid refresh token for a new access token.
  // Support both JSON body and query parameters
  const refreshToken = a_Req.body?.refreshToken || a_Req.query?.refreshToken;

  if (!refreshToken) {
    return controllerResponse(a_Res, EStatusCode.BAD_REQUEST_400, {
      success: false,
      error: [EResponseError.RefreshTokenRequired],
    });
  }

  try {
    const decoded = verifyToken(refreshToken) as JwtPayload;
    const accessToken = generateToken({
      username: decoded.username,
      role: decoded.role,
    });
    log(
      `[Refresh] New access token issued for user: ${decoded.username}`,
      ELogType.success,
    );
    return controllerResponse(a_Res, EStatusCode.OK_200, {
      success: true,
      accessToken,
    });
  } catch (err) {
    const isExpired = (err as Error)?.name === EJWTErrorName.TokenExpiredError;
    log(`[Refresh] Failed to refresh token: ${err}`, ELogType.error);
    return controllerResponse(a_Res, EStatusCode.UNAUTHORIZED_401, {
      success: false,
      error: [
        isExpired
          ? EResponseError.RefreshTokenExpired
          : EResponseError.InvalidRefreshToken,
      ],
    });
  }
};

export const checkTokenController = (a_Req: Request, a_Res: Response) => {
  // Support both JSON body and query parameters
  const token = a_Req.body?.accessToken || a_Req.query?.accessToken || a_Req.body?.refreshToken || a_Req.query?.refreshToken;
  
  if (token) {
    try {
      const tokenVerification = verifyToken(token);
      return controllerResponse(a_Res, EStatusCode.OK_200, {
        success: true,
      });
    } catch (err) {
      log(`[Login] Failed verify token: ${err}`, ELogType.error);
      return controllerResponse(a_Res, EStatusCode.BAD_REQUEST_400, {
        success: false,
        error: [EResponseError.InvalidOrExpiredToken],
      });
    }
  } else {
    return controllerResponse(a_Res, EStatusCode.BAD_REQUEST_400, {
      success: false,
      error: [EResponseError.InvalidOrExpiredToken],
    });
  }
};
