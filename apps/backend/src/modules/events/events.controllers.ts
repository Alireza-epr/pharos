import { Request, Response } from 'express';
import {
  controllerResponse,
  createErrorMessage,
} from '../../helpers/utils/controllerUtils';
import { EFetchMethods, EStatusCode } from '@packages/enum';

import config from '../../config/pilot.json';

import {
  IConfigJSON,
  IEventSchema,
  IPagination,
  TBodyParams,
  TURLParams,
} from '@packages/types';
import { getStats } from '../../pipeline/aggregate/stats';
import { generateRunMetadata } from '../../pipeline/normalize/generation';
import { applyFilter } from '../../pipeline/normalize/filter';
import { formatTimestamp } from '../../helpers/utils/backendUtils';
import {
  validateBodyParams,
  validateQueryParams,
} from '../../helpers/utils/validationUtils';

export const eventsController = async (
  a_Req: Request<{}, {}, TBodyParams, TURLParams>,
  a_Res: Response,
) => {
  const events = a_Req.events;
  if (events === undefined) {
    return controllerResponse(a_Res, EStatusCode.INTERNAL_SERVER_ERROR_500, {
      success: false,
      error: [`No events available`],
    });
  }

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

    // Filtering
    const filteredEvents = applyFilter(events, configs.filter);
    // Pagination
    const total = filteredEvents.length;
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

    const thisPageEvents = filteredEvents.slice(offset, offset + limit);
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
      events,
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
