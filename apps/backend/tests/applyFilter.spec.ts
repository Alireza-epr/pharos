import { EReasonCodesStatic } from '@packages/enum';
import { applyFilter } from '../src/pipeline/normalize/filter';
import events from './fixtures/canonicalSchema.json';
import {
  FILTER_TRIAGE_SCORE_MIN_0_73,
  FILTER_TRIAGE_SCORE_MAX_0_53,
  FILTER_TRIAGE_SCORE_RANGE_0_58,
  FILTER_TRIAGE_SCORE_RANGE_PERFECT,
  FILTER_TRIAGE_SCORE_IMPOSSIBLE_RANGE,
  FILTER_UNCERTAINTY_SCORE_MIN_0_63,
  FILTER_UNCERTAINTY_SCORE_MAX_0_38,
  FILTER_DISTANCE_MAX_5_KM,
  FILTER_DISTANCE_MIN_30_KM,
  FILTER_DISTANCE_RANGE_20_TO_26_KM,
  FILTER_REASON_CODES_INCLUDE_NEAR_COAST,
  FILTER_REASON_CODES_INCLUDE_UNMATCHED,
  FILTER_REASON_CODES_INCLUDE_CARGO_OR_MPA,
  FILTER_REASON_CODES_EXCLUDE_CARGO_ANOMALY,
  FILTER_REASON_CODES_EXCLUDE_NEAR_COAST_AND_UNMATCHED,
  FILTER_REASON_CODES_INCLUDE_NONEXISTENT,
  FILTER_INSIDE_EEZ_TRUE,
  FILTER_INSIDE_EEZ_FALSE,
  FILTER_INSIDE_MPA_TRUE,
  FILTER_INSIDE_MPA_FALSE,
  FILTER_BATHYMETRY_MIN_NEG_25,
  FILTER_BATHYMETRY_MAX_NEG_45,
  FILTER_BATHYMETRY_RANGE_NEG44_TO_NEG43,
  FILTER_HIGH_TRIAGE_INSIDE_MPA,
  FILTER_NEAR_COAST_HIGH_TRIAGE,
  FILTER_LOW_TRIAGE_EXCLUDE_CARGO_ANOMALY,
  FILTER_ALL_PARAMS_SINGLE_RESULT,
} from './fixtures/filters.fixtures';
import { IFilteringParams } from '@packages/types';

const ids = (result: typeof events) => result.map((e) => e.event_id);

const EVENT_ID = {
  NEAR_COAST:
    'cbbf5b2f2035f0eb692ccb99d5b7f2ae1f16a65e9f41a2b3498f8c7e32d0546a', // index 8  – dist 1.33, triage 0.83, bath -22, near_coast
  UNMATCHED: '8295ccc8a648afefb4587f3d21e6094ab5fc290168b2d9e37cbf541d86037c4a', // index 7  – unmatched_to_public_ais, uncertainty 0.63
  MPA: 'dfc71c0f4f7bd3840a9312e65bc8af29e0d1e5f7a3c2b84609d7e51f80243096', // index 11 – triage 1, inside MPA
  LOW_TRIAGE_FIRST:
    '97ce71fec35ea516723c7bd7821bf40f9e4d1763c5027afe649da6a5600d4a23', // index 1  – triage 0.53
} as const;

describe('applyFilter_triage_score', () => {
  it('returns_all_events_when_no_filter_is_provided', () => {
    const result = applyFilter(events as any, {});
    expect(result).toHaveLength(events.length);
  });

  it('filters_events_below_triage_score_min', () => {
    const result = applyFilter(events as any, FILTER_TRIAGE_SCORE_MIN_0_73);

    result.forEach((e) => {
      expect(e.scoring.triage_score).toBeGreaterThanOrEqual(0.73);
    });
  });

  it('excludes_events_at_or_below_triage_threshold_when_min_is_set', () => {
    const result = applyFilter(events as any, FILTER_TRIAGE_SCORE_MIN_0_73);
    const excluded = events.filter((e) => (e.scoring.triage_score ?? 0) < 0.73);

    excluded.forEach((e) => {
      expect(ids(result as any)).not.toContain(e.event_id);
    });
  });

  it('filters_events_above_triage_score_max', () => {
    const result = applyFilter(events as any, FILTER_TRIAGE_SCORE_MAX_0_53);

    result.forEach((e) => {
      expect(e.scoring.triage_score).toBeLessThanOrEqual(0.53);
    });
  });

  it('returns_only_exact_score_when_min_and_max_are_equal', () => {
    const result = applyFilter(events as any, FILTER_TRIAGE_SCORE_RANGE_0_58);

    expect(result.length).toBeGreaterThan(0);
    result.forEach((e) => {
      expect(e.scoring.triage_score).toBe(0.58);
    });
  });

  it('returns_only_perfect_score_event_when_range_is_1_to_1', () => {
    const result = applyFilter(
      events as any,
      FILTER_TRIAGE_SCORE_RANGE_PERFECT,
    );

    expect(result).toHaveLength(1);
    expect(result[0].scoring.triage_score).toBe(1);
  });

  it('returns_empty_array_when_min_exceeds_max', () => {
    const result = applyFilter(
      events as any,
      FILTER_TRIAGE_SCORE_IMPOSSIBLE_RANGE,
    );

    expect(result).toHaveLength(0);
  });
});

