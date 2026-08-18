import { Request, Response } from 'express';
import {
  controllerResponse,
  createErrorMessage,
} from '../../helpers/utils/controllerUtils';
import { ECacheStatus, EFetchMethods, EStatusCode } from '@packages/enum';

import config from '../../config/pilot.json';

import {
  IConfigJSON,
  IPagination,
  TBodyParams,
  TURLParams,
} from '@packages/types';
import { getStats } from '../../pipeline/aggregate/stats';
import { generateRunMetadata } from '../../pipeline/normalize/generation';
import { applyFilter } from '../../pipeline/normalize/filter';
import {
  enrichEventsWithHotspots,
  generateHotspots,
} from '../../pipeline/aggregate/hotspots';
import { formatTimestamp } from '../../helpers/utils/backendUtils';
import {
  validateBodyParams,
  validateQueryParams,
} from '../../helpers/utils/validationUtils';
import { getServedEvents } from '../../services/ServingService';

export const eventsController = async (
  a_Req: Request<{}, {}, TBodyParams, TURLParams>,
  a_Res: Response,
) => {
  const body = a_Req.body;
  const url_params = a_Req.query;

  try {
    // Validation
    const urlParamsValidation = validateQueryParams(url_params);
    if (!urlParamsValidation.isValid) {
      return controllerResponse(a_Res, EStatusCode.BAD_REQUEST_400, {
        success: false,
        error: createErrorMessage(urlParamsValidation),
      });
    }

    const bodyParamsValidation = validateBodyParams(body);
    if (!bodyParamsValidation.isValid) {
      return controllerResponse(a_Res, EStatusCode.BAD_REQUEST_400, {
        success: false,
        error: createErrorMessage(bodyParamsValidation),
      });
    }

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
    // polygon/H3/time. Replaces the previous in-memory fixture path.
    const { events: servedEvents } = await getServedEvents(configs);

    // Filtering (score / reason-code / distance / context predicates)
    const filteredEvents = applyFilter(servedEvents, configs.filter);

    // Hotspot enrichment over the full filtered set (per-event signals depend
    // on the result set, so they are recomputed per request, before paging).
    const hotspots = generateHotspots(configs, filteredEvents);
    const enrichedEvents = enrichEventsWithHotspots(filteredEvents, hotspots);

    // Pagination
    const total = enrichedEvents.length;
    const limit = Number(pagination.limit);
    const offset = Number(pagination.offset);
    if (offset > total) {
      return controllerResponse(a_Res, EStatusCode.BAD_REQUEST_400, {
        success: false,
        error: [`Invalid offset ${offset}. Total available items: ${total}`],
      });
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

    if (thisPageEvents.length === 0) {
      return controllerResponse(a_Res, EStatusCode.OK_200, {
        success: true,
        metadata,
        pagination: pagination_resp,
        entries: [],
      });
    }

    // Response
    return controllerResponse(a_Res, EStatusCode.OK_200, {
      success: true,
      metadata,
      pagination: pagination_resp,
      stats: getStats(thisPageEvents),
      entries: thisPageEvents,
    });
  } catch (error: any) {
    return controllerResponse(a_Res, EStatusCode.INTERNAL_SERVER_ERROR_500, {
      success: false,
      error: [error],
    });
  }
};
