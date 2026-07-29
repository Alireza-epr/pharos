import { IConfigJSON, IEventSchema } from '@packages/types';
import { deepSortObject } from '@packages/utils';

/**
 * Pure helpers for the partitioned serving path.
 *
 * Everything in this module is deliberately free of side effects and of the
 * heavy runtime dependencies (turf / parquetjs / dataset loading) so it can be
 * unit-tested in isolation. The spatial (turf/h3) and storage (parquet) concerns
 * live in `helpers/geo/spatial.ts`, `services/ServingService.ts`, and the
 * `repositories/serving` storage repository.
 */

/** Root directory (relative to the backend cwd) for the partitioned cache. */
export const EVENTS_PARTITION_DIR = 'data/events';

/** Coverage manifest file inside the partition root. */
export const COVERAGE_FILE = `${EVENTS_PARTITION_DIR}/coverage.json`;

/** Partition bucket for everything outside any EEZ. */
export const HIGH_SEAS = 'HIGH_SEAS';

/**
 * H3 resolution for the read-time coarse cell pre-filter (`filterByH3`).
 * ~0.7 km² average cells at res 8 — fine enough to prune most rows cheaply.
 */
export const SERVING_H3_RES = 8;

/**
 * Coarser H3 resolution used to record which *area* has been fetched (the
 * coverage manifest). Coarser than the read-time prune so the manifest stays
 * small while still discriminating zoom levels. ~36 km² average cells at res 6.
 */
export const COVERAGE_H3_RES = 6;

/**
 * Records, per day and per non-spatial query key, the set of H3 cells already
 * fetched into the cache. A day is "covered" for a query when every cell its AOI
 * needs is already present — so a zoomed-in AOI whose cells are a subset of an
 * earlier fetch is a pure cache hit (no provider call), even though its exact
 * polygon differs from the earlier request.
 */
export interface ICoverageManifest {
  [date: string]: { [queryKey: string]: string[] };
}

/** A parsed inclusive time window. */
export interface ITimeRange {
  start: Date;
  end: Date;
}

/**
 * Parse the `date-range` url param ("<startISO>,<endISO>") into a time window.
 * Returns null when the value is missing or unparseable.
 */
export const parseDateRange = (a_Range?: string): ITimeRange | null => {
  if (!a_Range) return null;
  const [rawStart, rawEnd] = a_Range.split(',');
  if (!rawStart || !rawEnd) return null;

  const start = new Date(rawStart.trim());
  const end = new Date(rawEnd.trim());
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  if (start.getTime() > end.getTime()) return null;

  return { start, end };
};

/** Format a Date as a UTC `YYYY-MM-DD` partition date. */
export const toPartitionDate = (a_Date: Date): string =>
  a_Date.toISOString().slice(0, 10);

/**
 * Enumerate every UTC calendar day touched by the window, inclusive of both
 * ends. A 7-day window yields 7 day strings.
 */
export const enumerateDates = (a_Range: ITimeRange): string[] => {
  const dates: string[] = [];
  const cursor = new Date(
    Date.UTC(
      a_Range.start.getUTCFullYear(),
      a_Range.start.getUTCMonth(),
      a_Range.start.getUTCDate(),
    ),
  );
  const last = Date.UTC(
    a_Range.end.getUTCFullYear(),
    a_Range.end.getUTCMonth(),
    a_Range.end.getUTCDate(),
  );

  while (cursor.getTime() <= last) {
    dates.push(toPartitionDate(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
};

/** The UTC calendar day an event belongs to (its partition date). */
export const getEventDate = (a_Event: IEventSchema): string =>
  a_Event.timestamp_utc.slice(0, 10);

/**
 * A stable cache key for the **non-spatial, non-temporal** shape of a request:
 * datasets, resolutions, group-by, format, filters — independent of key
 * ordering. The time window (`date-range`) is excluded because the day is the
 * partition dimension, and ALL geometry (polygon / region / buffer) is excluded
 * because the spatial dimension is tracked separately as covered H3 cells. This
 * is what lets a different map box with the same datasets reuse the cache.
 */
export const nonSpatialQueryKey = (a_Config: IConfigJSON): string => {
  const urlParams: Record<string, unknown> = { ...a_Config.url_params };
  for (const geoParam of [
    'date-range',
    'region-id',
    'region-dataset',
    'buffer-operation',
    'buffer-unit',
    'buffer-value',
  ]) {
    delete urlParams[geoParam];
  }

  const keyObject = {
    URL: a_Config.URL,
    method: a_Config.method,
    url_params: urlParams,
  };

  return JSON.stringify(deepSortObject(keyObject));
};

/**
 * Deduplicate events by their deterministic `event_id`, keeping the first
 * occurrence, and return them in a stable (id-sorted) order. This is the
 * documented dedup rule that keeps a partition file — most importantly the
 * growing shared `HIGH_SEAS` file — from accumulating duplicate rows as
 * overlapping queries merge into it.
 */
export const dedupEventsById = (a_Events: IEventSchema[]): IEventSchema[] => {
  const byId = new Map<string, IEventSchema>();
  for (const event of a_Events) {
    if (!byId.has(event.event_id)) {
      byId.set(event.event_id, event);
    }
  }
  return Array.from(byId.values()).sort((a, b) =>
    a.event_id < b.event_id ? -1 : a.event_id > b.event_id ? 1 : 0,
  );
};

/** Keep only events whose timestamp falls inside the inclusive window. */
export const filterByTime = (
  a_Events: IEventSchema[],
  a_Range: ITimeRange,
): IEventSchema[] => {
  const start = a_Range.start.getTime();
  const end = a_Range.end.getTime();
  return a_Events.filter((event) => {
    const t = new Date(event.timestamp_utc).getTime();
    return !Number.isNaN(t) && t >= start && t <= end;
  });
};

/**
 * True when every cell the AOI needs is already covered for this day + query —
 * i.e. a subset of a previous fetch's cells. This is the cache-hit test: a
 * zoomed-in AOI whose cells were all fetched earlier returns true.
 */
export const hasCoverage = (
  a_Manifest: ICoverageManifest,
  a_Date: string,
  a_QueryKey: string,
  a_Cells: string[],
): boolean => {
  const covered = a_Manifest[a_Date]?.[a_QueryKey];
  if (!covered) return false;
  const coveredSet = new Set(covered);
  return a_Cells.every((cell) => coveredSet.has(cell));
};

/** Union the freshly-fetched cells into the day + query coverage set. */
export const addCoverage = (
  a_Manifest: ICoverageManifest,
  a_Date: string,
  a_QueryKey: string,
  a_Cells: string[],
): void => {
  const day = a_Manifest[a_Date] ?? {};
  const covered = new Set(day[a_QueryKey] ?? []);
  for (const cell of a_Cells) covered.add(cell);
  day[a_QueryKey] = Array.from(covered).sort();
  a_Manifest[a_Date] = day;
};
