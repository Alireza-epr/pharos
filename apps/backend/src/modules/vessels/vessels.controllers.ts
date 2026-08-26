import { Request, Response } from 'express';
import { EResponseError, EStatusCode } from '@packages/enum';
import {
  IResponse,
  IVesselListURLParams,
  IVesselSearchURLParams,
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

// GET /v1/vessels/search -- a plain validate -> service -> respond
// controller, same shape as regions.controllers.ts. Unlike events.controllers.ts
// there's no streaming progress, caching, or scoring pipeline here: vessel
// identity search is a direct pass-through to the provider.
export const vesselSearchController = async (
  a_Req: Request,
  a_Res: Response,
) => {
  const query = a_Req.query;

  const validation = validateVesselSearchQueryParams(query);
  if (!validation.isValid) {
    return controllerResponse(a_Res, EStatusCode.BAD_REQUEST_400, {
      success: false,
      error: createErrorMessage(validation),
    });
  }

  try {
    const result = await searchVessels(query as IVesselSearchURLParams);

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


export const vesselListController = async (a_Req: Request, a_Res: Response) => {
  const query = a_Req.query;

  const validation = validateVesselListQueryParams(query);
  if (!validation.isValid) {
    return controllerResponse(a_Res, EStatusCode.BAD_REQUEST_400, {
      success: false,
      error: createErrorMessage(validation),
    });
  }

  try {
    const result = await getVesselsByIds(query as IVesselListURLParams);

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
