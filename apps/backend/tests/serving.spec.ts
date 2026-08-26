import {
  addCoverage,
  dedupEventsById,
  enumerateDates,
  filterByTime,
  hasCoverage,
  nonSpatialQueryKey,
  parseDateRange,
  partitionFetchOptions,
  partitionKey,
  partitionOptionsSignature,
  recoverableEventFilters,
  sanitizeFetchUrlParams,
} from '../src/helpers/utils/servingUtils';
import { ICoverageManifest } from '../src/helpers/types/servingTypes';
import { IConfigJSON, IEventSchema } from '@packages/types';
import { EFetchMethods } from '@packages/enum';

const ev = (event_id: string, timestamp_utc: string): IEventSchema =>
  ({ event_id, timestamp_utc }) as unknown as IEventSchema;

const baseConfig = {
  URL: 'https://gateway/report',
  method: EFetchMethods.post,
  url_params: {
    format: 'JSON',
    'temporal-resolution': 'HOURLY',
    'datasets[0]': 'public-global-sar-presence:v3.0',
    'date-range': '2025-12-01T00:00:00Z,2025-12-07T23:59:59Z',
  },
  body_params: {
    geojson: {
      type: 'Polygon',
      coordinates: [
        [
          [14.1, 55.2],
          [14.7, 55.2],
          [14.7, 55.1],
          [14.1, 55.2],
        ],
      ],
    },
  },
} as unknown as IConfigJSON;

describe('parseDateRange', () => {
  it('parses_a_valid_ISO_range', () => {
    const range = parseDateRange('2025-12-01T00:00:00Z,2025-12-07T23:59:59Z');
    expect(range).not.toBeNull();
    expect(range!.start.toISOString()).toBe('2025-12-01T00:00:00.000Z');
    expect(range!.end.toISOString()).toBe('2025-12-07T23:59:59.000Z');
  });

  it('returns_null_for_missing_malformed_or_reversed_ranges', () => {
    expect(parseDateRange(undefined)).toBeNull();
    expect(parseDateRange('only-one-part')).toBeNull();
    expect(parseDateRange('not-a-date,also-not')).toBeNull();
    expect(
      parseDateRange('2025-12-07T00:00:00Z,2025-12-01T00:00:00Z'),
    ).toBeNull();
  });
});

describe('enumerateDates', () => {
  it('enumerates_every_inclusive_UTC_day_in_the_window', () => {
    const range = parseDateRange('2025-12-01T00:00:00Z,2025-12-07T23:59:59Z')!;
    expect(enumerateDates(range)).toEqual([
      '2025-12-01',
      '2025-12-02',
      '2025-12-03',
      '2025-12-04',
      '2025-12-05',
      '2025-12-06',
      '2025-12-07',
    ]);
  });

  it('returns_a_single_day_for_a_sub_day_window', () => {
    const range = parseDateRange('2025-12-04T01:00:00Z,2025-12-04T05:00:00Z')!;
    expect(enumerateDates(range)).toEqual(['2025-12-04']);
  });
});

