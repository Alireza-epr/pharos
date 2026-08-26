import {
  IConfigJSON,
  IEventSchema,
  IServedEvents,
  IStepReporter,
} from '@packages/types';
import { sortEventSchema } from '@packages/utils';
import {
  ECache,
  EFetchMethods,
  EQuerySkipReason,
  EQueryStepId,
  TCache,
} from '@packages/enum';
import { getDetections } from './DetectionService';
import { log } from '../helpers/utils/backendUtils';
import { ELogType } from '../helpers/types/generalTypes';
import {
  COVERAGE_H3_RES,
  addCoverage,
  enumerateDates,
  getEventDate,
  hasCoverage,
  nonSpatialQueryKey,
  parseDateRange,
  partitionFetchOptions,
  partitionKey,
  partitionOptionsSignature,
  sanitizeFetchUrlParams,
} from '../helpers/utils/servingUtils';
import {
  cellSetBBoxGeometry,
  filterEventsToQuery,
  getAOIH3Cells,
  getAOIPolygon,
  partitionForEvent,
  resolvePartitions,
} from '../helpers/geo/spatial';
import { getServingRepository } from '../repositories/serving';

/**
 * The serving service: the live, partitioned read path behind `POST /v1/events`.
 *
 * It owns only the **orchestration** — resolution → coverage policy →
 * cache-on-miss decision → filter → sort. All storage I/O is delegated to the
 * serving **repository** ({@link getServingRepository}), so the Parquet backend
 * can be swapped for a DB / object store without touching this file. The reusable,
 * side-effect-free helpers live in `helpers/` (`servingUtils`, `geo/spatial`).
 */

// Storage strategy (Parquet by default; selected by config in the factory).
const servingRepository = getServingRepository();

/**
 * 1. Resolve the query's days, its EEZ/HIGH_SEAS region partitions, and the
 *    H3 cells its AOI needs.
 * 2. Cache-on-miss: a day is a miss when any required cell isn't covered yet for
 *    this (non-spatial) query. A miss fetches once — aligned to the cells'
 *    bounding box so every cell we mark is fully fetched — routes events to
 *    their (day, region) partition (deduped), and records the cells as covered.
 *    A later AOI whose cells are a subset is a pure cache hit, even if its
 *    polygon differs (e.g. zooming in).
 * 3. Read the resolved region partitions back and filter time → H3 → polygon.
 * 4. Sort deterministically so pagination is stable.
 *
 * `cache: "disabled"` skips steps 1-2 but still runs the step-3 filter — the
 * provider's own AOI handling is grid/cell based, not exact, so both branches
 * share `filterEventsToQuery` and disabling the cache only changes *how*
 * events are fetched, never *which* ones are returned.
 *
 * `a_Report` (optional) is fed the checklist steps this run actually took —
 * see `EQueryStepId`/`docs/api/query-contract.md` — so the caller can stream them
 * to the frontend. This function only reports; it knows nothing about HTTP.
 */
