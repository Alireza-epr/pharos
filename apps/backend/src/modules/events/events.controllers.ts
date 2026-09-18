import { Request, Response } from 'express';
import { EFetchMethods, EResponseError, EStatusCode } from '@packages/enum';
import {
  IEventConfigJSON,
  IEventPostURLParams,
  IResponse,
  TEventBodyParams,
} from '@packages/types';
import {
  controllerResponse,
  createErrorMessage,
} from '../../helpers/utils/controllerUtils';
import {
  validateEventSearchBodyParams,
  validateEventSearchQueryParams,
} from '../../helpers/utils/validationUtils';
import { searchEvents } from '../../services/EventService';
import { log } from '../../helpers/utils/backendUtils';
import { ELogType } from '../../helpers/types/generalTypes';

// POST /v1/events/search -- unlike vessels.controllers.ts's url_params-in-
// query/rest-in-body split, GFW's Events API itself is POST-only (no GET
// variant), so both url_params (limit/offset/sort) AND body_params (the
// actual filters: datasets, vessels, date range, ...) are validated here
// and forwarded as-is. Still a direct pass-through to the provider: no
// scoring, hotspot enrichment, or caching pipeline, same as vessel search.
export const eventSearchController = async (
  a_Req: Request<{}, {}, TEventBodyParams, IEventPostURLParams>,
  a_Res: Response,
) => {
  const url_params = a_Req.query;
  const body = a_Req.body;

  const queryValidation = validateEventSearchQueryParams(url_params);
  if (!queryValidation.isValid) {
    return controllerResponse(a_Res, EStatusCode.BAD_REQUEST_400, {
      success: false,
      error: createErrorMessage(queryValidation),
    });
  }

  const bodyValidation = validateEventSearchBodyParams(body.body_params);
  if (!bodyValidation.isValid) {
    return controllerResponse(a_Res, EStatusCode.BAD_REQUEST_400, {
      success: false,
      error: createErrorMessage(bodyValidation),
    });
  }

  const config: IEventConfigJSON = {
    url: body.url,
    method: EFetchMethods.post,
    url_params: url_params as IEventPostURLParams,
    body_params: body.body_params,
  };

  try {
    const result = await searchEvents(config);

    // `result.metadata` (IMetadata: datasets/vessels/dateRange) is GFW's own
    // Events-API metadata shape, not IResponse<T>'s `metadata: IRunMetadata`
    // -- same deliberate whole-reply passthrough as vessels.controllers.ts,
    // so the cast goes through `unknown` rather than narrowing the reply.
    return controllerResponse(a_Res, EStatusCode.OK_200, {
      success: true,
      ...result,
    } as unknown as IResponse<never>);
  } catch (error: any) {
    const detail = error?.message ?? String(error);
    log(`[events] Unexpected error: ${detail}`, ELogType.error, 2000);

    return controllerResponse(a_Res, EStatusCode.INTERNAL_SERVER_ERROR_500, {
      success: false,
      error: [EResponseError.UnexpectedFailure],
    });
  }
};