describe('nonSpatialQueryKey', () => {
  it('is_independent_of_key_ordering', () => {
    const reordered = {
      method: baseConfig.method,
      URL: baseConfig.URL,
      url_params: {
        'datasets[0]': 'public-global-sar-presence:v3.0',
        'temporal-resolution': 'HOURLY',
        format: 'JSON',
        'date-range': '2025-12-01T00:00:00Z,2025-12-07T23:59:59Z',
      },
    } as unknown as IConfigJSON;
    expect(nonSpatialQueryKey(baseConfig)).toBe(nonSpatialQueryKey(reordered));
  });

  it('ignores_the_date_range_because_the_day_is_the_partition_dimension', () => {
    const otherWindow = {
      ...(baseConfig as any),
      url_params: {
        ...(baseConfig as any).url_params,
        'date-range': '2026-01-01T00:00:00Z,2026-01-02T00:00:00Z',
      },
    } as unknown as IConfigJSON;
    expect(nonSpatialQueryKey(baseConfig)).toBe(
      nonSpatialQueryKey(otherWindow),
    );
  });

  it('is_independent_of_the_AOI_geometry_so_a_different_box_can_reuse_the_cache', () => {
    const movedBox = {
      ...(baseConfig as any),
      body_params: {
        geojson: {
          type: 'Polygon',
          coordinates: [
            [
              [5, 5],
              [6, 5],
              [6, 6],
              [5, 5],
            ],
          ],
        },
      },
    } as unknown as IConfigJSON;
    expect(nonSpatialQueryKey(baseConfig)).toBe(nonSpatialQueryKey(movedBox));
  });

  it('changes_when_the_datasets_change', () => {
    const otherDataset = {
      ...(baseConfig as any),
      url_params: {
        ...(baseConfig as any).url_params,
        'datasets[0]': 'public-global-sar-presence:v4.0',
      },
    } as unknown as IConfigJSON;
    expect(nonSpatialQueryKey(baseConfig)).not.toBe(
      nonSpatialQueryKey(otherDataset),
    );
  });

  it('is_unaffected_by_recoverable_filters_matched_flag_vessel_type_geartype_and_vessel_id', () => {
    const withRecoverableFilters = {
      ...(baseConfig as any),
      url_params: {
        ...(baseConfig as any).url_params,
        'filters[0]':
          "matched in ('false') AND flag in ('FRA') AND vessel_type in ('CARGO') AND geartype in ('TRAWLERS') AND vessel_id in ('abc123')",
      },
    } as unknown as IConfigJSON;
    expect(nonSpatialQueryKey(baseConfig)).toBe(
      nonSpatialQueryKey(withRecoverableFilters),
    );
  });

  it('changes_when_distance_from_port_km_is_set', () => {
    const withDistance = {
      ...(baseConfig as any),
      url_params: {
        ...(baseConfig as any).url_params,
        'filters[0]': "distance_from_port_km in ('3')",
      },
    } as unknown as IConfigJSON;
    expect(nonSpatialQueryKey(baseConfig)).not.toBe(
      nonSpatialQueryKey(withDistance),
    );
  });

  it('changes_when_neural_vessel_type_is_set', () => {
    const withNeuralVesselType = {
      ...(baseConfig as any),
      url_params: {
        ...(baseConfig as any).url_params,
        'filters[0]': "neural_vessel_type in ('Likely fishing')",
      },
    } as unknown as IConfigJSON;
    expect(nonSpatialQueryKey(baseConfig)).not.toBe(
      nonSpatialQueryKey(withNeuralVesselType),
    );
  });

  it('changes_when_speed_is_set', () => {
    const withSpeed = {
      ...(baseConfig as any),
      url_params: {
        ...(baseConfig as any).url_params,
        'filters[0]': "speed in ('<2')",
      },
    } as unknown as IConfigJSON;
    expect(nonSpatialQueryKey(baseConfig)).not.toBe(
      nonSpatialQueryKey(withSpeed),
    );
  });

  it('changes_when_temporal_resolution_changes', () => {
    const withDailyResolution = {
      ...(baseConfig as any),
      url_params: {
        ...(baseConfig as any).url_params,
        'temporal-resolution': 'DAILY',
      },
    } as unknown as IConfigJSON;
    expect(nonSpatialQueryKey(baseConfig)).not.toBe(
      nonSpatialQueryKey(withDailyResolution),
    );
  });

  it('changes_when_spatial_resolution_is_set', () => {
    const withSpatialResolution = {
      ...(baseConfig as any),
      url_params: {
        ...(baseConfig as any).url_params,
        'spatial-resolution': 'LOW',
      },
    } as unknown as IConfigJSON;
    expect(nonSpatialQueryKey(baseConfig)).not.toBe(
      nonSpatialQueryKey(withSpatialResolution),
    );
  });

  it('changes_when_spatial_aggregation_is_set', () => {
    const withSpatialAggregation = {
      ...(baseConfig as any),
      url_params: {
        ...(baseConfig as any).url_params,
        'spatial-aggregation': false,
      },
    } as unknown as IConfigJSON;
    expect(nonSpatialQueryKey(baseConfig)).not.toBe(
      nonSpatialQueryKey(withSpatialAggregation),
    );
  });

  it('changes_when_group_by_is_set', () => {
    const withGroupBy = {
      ...(baseConfig as any),
      url_params: {
        ...(baseConfig as any).url_params,
        'group-by': 'VESSEL_ID',
      },
    } as unknown as IConfigJSON;
    expect(nonSpatialQueryKey(baseConfig)).not.toBe(
      nonSpatialQueryKey(withGroupBy),
    );
  });

  it('changes_when_format_changes', () => {
    const withCsvFormat = {
      ...(baseConfig as any),
      url_params: {
        ...(baseConfig as any).url_params,
        format: 'CSV',
      },
    } as unknown as IConfigJSON;
    expect(nonSpatialQueryKey(baseConfig)).not.toBe(
      nonSpatialQueryKey(withCsvFormat),
    );
  });
});

