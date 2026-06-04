/**
 * Filter fixtures derived from canonicalSchema.json event data.
 *
 * Triage scores in fixture:  0.53 | 0.58 | 0.73 | 0.83 | 1
 * Uncertainty scores:        0.38 | 0.63
 * Distance to coast (km):   1.33 – 33.07
 * Bathymetry (m):           -46 – -22
 * All 18 events are inside an EEZ; only event [11] (dfc71c…) is inside an MPA.
 */

import { EReasonCodesStatic } from '@packages/enum';
import { IFilteringParams } from '@packages/types';

// ─── Triage score ────────────────────────────────────────────────────────────

/** Keeps only events with triage_score >= 0.73 (indices 0,2,3,4,5,11,12,14,16,17) */
export const FILTER_TRIAGE_SCORE_MIN_0_73: IFilteringParams = {
  triage_score_min: 0.73,
};

/** Keeps only events with triage_score <= 0.53 (indices 1,6,9,10,13,15) */
export const FILTER_TRIAGE_SCORE_MAX_0_53: IFilteringParams = {
  triage_score_max: 0.53,
};

/** Range that isolates only the mid-tier score 0.58 (index 7) */
export const FILTER_TRIAGE_SCORE_RANGE_0_58: IFilteringParams = {
  triage_score_min: 0.58,
  triage_score_max: 0.58,
};

/** Range that isolates perfect score 1 (index 11) */
export const FILTER_TRIAGE_SCORE_RANGE_PERFECT: IFilteringParams = {
  triage_score_min: 1,
  triage_score_max: 1,
};

/** Range with no matching events – min > max of all scores */
export const FILTER_TRIAGE_SCORE_IMPOSSIBLE_RANGE: IFilteringParams = {
  triage_score_min: 0.99,
  triage_score_max: 0.5,
};

// ─── Uncertainty score ───────────────────────────────────────────────────────

/** Keeps only the high-uncertainty event (index 7, score 0.63) */
export const FILTER_UNCERTAINTY_SCORE_MIN_0_63: IFilteringParams = {
  uncertainty_score_min: 0.63,
};

/** Excludes the high-uncertainty event – keeps all events with score <= 0.38 */
export const FILTER_UNCERTAINTY_SCORE_MAX_0_38: IFilteringParams = {
  uncertainty_score_max: 0.38,
};

// ─── Distance to coast ───────────────────────────────────────────────────────

/** Keeps only the near-coast event (index 8, dist = 1.33 km) */
export const FILTER_DISTANCE_MAX_5_KM: IFilteringParams = {
  distance_to_coast_km_max: 5,
};

/** Keeps events farther than 30 km from coast (indices 1, 14) */
export const FILTER_DISTANCE_MIN_30_KM: IFilteringParams = {
  distance_to_coast_km_min: 30,
};

/** Range 20–26 km that captures a clear subset (indices 2,5,6,10,15) */
export const FILTER_DISTANCE_RANGE_20_TO_26_KM: IFilteringParams = {
  distance_to_coast_km_min: 20,
  distance_to_coast_km_max: 26,
};

// ─── Reason codes ────────────────────────────────────────────────────────────

/** Include: keep events that have `near_coast` (only index 8) */
export const FILTER_REASON_CODES_INCLUDE_NEAR_COAST: IFilteringParams = {
  reason_codes_include: [EReasonCodesStatic.near_coast],
};

/** Include: keep events with `unmatched_to_public_ais` (only index 7) */
export const FILTER_REASON_CODES_INCLUDE_UNMATCHED: IFilteringParams = {
  reason_codes_include: [EReasonCodesStatic.unmatched_to_public_ais],
};

/** Include: keep events with `bathymetry_cargo_anomaly_zone` OR `inside_mpa` */
export const FILTER_REASON_CODES_INCLUDE_CARGO_OR_MPA: IFilteringParams = {
  reason_codes_include: [
    EReasonCodesStatic.bathymetry_cargo_anomaly_zone,
    EReasonCodesStatic.inside_mpa,
  ],
};