describe('applyFilter_uncertainty_score', () => {
  it('keeps_only_high_uncertainty_event_when_min_is_0_63', () => {
    const result = applyFilter(
      events as any,
      FILTER_UNCERTAINTY_SCORE_MIN_0_63,
    );

    expect(result).toHaveLength(1);
    expect(result[0].scoring.uncertainty_score).toBe(0.63);
  });

  it('excludes_high_uncertainty_event_when_max_is_0_38', () => {
    const result = applyFilter(
      events as any,
      FILTER_UNCERTAINTY_SCORE_MAX_0_38,
    );

    result.forEach((e) => {
      expect(e.scoring.uncertainty_score).toBeLessThanOrEqual(0.38);
    });
    expect(ids(result as any)).not.toContain(EVENT_ID.UNMATCHED);
  });

  it('all_low_uncertainty_events_are_kept_when_max_matches_their_score', () => {
    const result = applyFilter(
      events as any,
      FILTER_UNCERTAINTY_SCORE_MAX_0_38,
    );
    const lowUncertaintyCount = events.filter(
      (e) => (e.scoring.uncertainty_score ?? Infinity) <= 0.38,
    ).length;

    expect(result).toHaveLength(lowUncertaintyCount);
  });
});

describe('applyFilter_distance_to_coast', () => {
  it('keeps_only_near_coast_event_when_max_is_5_km', () => {
    const result = applyFilter(events as any, FILTER_DISTANCE_MAX_5_KM);

    expect(result).toHaveLength(1);
    expect(result[0].distance_to_coast_km).toBeLessThanOrEqual(5);
  });

  it('near_coast_event_is_the_one_with_distance_1_33_km', () => {
    const result = applyFilter(events as any, FILTER_DISTANCE_MAX_5_KM);

    expect(result[0].distance_to_coast_km).toBe(1.33);
  });

  it('filters_events_closer_than_min_distance_to_coast', () => {
    const result = applyFilter(events as any, FILTER_DISTANCE_MIN_30_KM);

    result.forEach((e) => {
      expect(e.distance_to_coast_km).toBeGreaterThanOrEqual(30);
    });
  });

  it('returns_correct_count_for_distance_range_20_to_26_km', () => {
    const result = applyFilter(
      events as any,
      FILTER_DISTANCE_RANGE_20_TO_26_KM,
    );
    const expected = events.filter(
      (e) => e.distance_to_coast_km >= 20 && e.distance_to_coast_km <= 26,
    );

    expect(result).toHaveLength(expected.length);
  });

  it('all_returned_events_are_within_distance_range_20_to_26_km', () => {
    const result = applyFilter(
      events as any,
      FILTER_DISTANCE_RANGE_20_TO_26_KM,
    );

    result.forEach((e) => {
      expect(e.distance_to_coast_km).toBeGreaterThanOrEqual(20);
      expect(e.distance_to_coast_km).toBeLessThanOrEqual(26);
    });
  });
});

describe('applyFilter_reason_codes_include', () => {
  it('keeps_only_event_with_near_coast_reason_code', () => {
    const result = applyFilter(
      events as any,
      FILTER_REASON_CODES_INCLUDE_NEAR_COAST,
    );

    expect(result).toHaveLength(1);
    expect(result[0].scoring.reason_codes).toContain('near_coast');
  });

  it('keeps_only_event_with_unmatched_to_public_ais_reason_code', () => {
    const result = applyFilter(
      events as any,
      FILTER_REASON_CODES_INCLUDE_UNMATCHED,
    );

    expect(result).toHaveLength(1);
    expect(result[0].scoring.reason_codes).toContain('unmatched_to_public_ais');
  });

  it('include_is_OR_logic_keeping_events_with_any_of_the_listed_codes', () => {
    const result = applyFilter(
      events as any,
      FILTER_REASON_CODES_INCLUDE_CARGO_OR_MPA,
    );

    result.forEach((e) => {
      const hasMatch =
        e.scoring.reason_codes?.includes(
          EReasonCodesStatic.bathymetry_cargo_anomaly_zone,
        ) || e.scoring.reason_codes?.includes(EReasonCodesStatic.inside_mpa);
      expect(hasMatch).toBe(true);
    });
  });

  it('returns_empty_array_when_no_event_has_included_reason_code', () => {
    const result = applyFilter(
      events as any,
      FILTER_REASON_CODES_INCLUDE_NONEXISTENT,
    );

    expect(result).toHaveLength(0);
  });
});

