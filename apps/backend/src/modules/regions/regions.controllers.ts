import { Request, Response } from 'express';
import {
  controllerResponse,
  createErrorMessage,
} from '../../helpers/utils/controllerUtils';
import { validateRegionsQueryParams } from '../../helpers/utils/validationUtils';
import { getRegionOptions } from '../../helpers/geo/regionOptions';
import { EContextLayers, EStatusCode } from '@packages/enum';
import { TRegionOptionFeature } from '@packages/types';

export const regionsController = (a_Req: Request, a_Res: Response) => {
  const query = a_Req.query;

  const validation = validateRegionsQueryParams(query);
  if (!validation.isValid) {
    return controllerResponse(a_Res, EStatusCode.BAD_REQUEST_400, {
      success: false,
      error: createErrorMessage(validation),
    });
  }

  const dataset = query.dataset as EContextLayers;
  const featureCollection: TRegionOptionFeature | undefined = getRegionOptions(dataset);

  if (!featureCollection) {
    return controllerResponse(a_Res, EStatusCode.BAD_REQUEST_400, {
      success: false,
      error: [`Dataset ${dataset} is not supported.`],
    });
  }

  return controllerResponse(a_Res, EStatusCode.OK_200, {
    success: true,
    entries: featureCollection.features,
  });
};
