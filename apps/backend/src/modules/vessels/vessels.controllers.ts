import { Request, Response } from 'express';
import { EFetchMethods, EResponseError, EStatusCode } from '@packages/enum';
import {
  IResponse,
  IVesselConfigJSON,
  IVesselListConfigJSON,
  IVesselListURLParams,
  IVesselSearchURLParams,
  TVesselBodyParams,
  TVesselListBodyParams,
} from '@packages/types';
import {
  controllerResponse,
  createErrorMessage,
} from '../../helpers/utils/controllerUtils';
import {
  validateVesselListQueryParams,
  validateVesselSearchQueryParams,
} from '../../helpers/utils/validationUtils';
import { getVesselsByIds, searchVessels } from '../../services/VesselService';
import { log } from '../../helpers/utils/backendUtils';
import { ELogType } from '../../helpers/types/generalTypes';

// POST /v1/vessels/search -- same url_params-in-query/rest-in-body split as
// events.controllers.ts, just carrying IVesselConfigJSON's much smaller
// body (url/method) instead of IConfigJSON's full report config. Still a
// plain validate -> service -> respond controller otherwise: unlike
// events.controllers.ts there's no streaming progress, caching, or scoring
// pipeline here -- vessel identity search is a direct pass-through to the
// provider.
export const vesselSearchController = async (
  a_Req: Request<{}, {}, TVesselBodyParams, IVesselSearchURLParams>,
  a_Res: Response,
) => {
  const url_params = a_Req.query;
  const body = a_Req.body;

  const validation = validateVesselSearchQueryParams(url_params);
  if (!validation.isValid) {
    return controllerResponse(a_Res, EStatusCode.BAD_REQUEST_400, {
      success: false,
      error: createErrorMessage(validation),
    });
  }

  const config: IVesselConfigJSON = {
    url: body.url,
    method: EFetchMethods.get,
    url_params: url_params as IVesselSearchURLParams,
  };

  try {
    const result = await searchVessels(config);

    return controllerResponse(a_Res, EStatusCode.OK_200, {
      success: true,
      ...result,
    } as IResponse<never>);
  } catch (error: any) {

    const detail = error?.message ?? String(error);
    log(`[vessels] Unexpected error: ${detail}`, ELogType.error, 2000);

    return controllerResponse(a_Res, EStatusCode.INTERNAL_SERVER_ERROR_500, {
      success: false,
      error: [EResponseError.UnexpectedFailure],
    });
  }
};


// POST /v1/vessels (list by IDs) -- same url_params-in-query/rest-in-body
// split as vesselSearchController above, carrying IVesselListConfigJSON's
// url/method in the body instead.
export const vesselListController = async (
  a_Req: Request<{}, {}, TVesselListBodyParams, IVesselListURLParams>,
  a_Res: Response,
) => {
  const url_params = a_Req.query;
  const body = a_Req.body;

  const validation = validateVesselListQueryParams(url_params);
  if (!validation.isValid) {
    return controllerResponse(a_Res, EStatusCode.BAD_REQUEST_400, {
      success: false,
      error: createErrorMessage(validation),
    });
  }

  const config: IVesselListConfigJSON = {
    url: body.url,
    method: EFetchMethods.get,
    url_params: url_params as IVesselListURLParams,
  };

  try {
    const result = await getVesselsByIds(config);

    // Same temporary whole-reply passthrough as vesselSearchController --
    // see its own comment.
    return controllerResponse(a_Res, EStatusCode.OK_200, {
      success: true,
      ...result,
    } as IResponse<never>);
  } catch (error: any) {
    const detail = error?.message ?? String(error);
    log(`[vessels] Unexpected error: ${detail}`, ELogType.error, 2000);

    return controllerResponse(a_Res, EStatusCode.INTERNAL_SERVER_ERROR_500, {
      success: false,
      error: [EResponseError.UnexpectedFailure],
    });
  }
};