describe('partitionFetchOptions', () => {
  // baseConfig.url_params already carries `format: 'JSON'` and
  // `temporal-resolution: 'HOURLY'` — both fetch-scoping, so every case below
  // expects them alongside whatever else is under test.

  it('is_the_dataset_selection_plus_format_and_temporal_resolution_when_no_filters_are_set', () => {
    expect(partitionFetchOptions(baseConfig)).toEqual({
      datasets: ['public-global-sar-presence:v3.0'],
      format: 'JSON',
      'temporal-resolution': 'HOURLY',
    });
  });

  it('picks_up_spatial_resolution_spatial_aggregation_and_group_by', () => {
    const config = {
      ...(baseConfig as any),
      url_params: {
        ...(baseConfig as any).url_params,
        'spatial-resolution': 'LOW',
        'spatial-aggregation': false,
        'group-by': 'VESSEL_ID',
        'temporal-resolution': 'DAILY',
      },
    } as unknown as IConfigJSON;

    expect(partitionFetchOptions(config)).toEqual({
      datasets: ['public-global-sar-presence:v3.0'],
      format: 'JSON',
      'temporal-resolution': 'DAILY',
      'spatial-resolution': 'LOW',
      'spatial-aggregation': false,
      'group-by': 'VESSEL_ID',
    });
  });

  it('picks_up_distance_from_port_km_neural_vessel_type_and_speed_from_filters', () => {
    const config = {
      ...(baseConfig as any),
      url_params: {
        ...(baseConfig as any).url_params,
        'filters[0]':
          "matched in ('true') AND neural_vessel_type in ('Likely fishing') AND speed in ('<2','2-4')",
        'filters[1]': "distance_from_port_km in ('3')",
      },
    } as unknown as IConfigJSON;

    expect(partitionFetchOptions(config)).toEqual({
      datasets: ['public-global-sar-presence:v3.0'],
      format: 'JSON',
      'temporal-resolution': 'HOURLY',
      neural_vessel_type: 'Likely fishing',
      speed: ['<2', '2-4'],
      distance_from_port_km: 3,
    });
  });

  it('ignores_matched_flag_vessel_type_geartype_and_vessel_id', () => {
    const config = {
      ...(baseConfig as any),
      url_params: {
        ...(baseConfig as any).url_params,
        'filters[0]':
          "matched in ('false') AND flag in ('FRA') AND vessel_type in ('CARGO') AND geartype in ('TRAWLERS') AND vessel_id in ('abc123')",
      },
    } as unknown as IConfigJSON;

    expect(partitionFetchOptions(config)).toEqual({
      datasets: ['public-global-sar-presence:v3.0'],
      format: 'JSON',
      'temporal-resolution': 'HOURLY',
    });
  });
});

