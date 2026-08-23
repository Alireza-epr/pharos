import { createHash } from 'crypto';
import { IConfigJSON, IEventSchema } from '@packages/types';
import { deepSortObject } from '@packages/utils';
import {
  ICoverageManifest,
  IPartitionFetchOptions,
  IRecoverableEventFilters,
  ITimeRange,
} from '../types/servingTypes';

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
 * Parse the `in ('a','b')` clause for `a_Field` out of a `filters[i]`-style
 * expression (the `filters[i]` values joined with `AND`, mirroring the
 * frontend's own `parseInClause` in `apps/frontend/src/helpers/utils/queryUtils.ts`
 * — kept as an independent copy since the two run against different inputs;
 * keep them in sync if the query grammar changes). Returns `[]` when the field
 * isn't present.
 */
const parseInClauseValues = (a_Expression: string, a_Field: string): string[] => {
  const match = a_Expression.match(new RegExp(`\\b${a_Field}\\b in \\(([^)]*)\\)`));
  if (!match?.[1]) return [];
  return match[1]
    .split(',')
    .map((v) => v.trim().replace(/^'|'$/g, ''))
    .filter(Boolean);
};

/** Every `filters[i]` value on the request, joined with `AND` into one expression. */
const filterExpressionOf = (a_Config: IConfigJSON): string => {
  const urlParams = a_Config.url_params as unknown as Record<string, unknown>;
  return Object.entries(urlParams)
    .filter(([key]) => /^filters\[\d+\]$/.test(key))
    .map(([, value]) => String(value))
    .join(' AND ');
};

/** Every `datasets[i]` value on the request. */
const datasetsOf = (a_Config: IConfigJSON): IPartitionFetchOptions['datasets'] => {
  const urlParams = a_Config.url_params as unknown as Record<string, unknown>;
  return Object.entries(urlParams)
    .filter(([key]) => /^datasets\[\d+\]$/.test(key))
    .map(([, value]) => String(value)) as IPartitionFetchOptions['datasets'];
};

/**
 * The fetch-scoping subset of a request's `url_params` — see
 * {@link IPartitionFetchOptions}. Used both to key the partition cache and to
 * build the miss-fetch request; `matched`/`flag`/`vessel_type`/`geartype`/
 * `vessel_id` are deliberately not read here (see {@link recoverableEventFilters}).
 */
export const partitionFetchOptions = (a_Config: IConfigJSON): IPartitionFetchOptions => {
  const expression = filterExpressionOf(a_Config);
  const [distance] = parseInClauseValues(expression, 'distance_from_port_km');
  const [neuralVesselType] = parseInClauseValues(expression, 'neural_vessel_type');
  const speed = parseInClauseValues(expression, 'speed');

  const urlParams = a_Config.url_params;
  const spatialResolution = urlParams['spatial-resolution'];
  const temporalResolution = urlParams['temporal-resolution'];
  const spatialAggregation = urlParams['spatial-aggregation'];
  const groupBy = urlParams['group-by'];
  const format = urlParams.format;

  return {
    datasets: datasetsOf(a_Config),
    ...(distance !== undefined && {
      distance_from_port_km: Number(distance) as IPartitionFetchOptions['distance_from_port_km'],
    }),
    ...(neuralVesselType !== undefined && {
      neural_vessel_type: neuralVesselType as IPartitionFetchOptions['neural_vessel_type'],
    }),
    ...(speed.length > 0 && {
      speed: speed as IPartitionFetchOptions['speed'],
    }),
    ...(spatialResolution !== undefined && {
      'spatial-resolution': spatialResolution,
    }),
    ...(temporalResolution !== undefined && {
      'temporal-resolution': temporalResolution,
    }),
    ...(spatialAggregation !== undefined && {
      'spatial-aggregation': spatialAggregation,
    }),
    ...(groupBy !== undefined && { 'group-by': groupBy }),
    ...(format !== undefined && { format }),
  };
};

/**
 * The `filters[i]` predicates that ARE recoverable from a cached raw event —
 * see {@link IRecoverableEventFilters}. Applied at read time
 * (`applyRecoverableEventFilters`) instead of gating the partition cache.
 */
