export enum EReasonCodesStatic {
  near_coast = "near_coast",
  low_confidence_proxy = "low_confidence_proxy",
  missing_confidence_proxy = "missing_confidence_proxy",
  inside_eez = "inside_eez",
  inside_mpa = "inside_mpa",
  unmatched_to_public_ais = "unmatched_to_public_ais",
  matched_to_public_ais = "matched_to_public_ais",
  noisy_vessel = "noisy_vessel",
  bathymetry_fishing_zone = "bathymetry_fishing_zone",
  bathymetry_shallow_eez_hotspot = "bathymetry_shallow_eez_hotspot",
  bathymetry_mpa_shallow_zone = "bathymetry_mpa_shallow_zone",
  bathymetry_cargo_anomaly_zone = "bathymetry_cargo_anomaly_zone",
  bathymetry_deep_mpa = "bathymetry_deep_mpa",
  low_confidence_tier = "low_confidence_tier",
  medium_confidence_tier = "medium_confidence_tier",
  high_confidence_tier = "high_confidence_tier",
}

export type EReasonCodes =
  | EReasonCodesStatic
  | `missing_required_field:${string}`;

export enum ERejectedEventSchemaReasons {
  notValidCoordinates = "Not Valid Coordinates",
  notValidTimestamp = "Not Valid Timestamp",
  notValidVesselType = "Not Valid Vessel Type",
}

export enum EGeoCoordinate {
  latitude = "latitude",
  longitude = "longitude",
}

export enum EHotspotTimeBins {
  DAILY = "DAILY",
  HOURLY = "HOURLY",
}

export enum EConfidenceTiers {
  low = "low",
  medium = "medium",
  high = "high",
}

export enum EHotspotStrength {
  low = "low",
  medium = "medium",
  high = "high",
}