describe('applyFilter_reason_codes_exclude', () => {
  it('removes_all_cargo_anomaly_events_when_code_is_excluded', () => {
    const result = applyFilter(
      events as any,
      FILTER_REASON_CODES_EXCLUDE_CARGO_ANOMALY,
    );

    result.forEach((e) => {
      expect(e.scoring.reason_codes).not.toContain(
        'bathymetry_cargo_anomaly_zone',
      );
    });
  });

  it('excludes_fewer_events_than_total_when_rare_code_is_removed', () => {
    const result = applyFilter(
      events as any,
      FILTER_REASON_CODES_EXCLUDE_CARGO_ANOMALY,
    );

    expect(result.length).toBeGreaterThan(0);
    expect(result.length).toBeLessThan(events.length);
  });

  it('removes_near_coast_and_unmatched_events_when_both_codes_excluded', () => {
    const result = applyFilter(
      events as any,
      FILTER_REASON_CODES_EXCLUDE_NEAR_COAST_AND_UNMATCHED,
    );

    result.forEach((e) => {
      expect(e.scoring.reason_codes).not.toContain('near_coast');
      expect(e.scoring.reason_codes).not.toContain('unmatched_to_public_ais');
    });
  });

  it('returned_count_matches_events_without_excluded_codes', () => {
    const result = applyFilter(
      events as any,
      FILTER_REASON_CODES_EXCLUDE_NEAR_COAST_AND_UNMATCHED,
    );
    const expected = events.filter(
      (e) =>
        !e.scoring.reason_codes?.includes('near_coast') &&
        !e.scoring.reason_codes?.includes('unmatched_to_public_ais'),
    );

    expect(result).toHaveLength(expected.length);
  });
});

describe('applyFilter_only_inside_eez', () => {
  it('returns_all_events_when_only_inside_eez_is_true_and_all_are_inside', () => {
    const result = applyFilter(events as any, FILTER_INSIDE_EEZ_TRUE);

    expect(result).toHaveLength(events.length);
  });

  it('returns_all_events_when_only_inside_eez_is_false', () => {
    const result = applyFilter(events as any, FILTER_INSIDE_EEZ_FALSE);

    expect(result).toHaveLength(events.length);
  });

  it('each_returned_event_has_at_least_one_eez_enrichment_when_filter_is_true', () => {
    const result = applyFilter(events as any, FILTER_INSIDE_EEZ_TRUE);

    result.forEach((e) => {
      expect(e.context_layers.EEZ.enrichments.length).toBeGreaterThan(0);
    });
  });
});

describe('applyFilter_only_inside_mpa', () => {
  it('returns_only_one_event_when_only_inside_mpa_is_true', () => {
    const result = applyFilter(events as any, FILTER_INSIDE_MPA_TRUE);

    expect(result).toHaveLength(1);
  });

  it('mpa_event_has_inside_mpa_reason_code', () => {
    const result = applyFilter(events as any, FILTER_INSIDE_MPA_TRUE);

    expect(result[0].scoring.reason_codes).toContain('inside_mpa');
  });

  it('each_returned_event_has_at_least_one_mpa_enrichment_when_filter_is_true', () => {
    const result = applyFilter(events as any, FILTER_INSIDE_MPA_TRUE);

    result.forEach((e) => {
      expect(e.context_layers.MPA.enrichments.length).toBeGreaterThan(0);
    });
  });

  it('returns_all_events_when_only_inside_mpa_is_false', () => {
    const result = applyFilter(events as any, FILTER_INSIDE_MPA_FALSE);

    expect(result).toHaveLength(events.length);
  });
});

