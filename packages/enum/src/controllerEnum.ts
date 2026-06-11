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
  TOO_MANY_REQUESTS = 429,
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
  // Body Validation
  BODY_NOT_OBJECT = "Request body must be an object",
  INVALID_GEOJSON = "Invalid GeoJSON format",
  INVALID_GEOJSON_TYPE = "Invalid GeoJSON type provided",
  INVALID_GEOJSON_COORDINATES = "Invalid GeoJSON coordinates",
  INVALID_THRESHOLD = "Invalid threshold value",
  INVALID_HOTSPOT = "Invalid hotspot configuration",
  INVALID_FILTERS = "Invalid filters provided",
  INVALID_SORT = "Invalid sort option",
  INVALID_REGION_CONFIGURATION = "Invalid region configuration",
  // URL Validation
  QUERY_NOT_OBJECT = "Query must be an object",
  // Validation
  REQUIRED_FIELD_MISSING = "Required field is missing",
  INVALID_ARRAY = "Invalid array format",
  INVALID_OBJECT = "Invalid object format",
  INVALID_TYPE = "Invalid data type",
  INVALID_ENUM_VALUE = "Invalid value provided",
  INVALID_STRING = "Invalid string format",
  INVALID_NUMBER = "Invalid number format",
  INVALID_BOOLEAN = "Invalid boolean value",
}

export enum EViolationError {
  DAILY_RATE_LIMIT_EXCEEDED = "Daily rate limit exceeded",
  MONTHLY_RATE_LIMIT_EXCEEDED = "Monthly rate limit exceeded",
  RATE_LIMIT_EXCEEDED = "Rate limit exceeded",
  DAILY_QUOTA_REACHED = "Daily quota reached",
  MONTHLY_QUOTA_REACHED = "Monthly quota reached",
  PROVIDER_THROTTLED = "Provider is currently throttling requests",
}
