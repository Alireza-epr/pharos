export const hotspot = {
    "cell_id": "851f2a47fffffff",
    "time_bin": "2025-01-11 05:00:00",
    "count_total": 1,
    "count_unmatched": 1,
    "count_high_score_unmatched": 1,
    "mean_score": 1,
    "mean_uncertainty": 0.63,
    "pct_near_coast": 0,
    "recurrence_count": 14,
    "time_bins_total": 13,
    "time_bins_with_unmatched": 13
}

export const hotspot_low_strength = {
    ...hotspot,
    recurrence_count: 1,
    time_bins_with_unmatched: 1,
    count_unmatched: 0,
    mean_uncertainty: 0.2,
}

export const hotspot_medium_strength = {
    ...hotspot,
    recurrence_count: 7,
    time_bins_with_unmatched: 3,
    count_unmatched: 0,
    mean_uncertainty: 0.2,
}

export const hotspot_medium_strength_eligible_for_high = {
    ...hotspot,
    recurrence_count: 8,
    time_bins_with_unmatched: 3,
    count_unmatched: 0,
    mean_uncertainty: 0.2,
}

export const hotspot_high_strength_eligible_for_high = {
    ...hotspot,
    recurrence_count: 14,
    time_bins_with_unmatched: 5,
    count_unmatched: 5,
    mean_uncertainty: 0.2,
}

export const hotspot_penilized_uncertainty = {
    ...hotspot,
    recurrence_count: 14,
    time_bins_with_unmatched: 5,
    count_unmatched: 5,
    mean_uncertainty: 0.8,
}

export const hotspot_penilized_uncertainty_heavy = {
    ...hotspot,
    recurrence_count: 0,
    time_bins_with_unmatched: 0,
    count_unmatched: 0,
    mean_uncertainty: 0.9, // heavy penalty
}