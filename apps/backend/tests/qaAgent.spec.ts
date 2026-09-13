import { IHotspot } from '@packages/types';
import {
  parseValidationCsv,
  summarizeStats,
  summarizeValidation,
  topHotspots,
} from '../src/tools/qa_agent/summarize';
import {
  checkCanonicalSchemaShape,
  checkFilesExist,
} from '../src/tools/qa_agent/validateOutputs';

const hotspot = (overrides: Partial<IHotspot>): IHotspot => ({
  cell_id: '851f2a47fffffff',
  time_bin: '2026-01-01 00:00:00',
  count_total: 1,
  count_unmatched: 0,
  count_high_score_unmatched: 0,
  mean_score: 0.5,
  mean_uncertainty: 0.5,
  pct_near_coast: 0,
  recurrence_count: 0,
  time_bins_total: 1,
  time_bins_with_unmatched: 0,
  ...overrides,
});

describe('topHotspots', () => {
  it('ranks_by_high_score_unmatched_then_by_unmatched_count', () => {
    const low = hotspot({ cell_id: 'low', count_high_score_unmatched: 0, count_unmatched: 1 });
    const high = hotspot({ cell_id: 'high', count_high_score_unmatched: 2, count_unmatched: 0 });
    const tieBreaker = hotspot({ cell_id: 'tie', count_high_score_unmatched: 0, count_unmatched: 5 });

    const result = topHotspots([low, high, tieBreaker], 10);

    expect(result.map((h) => h.cell_id)).toEqual(['high', 'tie', 'low']);
  });

  it('caps_the_result_at_n', () => {
    const many = Array.from({ length: 15 }, (_, i) => hotspot({ cell_id: `cell-${i}` }));
    expect(topHotspots(many, 10)).toHaveLength(10);
  });

  it('does_not_mutate_the_input_array', () => {
    const input = [hotspot({ cell_id: 'a' }), hotspot({ cell_id: 'b' })];
    const originalOrder = input.map((h) => h.cell_id);
    topHotspots(input, 10);
    expect(input.map((h) => h.cell_id)).toEqual(originalOrder);
  });
});

describe('parseValidationCsv', () => {
  const csv = [
    '### Near coast ###',
    'event_id;label;failure_mode',
    '"abc123";"";N/A',
    '"def456";"TP";"coast_clutter"',
    '',
    '### Offshore ###',
    'event_id;label;failure_mode',
    '"ghi789";"";N/A',
  ].join('\n');

  it('groups_rows_under_their_section_header_as_the_stratum', () => {
    const rows = parseValidationCsv(csv);
    expect(rows.map((r) => r.stratum)).toEqual([
      'Near coast',
      'Near coast',
      'Offshore',
    ]);
  });

  it('unquotes_string_cells_and_treats_N_A_as_blank', () => {
    const rows = parseValidationCsv(csv);
    expect(rows[1]).toEqual({
      stratum: 'Near coast',
      label: 'TP',
      failure_mode: 'coast_clutter',
    });
    expect(rows[2]!.failure_mode).toBe('');
  });
});

describe('summarizeValidation', () => {
  it('flags_non_blank_labels_as_filled_per_stratum', () => {
    const summary = summarizeValidation(
      parseValidationCsv(
        [
          '### Near coast ###',
          'label',
          '""',
          '"TP"',
          '### Offshore ###',
          'label',
          '""',
        ].join('\n'),
      ),
    );

    expect(summary.total_rows).toBe(3);
    expect(summary.total_blank_labels).toBe(2);
    expect(summary.total_filled_labels).toBe(1);
    expect(summary.strata).toEqual(
      expect.arrayContaining([
        { stratum: 'Near coast', count: 2, blank_labels: 1, filled_labels: 1 },
        { stratum: 'Offshore', count: 1, blank_labels: 1, filled_labels: 0 },
      ]),
    );
  });

  it('returns_all_zero_counts_for_no_rows', () => {
    expect(summarizeValidation([])).toEqual({
      strata: [],
      total_rows: 0,
      total_blank_labels: 0,
      total_filled_labels: 0,
    });
  });
});

describe('summarizeStats', () => {
  it('computes_unmatched_fraction_from_matching_stats', () => {
    const summary = summarizeStats({
      count_total: 4,
      matching_stats: { matched: 3, unmatched: 1 },
      missingness: {} as any,
      geo_sanity: { latitude: { min: 0, max: 0 }, longitude: { min: 0, max: 0 } },
      time_range: { start: 'a', end: 'b' },
      mean_score: 0.5,
      mean_uncertainty: 0.5,
    });

    expect(summary.unmatched_fraction).toBe('25.00%');
  });

  it('returns_N_A_when_there_are_no_matched_or_unmatched_events', () => {
    const summary = summarizeStats({
      count_total: 0,
      matching_stats: { matched: 0, unmatched: 0 },
      missingness: {} as any,
      geo_sanity: { latitude: { min: 0, max: 0 }, longitude: { min: 0, max: 0 } },
      time_range: { start: 'N/A', end: 'N/A' },
      mean_score: 0,
      mean_uncertainty: 0,
    });

    expect(summary.unmatched_fraction).toBe('N/A');
  });
});

describe('checkFilesExist', () => {
  it('splits_required_files_into_present_and_missing', () => {
    const result = checkFilesExist(__dirname, [
      'qaAgent.spec.ts',
      'does-not-exist.json',
    ]);

    expect(result.present).toEqual(['qaAgent.spec.ts']);
    expect(result.missing).toEqual(['does-not-exist.json']);
  });
});

describe('checkCanonicalSchemaShape', () => {
  const completeEvent = {
    distance_to_coast_km: 1,
    context_layers: {},
    version: '1.0.0',
    event_id: 'abc',
    timestamp_utc: '2026-01-01T00:00:00Z',
    lon: 0,
    lat: 0,
    geom: {},
    matched_flag: undefined,
    source: 'src',
    confidence_proxy: null,
    confidence_tier: 'low',
    raw_metadata: {},
    raw_event_metadata: null,
    run_metadata: null,
    scoring: {},
    rejected: false,
    hotspot: null,
  };

  it('reports_no_issues_for_a_complete_event', () => {
    const result = checkCanonicalSchemaShape([completeEvent]);
    expect(result.checked).toBe(1);
    expect(result.issues).toEqual([]);
  });

  it('flags_missing_top_level_keys_by_event_id', () => {
    const { scoring, hotspot, ...incomplete } = completeEvent;
    const result = checkCanonicalSchemaShape([incomplete]);

    expect(result.issues).toEqual([
      expect.stringContaining('abc'),
    ]);
    expect(result.issues[0]).toContain('scoring');
    expect(result.issues[0]).toContain('hotspot');
  });
});
