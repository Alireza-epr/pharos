import { Request, Response } from 'express';
import {
  controllerResponse,
  createErrorMessage,
} from '../../helpers/utils/controllerUtils';
import { EFetchMethods, EStatusCode } from '@packages/enum';
import { samples } from './events.samples';
import config from "../../config/pilot.json"
import URLs from "../../config/globalFishingWatch.json"

import { IConfigJSON, IEventSchema, IPagination, TBodyParams, TURLParams } from '@packages/types';
import { validateBodyParams, validateQueryParams } from './events.validators';
import { getStats } from '../../pipeline/aggregate/stats';
import { generateRunMetadata } from '../../pipeline/normalize/generation';
import { applyFilter } from '../../pipeline/normalize/filter';

export const eventsController = async (a_Req: Request<{}, {}, TBodyParams, TURLParams>, a_Res: Response) => {
  const gitCommitSHA = a_Req.gitCommitSHA;

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
    const threshold = body.threshold ?? config.threshold
    const sort = body.sort ?? config.sort
    const hotspot = body.hotspot ?? config.hotspot

    const filter = body.filter ?? {}
    const body_params = body.body_params ?? null

    const configs: IConfigJSON = {
      method: EFetchMethods.post,
      URL: URLs.url['4wings'].endpoints.report,
      body_params,
      url_params,
      threshold,
      sort,
      hotspot,
      filter
    }
    const metadata = await generateRunMetadata([configs], gitCommitSHA)

    // Ingestion
    const events = samples as IEventSchema[];

    // Filtering
    const filteredEvents = applyFilter(events, configs.filter)

    // Pagination
    const total = filteredEvents.length;
    const limit = Number(url_params.limit)
    const offset = Number(url_params.offset)
    if (offset > total) {
      return controllerResponse(a_Res, EStatusCode.BAD_REQUEST_400, {
        success: false,
        error: [`Invalid offset ${offset}. Total available items: ${total}`],
      });
    }

    const totalPages = Math.ceil(total / limit);
    const currentPage = Math.floor(offset / limit) + 1;

    const thisPageEvents = filteredEvents.slice(offset, offset + limit)
    const pageSize = thisPageEvents.length
    const nextOffset =
      offset + limit >= total ? null : offset + limit;

    const prevOffset =
      offset === 0 ? null : Math.max(0, offset - limit);

    const pagination: IPagination = {
      total,
      limit,
      nextOffset,
      prevOffset,
      pageSize,
      totalPages,
      currentPage
    }

    // Stats
    if (thisPageEvents.length === 0) {
      return controllerResponse(a_Res, EStatusCode.OK_200, {
        success: true,
        metadata,
        pagination,
        entries: []
      });
    }

    // Response
    return controllerResponse(a_Res, EStatusCode.OK_200, {
      success: true,
      metadata,
      pagination,
      stats: getStats(thisPageEvents),
      entries: thisPageEvents
    });

  } catch (error: any) {
    return controllerResponse(a_Res, EStatusCode.BAD_REQUEST_400, {
      success: false,
      error: [error]
    })
  }
};
