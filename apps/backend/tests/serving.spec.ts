import {
  addCoverage,
  dedupEventsById,
  enumerateDates,
  filterByTime,
  hasCoverage,
  nonSpatialQueryKey,
  parseDateRange,
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
    expect(nonSpatialQueryKey(baseConfig)).toBe(nonSpatialQueryKey(otherWindow));
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