export const getServedEvents = async (
  a_Config: IConfigJSON,
  a_Report?: IStepReporter,
): Promise<IServedEvents> => {
  const range = parseDateRange(a_Config.url_params['date-range']);
  if (!range) {
    throw new Error('[serving] Missing or invalid date-range');
  }

  const aoi = getAOIPolygon(a_Config);

  let cache: TCache = ECache.disabled;

  if (a_Config.cache && a_Config.cache === cache) {
    a_Report?.skipped(EQueryStepId.cacheCheck, EQuerySkipReason.cacheDisabled);

    a_Report?.running(EQueryStepId.fetchProvider);
    const { valid: fetched, rejected } = await getDetections(a_Config);
    a_Report?.success(EQueryStepId.fetchProvider, {
      count: fetched.length,
      rejected: rejected.length,
    });

    a_Report?.skipped(EQueryStepId.writeCache, EQuerySkipReason.cacheDisabled);
    a_Report?.skipped(EQueryStepId.readCache, EQuerySkipReason.cacheDisabled);

    a_Report?.running(EQueryStepId.filterScope);
    const filtered = filterEventsToQuery(fetched, range, aoi);
    a_Report?.success(EQueryStepId.filterScope, {
      valid: filtered.length,
      total: fetched.length,
    });

    const sorted = sortEventSchema(filtered, a_Config.sort) as IEventSchema[];

    log(
      `[serving] ${cache.toUpperCase()} - ${sorted.length} events, no partition(s), no day(s)`,
      ELogType.info,
    );

    return { events: sorted, cache };
  }

  cache = ECache.hit;

  const dates = enumerateDates(range);
  const partitions = resolvePartitions(a_Config);
  const queryKey = nonSpatialQueryKey(a_Config);

  // The fetch-scoping options (dataset selection, distance-from-port,
  // neural-vessel-type, speed) segregate the physical partition — a request
  // that differs only in a *recoverable* filter (matched/flag/vessel_type/
  // geartype/vessel_id) shares this signature and reuses the same file; see
  // `IPartitionFetchOptions` and "Partition fetch options" in
  // `docs/tech/serving-strategy.md`.
  const fetchOptions = partitionFetchOptions(a_Config);
  const optionsSignature = partitionOptionsSignature(fetchOptions);

  a_Report?.running(EQueryStepId.cacheCheck);
  const manifest = servingRepository.readCoverage();

  // The (coarse) cells this AOI needs covered. Empty only when no AOI geometry
  // can be resolved — then we can't gate spatially and always fetch.
  const coverageCells = aoi
    ? getAOIH3Cells(aoi.geometry, COVERAGE_H3_RES)
    : new Set<string>();
  const cellList = Array.from(coverageCells);

  const missingDates =
    cellList.length === 0
      ? dates
      : dates.filter(
          (date) => !hasCoverage(manifest, date, queryKey, cellList),
        );

  a_Report?.success(EQueryStepId.cacheCheck, {
    daysCached: dates.length - missingDates.length,
    daysTotal: dates.length,
  });

  if (missingDates.length > 0) {
    cache = ECache.miss;

    a_Report?.running(EQueryStepId.fetchProvider);

    // Align the fetch to the cells' bounding box so each cell we mark covered is
    // fully fetched (a covered cell must never be partially populated). A single
    // call covers the whole window; route each event to its (day, region) bucket.
    //
    // The recoverable predicates (matched/flag/vessel_type/geartype/vessel_id)
    // are stripped out of the fetch first, so the partition always caches the
    // FULL raw set for `fetchOptions` — those predicates are enforced at read
    // time instead (`applyRecoverableEventFilters`), never by narrowing what
    // gets fetched/cached here.
    const sanitizedUrlParams = sanitizeFetchUrlParams(
      a_Config.url_params as unknown as Record<string, unknown>,
    );

    let fetchConfig: IConfigJSON = {
      ...a_Config,
      url_params: sanitizedUrlParams,
    } as unknown as IConfigJSON;
    if (a_Config.method === EFetchMethods.post && coverageCells.size > 0) {
      fetchConfig = {
        ...a_Config,
        url_params: sanitizedUrlParams,
        body_params: { geojson: cellSetBBoxGeometry(coverageCells) },
      } as unknown as IConfigJSON;
    }

    const { valid: fetched, rejected } = await getDetections(fetchConfig);
    a_Report?.success(EQueryStepId.fetchProvider, {
      count: fetched.length,
      rejected: rejected.length,
    });

    const missing = new Set(missingDates);
    const buckets = new Map<string, Map<string, IEventSchema[]>>();

    for (const event of fetched) {
      const date = getEventDate(event);
      if (!missing.has(date)) continue;
      const partition = partitionKey(
        partitionForEvent(event),
        optionsSignature,
      );
      const dayMap = buckets.get(date) ?? new Map<string, IEventSchema[]>();
      const list = dayMap.get(partition) ?? [];
      list.push(event);
      dayMap.set(partition, list);
      buckets.set(date, dayMap);
    }

    a_Report?.running(EQueryStepId.writeCache);
    let partitionsWritten = 0;
    for (const date of missingDates) {
      const dayMap = buckets.get(date);
      if (dayMap) {
        for (const [partition, events] of dayMap) {
          await servingRepository.writePartition(date, partition, events);
          partitionsWritten++;
        }
      }
      // Mark the AOI's cells covered for this day — including days that came
      // back empty, so an identical/subset repeat is a hit, not a re-fetch.
      if (cellList.length > 0) addCoverage(manifest, date, queryKey, cellList);
    }
    if (cellList.length > 0) servingRepository.writeCoverage(manifest);
    a_Report?.success(EQueryStepId.writeCache, {
      partitions: partitionsWritten,
      days: missingDates.length,
    });
  } else {
    a_Report?.skipped(EQueryStepId.fetchProvider, EQuerySkipReason.fullyCached);
    a_Report?.skipped(EQueryStepId.writeCache, EQuerySkipReason.fullyCached);
  }

  // Read resolved region partitions for every day, merging and de-duplicating.
  a_Report?.running(EQueryStepId.readCache);
  const merged: IEventSchema[] = [];
  const seen = new Set<string>();
  for (const date of dates) {
    for (const region of partitions) {
      const partEvents = await servingRepository.readPartition(
        date,
        partitionKey(region, optionsSignature),
      );
      for (const event of partEvents) {
        if (seen.has(event.event_id)) continue;
        seen.add(event.event_id);
        merged.push(event);
      }
    }
  }
  a_Report?.success(EQueryStepId.readCache, { count: merged.length });

  // Filter: time → coarse H3 prune → exact polygon.
  a_Report?.running(EQueryStepId.filterScope);
  const result = filterEventsToQuery(merged, range, aoi);
  a_Report?.success(EQueryStepId.filterScope, {
    valid: result.length,
    total: merged.length,
  });

  const sorted = sortEventSchema(result, a_Config.sort) as IEventSchema[];

  log(
    `[serving] ${cache.toUpperCase()} - ${sorted.length} events, ${partitions.length} partition(s), ${dates.length} day(s)`,
    ELogType.info,
  );

  return { events: sorted, cache };
};
