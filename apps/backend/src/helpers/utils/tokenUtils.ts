import jwt, { JwtPayload } from 'jsonwebtoken';
import { config } from '../../config/api';
import { ELogType } from '../types/generalTypes';
import { log } from './backendUtils';
import { IUser, TDecoded } from '../types/tokenTypes';
import { ERequestUserRole } from '../enum/tokenEnum';

/**
    User logs in with username/password.
    Server issues two tokens:
      Access token: short-lived (e.g., 1 hour) → sent with Authorization: Bearer <token> on requests.
      Refresh token: long-lived (e.g., 7 days) → stored securely (HttpOnly cookie).
    Access token expires: client sends refresh token to a /refresh endpoint.
    Server verifies refresh token: if valid, issues a new access token (and optionally a new refresh token).
*/
/*
  LOGIN
    ↓
  access token + refresh token
    ↓
  API request
    ↓
  access token expired
    ↓
  /refresh request
    ↓
  new access token
    ↓
  retry request
    ↓
  refresh token expired
    ↓
  LOGIN again
*/

export const generateRefreshToken = (a_Payload: JwtPayload) => {
  const refresh_token_expiry = ms(config.auth.refresh_token_expiry);
  const refreshToken = jwt.sign(a_Payload, config.auth.jwt_secret, {
    expiresIn: refresh_token_expiry,
  });
  //log(`[Token] Refresh token generated for user: ${a_Payload.username}`, ELogType.success);
  return refreshToken;
};

export const generateToken = (a_Payload: JwtPayload) => {
  try {
    const jwt_expiry = ms(config.auth.jwt_expiry);
    const token = jwt.sign(a_Payload, config.auth.jwt_secret, {
      expiresIn: jwt_expiry / 1000,
    });
    //log(`[Token] Access token generated for user: ${a_Payload.username}`, ELogType.success);
    return token;
  } catch (error) {
    log(`[Token] Error generating access token: ${error}`, ELogType.error);
    throw error;
  }
};

export const verifyToken = (a_Token: string) => {
  try {
    const decoded = jwt.verify(a_Token, config.auth.jwt_secret);
    const user = typeof decoded === 'string' ? decoded : decoded.username;
    log(
      `[Token] Token verified successfully for username: ${user}`,
      ELogType.success,
    );
    logTokenExpiry(decoded);
    return decoded;
  } catch (error) {
    log(`[Token] Token verification failed: ${error}`, ELogType.error);
    throw error;
  }
};

export const logTokenExpiry = (a_Decoded: TDecoded) => {
  if (!(a_Decoded as JwtPayload).exp) {
    log(
      `Token for user ${(a_Decoded as JwtPayload).username} has no expiry`,
      ELogType.info,
    );
    return;
  }

  const now = Math.floor(Date.now() / 1000); // current time in seconds
  const timeLeft = (a_Decoded as JwtPayload).exp! - now;

  if (timeLeft <= 0) {
    log(
      `Token for user ${(a_Decoded as JwtPayload).username} has expired`,
      ELogType.warn,
    );
  } else {
    log(
      `Token for user ${(a_Decoded as JwtPayload).username} expires in ${timeLeft} seconds`,
      ELogType.info,
    );
  }
};

export const ms = (a_StringTime: string): number => {
  /*
  ms('1d')      // 86400000
  ms('10h')     // 36000000
  ms('2h')      // 7200000
  ms('1m')      // 60000 
  ms('5s')      // 5000
  ms('1y')      // 31557600000
  ms('100')  
  */

  if (isNaN(Number(a_StringTime))) {
    const time = a_StringTime.split('')[a_StringTime.length - 1];
    let ms = 1;
    const factor = +a_StringTime.substring(0, a_StringTime.indexOf(time));

    switch (time) {
      case 's':
        ms = 1000;
        break;
      case 'm':
        ms = 60000;
        break;
      case 'h':
        ms = 3600000;
        break;
      case 'd':
        ms = 86400000;
        break;
      case 'w':
        ms = 604800000;
        break;
      case 'M': // 30 days
        ms = 2592000000;
        break;
      case 'y': // 365days
        ms = 31557600000;
        break;
    }
    return factor * ms;
  } else {
    return Number(a_StringTime);
  }
};

export const getUser = (
  a_Username: string,
  a_Role: ERequestUserRole,
): IUser => {
  if (a_Role === ERequestUserRole.notAvailable) {
    return {
      username: a_Username,
      role: a_Role,
      accessToken: 'n/a',
      refreshToken: 'n/a',
    };
  }
  const accessToken = generateToken({ username: a_Username, role: a_Role });
  const refreshToken = generateRefreshToken({
    username: a_Username,
    role: a_Role,
  });
  const user = {
    username: a_Username,
    role: a_Role,
    accessToken,
    refreshToken,
  };
  return user;
};