describe('recoverableEventFilters', () => {
  it('is_empty_when_no_filters_are_set', () => {
    expect(recoverableEventFilters(baseConfig)).toEqual({});
  });

  it('extracts_matched_flag_vessel_type_geartype_and_vessel_id', () => {
    const config = {
      ...(baseConfig as any),
      url_params: {
        ...(baseConfig as any).url_params,
        'filters[0]':
          "matched in ('false') AND flag in ('FRA','ESP') AND vessel_type in ('CARGO') AND geartype in ('TRAWLERS') AND vessel_id in ('abc123')",
      },
    } as unknown as IConfigJSON;

    expect(recoverableEventFilters(config)).toEqual({
      matched: false,
      flag: ['FRA', 'ESP'],
      vessel_type: ['CARGO'],
      geartype: ['TRAWLERS'],
      vessel_id: ['abc123'],
    });
  });

  it('ignores_distance_from_port_km_neural_vessel_type_and_speed', () => {
    const config = {
      ...(baseConfig as any),
      url_params: {
        ...(baseConfig as any).url_params,
        'filters[0]':
          "distance_from_port_km in ('3') AND neural_vessel_type in ('Likely fishing') AND speed in ('<2')",
      },
    } as unknown as IConfigJSON;

    expect(recoverableEventFilters(config)).toEqual({});
  });

  it('parses_matched_true_distinctly_from_matched_false', () => {
    const config = {
      ...(baseConfig as any),
      url_params: {
        ...(baseConfig as any).url_params,
        'filters[0]': "matched in ('true')",
      },
    } as unknown as IConfigJSON;

    expect(recoverableEventFilters(config)).toEqual({ matched: true });
  });
});

describe('sanitizeFetchUrlParams', () => {
  it('strips_only_the_recoverable_clauses_out_of_a_mixed_filter_expression', () => {
    const sanitized = sanitizeFetchUrlParams({
      'filters[0]':
        "matched in ('false') AND neural_vessel_type in ('Likely fishing') AND flag in ('FRA')",
    });

    expect(sanitized['filters[0]']).toBe(
      "neural_vessel_type in ('Likely fishing')",
    );
  });

  it('drops_the_filters_key_entirely_when_every_clause_is_recoverable', () => {
    const sanitized = sanitizeFetchUrlParams({
      'filters[0]': "matched in ('false') AND flag in ('FRA')",
    });

    expect(sanitized['filters[0]']).toBeUndefined();
  });

  it('leaves_non_filter_keys_and_fully_unrecoverable_clauses_untouched', () => {
    const sanitized = sanitizeFetchUrlParams({
      format: 'JSON',
      'datasets[0]': 'public-global-sar-presence:v3.0',
      'filters[0]': "distance_from_port_km in ('3')",
    });

    expect(sanitized).toEqual({
      format: 'JSON',
      'datasets[0]': 'public-global-sar-presence:v3.0',
      'filters[0]': "distance_from_port_km in ('3')",
    });
  });
});

describe('partitionOptionsSignature', () => {
  it('is_deterministic_and_independent_of_key_ordering', () => {
    const a = partitionOptionsSignature({
      datasets: ['public-global-sar-presence:v3.0'],
      speed: ['<2', '2-4'],
    } as any);
    const b = partitionOptionsSignature({
      speed: ['2-4', '<2'],
      datasets: ['public-global-sar-presence:v3.0'],
    } as any);

    expect(a).toBe(b);
  });

  it('changes_when_the_options_change', () => {
    const a = partitionOptionsSignature({
      datasets: ['public-global-sar-presence:v3.0'],
    } as any);
    const b = partitionOptionsSignature({
      datasets: ['public-global-sar-presence:v3.0'],
      neural_vessel_type: 'Likely fishing',
    } as any);

    expect(a).not.toBe(b);
  });

  it('is_a_short_filesystem_safe_string', () => {
    const signature = partitionOptionsSignature({
      datasets: ['public-global-sar-presence:v3.0'],
    } as any);

    expect(signature).toMatch(/^[0-9a-f]{12}$/);
  });
});

