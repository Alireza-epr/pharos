export enum ELogLevel {
  message = 'message',
  warning = 'warning',
  error = 'error',
}

export enum EURLParams {
  loglevel = 'loglevel',
}

export enum EReasonCodes {
  near_coast = 'near_coast',
  low_detection_confidence = 'low_detection_confidence',
  inside_eez = 'inside_eez',
  inside_mpa = 'inside_mpa',
  unmatched_detection = 'unmatched_detection',
}

export enum ERejectedEventSchemaReasons {
  notValidCoordinates = "Not Valid Coordinates"
}

export enum EGeoCoordinate {
  latitude= "latitude",
  longitude= "longitude"
}