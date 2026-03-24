export enum ELogLevel {
  message = 'message',
  warning = 'warning',
  error = 'error',
}

export enum EURLParams {
  loglevel = 'loglevel',
}

export enum EReasonCodesStatic {
  near_coast = 'near_coast',
  low_detection_confidence = 'low_detection_confidence',
  missing_confidence_proxy = 'missing_confidence_proxy',
  inside_eez = 'inside_eez',
  inside_mpa = 'inside_mpa',
  unmatched_to_public_ais = 'unmatched_to_public_ais',
  matched_to_public_ais = 'matched_to_public_ais',
  noisy_vessel = 'noisy_vessel'
}

export type EReasonCodes = EReasonCodesStatic | `missing_required_field:${string}`;

export enum ERejectedEventSchemaReasons {
  notValidCoordinates = 'Not Valid Coordinates',
  notValidTimestamp = 'Not Valid Timestamp',
}

export enum EGeoCoordinate {
  latitude = 'latitude',
  longitude = 'longitude',
}
