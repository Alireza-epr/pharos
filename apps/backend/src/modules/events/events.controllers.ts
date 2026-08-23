import { Request, Response } from 'express';
import { createErrorMessage } from '../../helpers/utils/controllerUtils';
import {
  ECacheStatus,
  EFetchMethods,
  EQueryStepId,
  EResponseError,
} from '@packages/enum';

import config from '../../config/pilot.json';

import {
  IConfigJSON,
  IPagination,
  TBodyParams,
  TURLParams,
} from '@packages/types';
import { getStats } from '../../pipeline/aggregate/stats';
import {
  generateRunMetadata,
  rescoreEvents,
  stampRunMetadata,
} from '../../pipeline/normalize/generation';
import { applyFilter, applyRecoverableEventFilters } from '../../pipeline/normalize/filter';
import { recoverableEventFilters } from '../../helpers/utils/servingUtils';
import {
  enrichEventsWithHotspots,
  generateHotspots,
} from '../../pipeline/aggregate/hotspots';
import { formatTimestamp, log } from '../../helpers/utils/backendUtils';
import { ELogType } from '../../helpers/types/generalTypes';
import {
  validateBodyParams,
  validateQueryParams,
} from '../../helpers/utils/validationUtils';
import { getServedEvents } from '../../services/ServingService';
import { ProgressStream } from '../../helpers/utils/progressStream';

export const eventsController = async (
  a_Req: Request<{}, {}, TBodyParams, TURLParams>,
  a_Res: Response,
) => {
  const body = a_Req.body;
  const url_params = a_Req.query;

  const stream = new ProgressStream(a_Res);

  try {
    // Validation
    stream.running(EQueryStepId.validate);
    const urlParamsValidation = validateQueryParams(url_params);
    if (!urlParamsValidation.isValid) {
      const error = createErrorMessage(urlParamsValidation);
      stream.error(EQueryStepId.validate, 'Invalid query parameters');
      return stream.result({ success: false, error });
    }

    const bodyParamsValidation = validateBodyParams(body);
    if (!bodyParamsValidation.isValid) {
      const error = createErrorMessage(bodyParamsValidation);
      stream.error(EQueryStepId.validate, 'Invalid request body');
      return stream.result({ success: false, error });
    }
    stream.success(EQueryStepId.validate);

    // Configuration
    const threshold = body.threshold ?? config.threshold;
    const sort = body.sort ?? config.sort;
    const hotspot = body.hotspot ?? config.hotspot;
    const pagination = body.pagination ?? config.pagination;
    const URL = body.URL;
    const cache = body.cache ?? ECacheStatus.enabled;

    const filter = body.filter ?? {};

    const base_config = {
      URL,
      url_params,
      threshold,
      sort,
      hotspot,
      filter,
      pagination,
      gitCommitSHA: a_Req.gitCommitSHA,
      cache
    };

    const configs: IConfigJSON = !body.body_params
      ? {
          ...base_config,
          method: EFetchMethods.get,
        }
      : {
          ...base_config,
          method: EFetchMethods.post,
          body_params: body.body_params,
        };

    // Live partitioned serving path: resolve partitions, read the Parquet
    // cache (fetching + enriching from the provider on a miss), and filter by
    // polygon/H3/time. Replaces the previous in-memory fixture path. Reports
    // its own sub-steps (cache-check/fetch-provider/write-cache/read-cache/
    // filter-scope) straight into `stream`.
    const { events: servedEvents } = await getServedEvents(configs, stream);

    // A cached event's `scoring` reflects whatever `threshold` was active on
    // the request that originally populated its partition — recompute it for
    // THIS request's threshold before any score-based filtering runs, so
    // triage/uncertainty predicates (and the scores themselves) are never
    // stale, cache hit or not. See `rescoreEvents`.
    const rescoredEvents = rescoreEvents(servedEvents, configs);

    // Filtering (score / reason-code / distance / context predicates), plus
    // the `filters[i]` predicates recoverable from a cached raw event
    // (matched/flag/vessel_type/geartype/vessel_id) — enforced here rather
    // than by narrowing the provider fetch, so it applies identically
    // regardless of cache state. See "Partition fetch options" in
    // `docs/tech/serving-strategy.md`.
    stream.running(EQueryStepId.filterPredicates);
    const recoverableFiltered = applyRecoverableEventFilters(
      rescoredEvents,
      recoverableEventFilters(configs),
    );
    const filteredEvents = applyFilter(recoverableFiltered, configs.filter);
    stream.success(EQueryStepId.filterPredicates, {
      matched: filteredEvents.length,
      total: rescoredEvents.length,
    });

    // Hotspot enrichment over the full filtered set (per-event signals depend
    // on the result set, so they are recomputed per request, before paging).
    stream.running(EQueryStepId.hotspots);
    const hotspots = generateHotspots(configs, filteredEvents);
    const enrichedEvents = enrichEventsWithHotspots(filteredEvents, hotspots);
    stream.success(EQueryStepId.hotspots, { count: hotspots.length });

    // Pagination
    stream.running(EQueryStepId.paginate);
    const total = enrichedEvents.length;
    const limit = Number(pagination.limit);
    const offset = Number(pagination.offset);
    if (offset > total) {
      const message = `Invalid offset ${offset}. Total available items: ${total}`;
      stream.error(EQueryStepId.paginate, message);
      return stream.result({ success: false, error: [message] });
    }

    const totalPages = Math.ceil(total / limit);
    const currentPage = Math.floor(offset / limit) + 1;

    const thisPageEvents = enrichedEvents.slice(offset, offset + limit);
    const pageSize = thisPageEvents.length;
    const nextOffset = offset + limit >= total ? null : offset + limit;

    const prevOffset = offset === 0 ? null : Math.max(0, offset - limit);

    const pagination_resp: IPagination = {
      ...pagination,
      total,
      nextOffset,
      prevOffset,
      pageSize,
      totalPages,
      currentPage,
    };

    // Metadata
    const end = formatTimestamp();
    const metadata = await generateRunMetadata(
      [configs],
      enrichedEvents,
      a_Req.start_time,
      end,
    );

    // A cached event's own `run_metadata` still describes whichever request
    // originally fetched it into the partition (config hash, git commit, run
    // time) — stamp the page actually being returned with THIS request's
    // metadata instead, so an exported event's `run_metadata` always matches
    // the query that produced it, not whatever happened to populate the cache.
    const responseEvents = stampRunMetadata(thisPageEvents, metadata);

    stream.success(EQueryStepId.paginate, {
      pageSize,
      total,
      currentPage,
      totalPages,
    });

    if (responseEvents.length === 0) {
      return stream.result({
        success: true,
        metadata,
        pagination: pagination_resp,
        entries: [],
      });
    }

    // Response
    return stream.result({
      success: true,
      metadata,
      pagination: pagination_resp,
      stats: getStats(responseEvents),
      entries: responseEvents,
    });
  } catch (error: any) {
    // Full detail (which can include upstream provider payloads, e.g. GFW's
    // error body) is for the server log only — never the client.
    const detail = error?.message ?? String(error);
    log(`[events] Unexpected error: ${detail}`, ELogType.error, 2000);

    // errorCurrent()/result() are no-ops once the client is gone (see
    // ProgressStream), so this is safe to call unconditionally.
    stream.errorCurrent(EResponseError.UnexpectedFailure);
    return stream.result({
      success: false,
      error: [EResponseError.UnexpectedFailure],
    });
  }
};
