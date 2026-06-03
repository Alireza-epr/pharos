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

export enum EThresholdConfig {
  near_coast_threshold = "near_coast_threshold",
  low_confidence_proxy_threshold = "low_confidence_proxy_threshold",
  shallow_water_threshold = "shallow_water_threshold",
  deep_water_threshold = "deep_water_threshold",
  low_triage_score_threshold = "low_triage_score_threshold",
  medium_triage_score_threshold = "medium_triage_score_threshold",
  high_triage_score_threshold = "high_triage_score_threshold",
  base_uncertainty_weight = "base_uncertainty_weight",
  missing_field_weight = "missing_field_weight",
  noisy_weight = "noisy_weight",
  unmatched_weight = "unmatched_weight",
  near_coast_importance_weight = "near_coast_importance_weight",
  eez_importance_weight = "eez_importance_weight",
  mpa_importance_weight = "mpa_importance_weight",
  missing_confidence_proxy_weight = "missing_confidence_proxy_weight",
  low_confidence_proxy_weight = "low_confidence_proxy_weight",
  low_confidence_tier_weight = "low_confidence_tier_weight",
  medium_confidence_tier_weight = "medium_confidence_tier_weight",
  high_confidence_tier_weight = "high_confidence_tier_weight",
}

export enum EHiddenConfig {
  gitCommitSHA = "gitCommitSHA",
  export = "export"
}

export enum EExportEvidence {
  "canonicalSchema.json" = "canonicalSchema.json",
  "event.geojson" = "event.geojson",
  "event.parquet" = "event.parquet",
  "events.csv" = "events.csv",
  "stats.json" = "stats.json",
  "hotspots.geojson" = "hotspots.geojson",
  "hotspots.parquet" = "hotspots.parquet",
  "run_metadata.json" = "run_metadata.json"
}