export const recoverableEventFilters = (a_Config: IConfigJSON): IRecoverableEventFilters => {
  const expression = filterExpressionOf(a_Config);
  const [matched] = parseInClauseValues(expression, 'matched');
  const flag = parseInClauseValues(expression, 'flag');
  const vesselType = parseInClauseValues(expression, 'vessel_type');
  const geartype = parseInClauseValues(expression, 'geartype');
  const vesselId = parseInClauseValues(expression, 'vessel_id');

  return {
    ...(matched !== undefined && { matched: matched === 'true' }),
    ...(flag.length > 0 && { flag: flag as IRecoverableEventFilters['flag'] }),
    ...(vesselType.length > 0 && {
      vessel_type: vesselType as IRecoverableEventFilters['vessel_type'],
    }),
    ...(geartype.length > 0 && {
      geartype: geartype as IRecoverableEventFilters['geartype'],
    }),
    ...(vesselId.length > 0 && {
      vessel_id: vesselId as IRecoverableEventFilters['vessel_id'],
    }),
  };
};

/** The recoverable predicate field names, as they appear in a `filters[i]` clause. */
const RECOVERABLE_FILTER_FIELDS = [
  'matched',
  'flag',
  'vessel_type',
  'geartype',
  'vessel_id',
];

/**
 * `url_params` for the miss-fetch, with the recoverable predicates
 * ({@link RECOVERABLE_FILTER_FIELDS}) stripped out of every `filters[i]`
 * clause so the fetch always returns — and the partition always caches — the
 * full raw set for its {@link IPartitionFetchOptions}. The recoverable
 * predicates are re-applied at read time instead (`applyRecoverableEventFilters`),
 * uniformly regardless of what populated the cache.
 */
export const sanitizeFetchUrlParams = <T extends Record<string, unknown>>(
  a_UrlParams: T,
): T => {
  const sanitized: Record<string, unknown> = { ...a_UrlParams };

  for (const [key, value] of Object.entries(a_UrlParams)) {
    if (!/^filters\[\d+\]$/.test(key) || typeof value !== 'string') continue;

    const clauses = value
      .split(/\s+AND\s+/i)
      .filter(
        (clause) =>
          !RECOVERABLE_FILTER_FIELDS.some((field) =>
            new RegExp(`^${field}\\b`).test(clause.trim()),
          ),
      );

    if (clauses.length > 0) {
      sanitized[key] = clauses.join(' AND ');
    } else {
      delete sanitized[key];
    }
  }

  return sanitized as T;
};

/**
 * A short, filesystem-safe fingerprint of {@link IPartitionFetchOptions},
 * deterministic and independent of key ordering — used to segregate the
 * physical partition files of two requests whose fetch-scoping options differ
 * (see `partitionKey`).
 */
export const partitionOptionsSignature = (a_Options: IPartitionFetchOptions): string =>
  createHash('sha256')
    .update(JSON.stringify(deepSortObject(a_Options as unknown as Record<string, unknown>)))
    .digest('hex')
    .slice(0, 12);

/**
 * The physical partition file key for a spatial region under a given fetch
 * options signature. Two requests for the same region with different
 * {@link IPartitionFetchOptions} must never read or write the same file —
 * nesting the signature as a sub-directory keeps the common case (default
 * options) at a stable, predictable path.
 */
export const partitionKey = (a_Region: string, a_OptionsSignature: string): string =>
  `${a_Region}/opts=${a_OptionsSignature}`;

/**
 * A stable cache key for the **non-spatial, non-temporal** shape of a
 * request — independent of key ordering. The time window (`date-range`) is
 * excluded because the day is the partition dimension, and ALL geometry
 * (polygon / region / buffer) is excluded because the spatial dimension is
 * tracked separately as covered H3 cells. This is what lets a different map
 * box with the same {@link IPartitionFetchOptions} reuse the cache.
 *
 * Only {@link partitionFetchOptions} (datasets, `distance_from_port_km`,
 * `neural_vessel_type`, `speed`) factors into this key — the recoverable
 * `filters[i]` predicates (`matched`, `flag`, `vessel_type`, `geartype`,
 * `vessel_id`) deliberately do NOT, so changing only those never forces a
 * miss or a separate partition; they're enforced at read time instead.
 */
export const nonSpatialQueryKey = (a_Config: IConfigJSON): string => {
  const keyObject = {
    URL: a_Config.URL,
    method: a_Config.method,
    options: partitionFetchOptions(a_Config),
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
