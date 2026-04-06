"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EGeoCoordinate = exports.ERejectedEventSchemaReasons = exports.EReasonCodesStatic = void 0;
var EReasonCodesStatic;
(function (EReasonCodesStatic) {
    EReasonCodesStatic["near_coast"] = "near_coast";
    EReasonCodesStatic["low_detection_confidence"] = "low_detection_confidence";
    EReasonCodesStatic["missing_confidence_proxy"] = "missing_confidence_proxy";
    EReasonCodesStatic["inside_eez"] = "inside_eez";
    EReasonCodesStatic["inside_mpa"] = "inside_mpa";
    EReasonCodesStatic["unmatched_to_public_ais"] = "unmatched_to_public_ais";
    EReasonCodesStatic["matched_to_public_ais"] = "matched_to_public_ais";
    EReasonCodesStatic["noisy_vessel"] = "noisy_vessel";
})(EReasonCodesStatic || (exports.EReasonCodesStatic = EReasonCodesStatic = {}));
var ERejectedEventSchemaReasons;
(function (ERejectedEventSchemaReasons) {
    ERejectedEventSchemaReasons["notValidCoordinates"] = "Not Valid Coordinates";
    ERejectedEventSchemaReasons["notValidTimestamp"] = "Not Valid Timestamp";
})(ERejectedEventSchemaReasons || (exports.ERejectedEventSchemaReasons = ERejectedEventSchemaReasons = {}));
var EGeoCoordinate;
(function (EGeoCoordinate) {
    EGeoCoordinate["latitude"] = "latitude";
    EGeoCoordinate["longitude"] = "longitude";
})(EGeoCoordinate || (exports.EGeoCoordinate = EGeoCoordinate = {}));