/** Exclude: remove events that have `bathymetry_cargo_anomaly_zone` */
export const FILTER_REASON_CODES_EXCLUDE_CARGO_ANOMALY: IFilteringParams = {
  reason_codes_exclude: [EReasonCodesStatic.bathymetry_cargo_anomaly_zone],
};

/** Exclude: remove events with `near_coast` OR `unmatched_to_public_ais` */
export const FILTER_REASON_CODES_EXCLUDE_NEAR_COAST_AND_UNMATCHED: IFilteringParams =
  {
    reason_codes_exclude: [
      EReasonCodesStatic.near_coast,
      EReasonCodesStatic.unmatched_to_public_ais,
    ],
  };

/** Include a reason code that no event has – should return empty array */
export const FILTER_REASON_CODES_INCLUDE_NONEXISTENT: IFilteringParams = {
  reason_codes_include: ['nonexistent_code' as any],
};

// ─── EEZ / MPA ───────────────────────────────────────────────────────────────

/** All 18 events are inside an EEZ */
export const FILTER_INSIDE_EEZ_TRUE: IFilteringParams = {
  is_inside_eez: true,
};

/** No events are outside an EEZ – should return empty array */
export const FILTER_INSIDE_EEZ_FALSE: IFilteringParams = {
  is_inside_eez: false,
};

/** Only event [11] (dfc71c…) is inside an MPA */
export const FILTER_INSIDE_MPA_TRUE: IFilteringParams = {
  is_inside_mpa: true,
};

/** 17 of 18 events are outside an MPA */
export const FILTER_INSIDE_MPA_FALSE: IFilteringParams = {
  is_inside_mpa: false,
};

// ─── Bathymetry ──────────────────────────────────────────────────────────────

/** Keeps the shallowest event (index 8, value = -22 m) */
export const FILTER_BATHYMETRY_MIN_NEG_25: IFilteringParams = {
  bathymetry_min: -25,
};

/** Keeps the deepest events (value <= -45: indices 1, 10, 15) */
export const FILTER_BATHYMETRY_MAX_NEG_45: IFilteringParams = {
  bathymetry_max: -45,
};

/** Range -44 to -43 – mid-depth band (several events) */
export const FILTER_BATHYMETRY_RANGE_NEG44_TO_NEG43: IFilteringParams = {
  bathymetry_min: -44,
  bathymetry_max: -43,
};

// ─── Combined filters ────────────────────────────────────────────────────────

/** High-triage, inside MPA – targets only the highest-priority event (index 11) */
export const FILTER_HIGH_TRIAGE_INSIDE_MPA: IFilteringParams = {
  triage_score_min: 0.9,
  is_inside_mpa: true,
};

/** Near-coast events (dist <= 5 km) with high triage (>= 0.73) */
export const FILTER_NEAR_COAST_HIGH_TRIAGE: IFilteringParams = {
  distance_to_coast_km_max: 5,
  triage_score_min: 0.73,
};

/** Low-triage events that are NOT cargo anomalies */
export const FILTER_LOW_TRIAGE_EXCLUDE_CARGO_ANOMALY: IFilteringParams = {
  triage_score_max: 0.53,
  reason_codes_exclude: [EReasonCodesStatic.bathymetry_cargo_anomaly_zone],
};

/** All filters set in a way that yields exactly one event (index 11) */
export const FILTER_ALL_PARAMS_SINGLE_RESULT: IFilteringParams = {
  triage_score_min: 1,
  triage_score_max: 1,
  uncertainty_score_min: 0.38,
  uncertainty_score_max: 0.38,
  distance_to_coast_km_min: 18,
  distance_to_coast_km_max: 19,
  reason_codes_include: [EReasonCodesStatic.inside_mpa],
  is_inside_eez: true,
  is_inside_mpa: true,
  bathymetry_min: -44,
  bathymetry_max: -43,
};
