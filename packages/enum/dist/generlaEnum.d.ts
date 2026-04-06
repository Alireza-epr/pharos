export declare enum EReasonCodesStatic {
    near_coast = "near_coast",
    low_detection_confidence = "low_detection_confidence",
    missing_confidence_proxy = "missing_confidence_proxy",
    inside_eez = "inside_eez",
    inside_mpa = "inside_mpa",
    unmatched_to_public_ais = "unmatched_to_public_ais",
    matched_to_public_ais = "matched_to_public_ais",
    noisy_vessel = "noisy_vessel"
}
export type EReasonCodes = EReasonCodesStatic | `missing_required_field:${string}`;
export declare enum ERejectedEventSchemaReasons {
    notValidCoordinates = "Not Valid Coordinates",
    notValidTimestamp = "Not Valid Timestamp"
}
export declare enum EGeoCoordinate {
    latitude = "latitude",
    longitude = "longitude"
}
