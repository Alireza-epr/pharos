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
import { deepSortObject } from '@packages/utils';
import { generateRunMetadata } from '../../pipeline/normalize/generation';
import { getGitCommitSHA } from '../../helpers/utils/backendUtils';

export const eventsController = async (a_Req: Request<{}, {}, TBodyParams, TURLParams>, a_Res: Response) => {
  const gitCommitSHA = await getGitCommitSHA();

  const body = a_Req.body;
  const url_params = a_Req.query;

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
  const filteredEvents = events.filter( (e) => e.event_id )

  // Pagination
  const total = filteredEvents.length;
  const limit = Number(url_params.limit)
  const offset = Number(url_params.offset)
  const thisPageEvents = filteredEvents.slice( offset, offset+limit )
  const pageSize = thisPageEvents.length
  const nextOffset =
    offset + limit < total
      ? offset + limit
      : null;  // null means no more pages
  const pageNext = "sessionId/next"
  const pagePrev = "sessionId/prev"

  // TODO : Handle pagination using a class Session has session_id holding events + configs(body and queries) + next_page events + prev_page events + errors
  const pagination: IPagination = {
    total,
    limit,
    nextOffset,
    pageSize,
    pageNext,
    pagePrev
  }

  // Response
  return controllerResponse(a_Res, EStatusCode.OK_200, deepSortObject({
    success: true,
    metadata,
    pagination,
    stats: getStats(thisPageEvents),
    entries: thisPageEvents
  }));
};
