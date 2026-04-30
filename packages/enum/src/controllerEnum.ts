export enum EStatusCode {
  OK_200 = 200,
  CREATED_201 = 201,
  NO_CONTENT_204 = 204,
  BAD_REQUEST_400 = 400,
  UNAUTHORIZED_401 = 401,
  FORBIDDEN_403 = 403,
  NOT_FOUND_404 = 404,
  CONFLICT_409 = 409,
  INTERNAL_SERVER_ERROR_500 = 500,
  BAD_GATEWAY_502 = 502,
  SERVICE_UNAVAILABLE_503 = 503,
}

export enum EResponseMessage {
  Done = "Done",
  APIRestarting = "API Restarting",
}

export enum EResponseError {
  Failed = "Failed",
  EndpointNotFound = "Endpoint not found",
  // Token
  RefreshTokenRequired = "Refresh token required",
  RefreshTokenExpired = "Refresh token expired, please login again",
  InvalidRefreshToken = "Invalid or expired refresh token",
  // Auth
  LoginFailed = "Login failed",
  InvalidSecurityKey = "Invalid security key",
  InvalidOrExpiredToken = "Invalid or expired token",
  InvalidCredentials = "Invalid credentials",
  CredentialIsRequired = "Credential is required",
}