describe('applyFilter_bathymetry', () => {
  it('keeps_only_shallow_event_when_min_is_neg_25', () => {
    const result = applyFilter(events as any, FILTER_BATHYMETRY_MIN_NEG_25);

    expect(result).toHaveLength(1);
    expect(
      Number(result[0].context_layers.Bathymetry.enrichments[0].value),
    ).toBeGreaterThanOrEqual(-25);
  });

  it('shallow_event_has_bathymetry_value_of_neg_22', () => {
    const result = applyFilter(events as any, FILTER_BATHYMETRY_MIN_NEG_25);

    expect(
      Number(result[0].context_layers.Bathymetry.enrichments[0].value),
    ).toBe(-22);
  });

  it('keeps_only_deep_events_when_max_is_neg_45', () => {
    const result = applyFilter(events as any, FILTER_BATHYMETRY_MAX_NEG_45);

    result.forEach((e) => {
      expect(
        Number(e.context_layers.Bathymetry.enrichments[0].value),
      ).toBeLessThanOrEqual(-45);
    });
  });

  it('returned_count_for_max_neg_45_matches_manually_filtered_count', () => {
    const result = applyFilter(events as any, FILTER_BATHYMETRY_MAX_NEG_45);
    const expected = events.filter(
      (e) => Number(e.context_layers.Bathymetry.enrichments[0]?.value) <= -45,
    );

    expect(result).toHaveLength(expected.length);
  });

  it('all_events_in_range_neg44_to_neg43_satisfy_both_bounds', () => {
    const result = applyFilter(
      events as any,
      FILTER_BATHYMETRY_RANGE_NEG44_TO_NEG43,
    );

    result.forEach((e) => {
      const value = Number(e.context_layers.Bathymetry.enrichments[0].value);
      expect(value).toBeGreaterThanOrEqual(-44);
      expect(value).toBeLessThanOrEqual(-43);
    });
  });

  it('event_with_no_bathymetry_enrichments_is_excluded_by_bathymetry_filter', () => {
    const eventWithoutBath = {
      ...events[0],
      event_id: 'test_no_bath',
      context_layers: {
        ...events[0].context_layers,
        Bathymetry: { dataset: 'test', enrichments: [], version: 'v1' },
      },
    };
    const mixedEvents = [...events, eventWithoutBath] as any;

    const result = applyFilter(mixedEvents, FILTER_BATHYMETRY_MAX_NEG_45).map(
      (e) => e.event_id,
    );
    expect(result).not.toContain('test_no_bath');
  });
});

describe('applyFilter_combined_filters', () => {
  it('returns_only_mpa_event_when_high_triage_and_inside_mpa_are_combined', () => {
    const result = applyFilter(events as any, FILTER_HIGH_TRIAGE_INSIDE_MPA);

    expect(result).toHaveLength(1);
    expect(result[0].scoring.triage_score).toBe(1);
    expect(result[0].context_layers.MPA.enrichments.length).toBeGreaterThan(0);
  });

  it('returns_only_near_coast_high_triage_event_when_distance_and_triage_are_combined', () => {
    const result = applyFilter(events as any, FILTER_NEAR_COAST_HIGH_TRIAGE);

    expect(result).toHaveLength(1);
    expect(result[0].distance_to_coast_km).toBeLessThanOrEqual(5);
    expect(result[0].scoring.triage_score).toBeGreaterThanOrEqual(0.73);
  });

  it('low_triage_events_without_cargo_anomaly_have_no_cargo_reason_code', () => {
    const result = applyFilter(
      events as any,
      FILTER_LOW_TRIAGE_EXCLUDE_CARGO_ANOMALY,
    );

    result.forEach((e) => {
      expect(e.scoring.triage_score).toBeLessThanOrEqual(0.53);
      expect(e.scoring.reason_codes).not.toContain(
        'bathymetry_cargo_anomaly_zone',
      );
    });
  });

  it('returns_exactly_one_event_when_all_params_tightly_target_mpa_event', () => {
    const result = applyFilter(events as any, FILTER_ALL_PARAMS_SINGLE_RESULT);

    expect(result).toHaveLength(1);
    expect(result[0].scoring.triage_score).toBe(1);
    expect(result[0].context_layers.MPA.enrichments.length).toBeGreaterThan(0);
  });

  it('combined_filters_return_subset_smaller_than_either_filter_alone', () => {
    const byTriageOnly = applyFilter(
      events as any,
      FILTER_TRIAGE_SCORE_MIN_0_73,
    );
    const byMpaOnly = applyFilter(events as any, FILTER_INSIDE_MPA_TRUE);
    const combined = applyFilter(events as any, FILTER_HIGH_TRIAGE_INSIDE_MPA);

    expect(combined.length).toBeLessThanOrEqual(byTriageOnly.length);
    expect(combined.length).toBeLessThanOrEqual(byMpaOnly.length);
  });

  it('order_of_filter_application_does_not_affect_final_result', () => {
    const filter: IFilteringParams = {
      triage_score_min: 0.73,
      distance_to_coast_km_max: 20,
    };

    const resultA = applyFilter(events as any, filter);

    // Manually apply in reversed conceptual order and compare ids
    const byDist = events.filter((e) => e.distance_to_coast_km <= 20);
    const byBoth = byDist.filter((e) => (e.scoring.triage_score ?? 0) >= 0.73);

    expect(ids(resultA as any).sort()).toEqual(
      byBoth.map((e) => e.event_id).sort(),
    );
  });
});
