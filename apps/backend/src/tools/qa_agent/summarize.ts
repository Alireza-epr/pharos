import { IHotspot, IStats } from '@packages/types';
import {
  IValidationStratumSummary,
  IValidationSummary,
} from '../../helpers/types/qaAgentTypes';

export const summarizeStats = (a_Stats: IStats) => {
  const { matched, unmatched } = a_Stats.matching_stats;
  const total = matched + unmatched;
  const unmatched_fraction =
    total > 0 ? `${((unmatched / total) * 100).toFixed(2)}%` : 'N/A';

  return { ...a_Stats, unmatched_fraction };
};

/** Top N hotspot cells by unmatched severity, then overall unmatched volume. */
export const topHotspots = (a_Hotspots: IHotspot[], a_N = 10): IHotspot[] =>
  [...a_Hotspots]
    .sort((a, b) => {
      const byHighScore =
        b.count_high_score_unmatched - a.count_high_score_unmatched;
      if (byHighScore !== 0) return byHighScore;
      return b.count_unmatched - a.count_unmatched;
    })
    .slice(0, a_N);

export interface IValidationSampleRow {
  stratum: string;
  label: string;
  failure_mode: string;
}

/**
 * Parses the validation sample CSV format written by `csv.ts`'s
 * `jsonToCsv`/`csvString`: `### <Group Title> ###` section headers, a
 * `;`-delimited header row, then rows where numbers are `="123"` and
 * strings are `"quoted, doubled-quote escaped"` (or the literal `N/A`).
 * Tolerant/minimal by design — it only needs `label`/`failure_mode`, not a
 * general-purpose CSV parser.
 */
export const parseValidationCsv = (a_Raw: string): IValidationSampleRow[] => {
  const unquote = (a_Cell: string): string => {
    const cell = a_Cell.trim();
    if (cell === 'N/A') return '';
    const numeric = cell.match(/^="(.*)"$/);
    if (numeric) return numeric[1] ?? '';
    const quoted = cell.match(/^"(.*)"$/);
    if (quoted) return (quoted[1] ?? '').replace(/""/g, '"');
    return cell;
  };

  const rows: IValidationSampleRow[] = [];
  let currentStratum = 'unknown';
  let headers: string[] = [];

  for (const line of a_Raw.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.length === 0) continue;

    const sectionMatch = trimmed.match(/^###\s*(.+?)\s*###$/);
    if (sectionMatch) {
      currentStratum = sectionMatch[1] ?? 'unknown';
      headers = [];
      continue;
    }

    const cells = trimmed.split(';');
    if (headers.length === 0) {
      headers = cells;
      continue;
    }

    const record = Object.fromEntries(
      cells.map((cell, i) => [headers[i], unquote(cell)]),
    );

    rows.push({
      stratum: currentStratum,
      label: record.label ?? '',
      failure_mode: record.failure_mode ?? '',
    });
  }

  return rows;
};

export const summarizeValidation = (
  a_Rows: IValidationSampleRow[],
): IValidationSummary => {
  const byStratum = new Map<string, IValidationSampleRow[]>();
  for (const row of a_Rows) {
    const bucket = byStratum.get(row.stratum) ?? [];
    bucket.push(row);
    byStratum.set(row.stratum, bucket);
  }

  const strata: IValidationStratumSummary[] = Array.from(
    byStratum.entries(),
  ).map(([stratum, rows]) => {
    const blank_labels = rows.filter((r) => r.label.trim() === '').length;
    return {
      stratum,
      count: rows.length,
      blank_labels,
      filled_labels: rows.length - blank_labels,
    };
  });

  return {
    strata,
    total_rows: a_Rows.length,
    total_blank_labels: strata.reduce((sum, s) => sum + s.blank_labels, 0),
    total_filled_labels: strata.reduce((sum, s) => sum + s.filled_labels, 0),
  };
};