describe('partitionKey', () => {
  it('nests_the_options_signature_under_the_region', () => {
    expect(partitionKey('HIGH_SEAS', 'abc123def456')).toBe(
      'HIGH_SEAS/opts=abc123def456',
    );
  });

  it('keeps_two_regions_under_the_same_signature_distinct', () => {
    expect(partitionKey('HIGH_SEAS', 'abc123def456')).not.toBe(
      partitionKey('8444', 'abc123def456'),
    );
  });
});

describe('dedupEventsById', () => {
  it('keeps_one_row_per_event_id_in_stable_id_sorted_order', () => {
    const out = dedupEventsById([
      ev('b', '2025-12-04T01:00:00Z'),
      ev('a', '2025-12-04T02:00:00Z'),
      ev('b', '2025-12-04T03:00:00Z'),
    ]);
    expect(out.map((e) => e.event_id)).toEqual(['a', 'b']);
  });

  it('returns_an_empty_array_unchanged', () => {
    expect(dedupEventsById([])).toEqual([]);
  });
});

describe('filterByTime', () => {
  it('keeps_only_events_inside_the_inclusive_window', () => {
    const range = parseDateRange('2025-12-04T00:00:00Z,2025-12-04T23:59:59Z')!;
    const out = filterByTime(
      [
        ev('in', '2025-12-04T12:00:00Z'),
        ev('after', '2025-12-05T00:00:01Z'),
        ev('before', '2025-12-03T23:59:59Z'),
      ],
      range,
    );
    expect(out.map((e) => e.event_id)).toEqual(['in']);
  });
});

describe('Coverage_manifest', () => {
  const date = '2025-12-04';
  const key = 'query-key-1';

  it('is_uncovered_before_anything_is_recorded', () => {
    const manifest: ICoverageManifest = {};
    expect(hasCoverage(manifest, date, key, ['c1', 'c2'])).toBe(false);
  });

  it('covers_exactly_the_cells_recorded', () => {
    const manifest: ICoverageManifest = {};
    addCoverage(manifest, date, key, ['c1', 'c2', 'c3']);

    expect(hasCoverage(manifest, date, key, ['c1', 'c2', 'c3'])).toBe(true);
    // A different query key is not covered.
    expect(hasCoverage(manifest, date, 'other-key', ['c1'])).toBe(false);
    // A different day is not covered.
    expect(hasCoverage(manifest, '2025-12-05', key, ['c1'])).toBe(false);
  });

  it('unions_cells_across_successive_fetches', () => {
    const manifest: ICoverageManifest = {};
    addCoverage(manifest, date, key, ['c1', 'c2']);
    addCoverage(manifest, date, key, ['c2', 'c3']);
    expect(manifest[date]![key]).toEqual(['c1', 'c2', 'c3']);
  });

  it('zooming_into_a_covered_area_is_a_cache_hit_not_a_refetch', () => {
    const manifest: ICoverageManifest = {};
    // Wide box fetched first → its cells are covered.
    const wideBoxCells = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6'];
    addCoverage(manifest, date, key, wideBoxCells);

    // Zooming in needs a subset of those cells → HIT (no refetch).
    const zoomedInCells = ['c3', 'c4'];
    expect(hasCoverage(manifest, date, key, zoomedInCells)).toBe(true);
  });

  it('panning_outside_the_covered_area_is_a_miss', () => {
    const manifest: ICoverageManifest = {};
    addCoverage(manifest, date, key, ['c1', 'c2', 'c3']);

    // Needs one cell (c9) that was never fetched → MISS.
    expect(hasCoverage(manifest, date, key, ['c3', 'c9'])).toBe(false);
  });
});
