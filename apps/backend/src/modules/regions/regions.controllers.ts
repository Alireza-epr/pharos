import { Request, Response } from 'express';
import {
  controllerResponse,
  createErrorMessage,
} from '../../helpers/utils/controllerUtils';
import {
  validateRegionGeometryQueryParams,
  validateRegionsQueryParams,
} from '../../helpers/utils/validationUtils';
import { getRegionOptions } from '../../helpers/geo/regionOptions';
import { findEEZById, findMPAById } from '../../helpers/geo/spatial';
import { EContextLayers, EStatusCode } from '@packages/enum';
import { TRegionGeometry, TRegionOptionFeature } from '@packages/types';

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
  const featureCollection: TRegionOptionFeature | undefined =
    getRegionOptions(dataset);

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

export const regionGeometryController = (a_Req: Request, a_Res: Response) => {
  const query = a_Req.query;

  const validation = validateRegionGeometryQueryParams(query);
  if (!validation.isValid) {
    return controllerResponse(a_Res, EStatusCode.BAD_REQUEST_400, {
      success: false,
      error: createErrorMessage(validation),
    });
  }

  const dataset = query.dataset as EContextLayers;
  const id = String(query.id);

  // Only EEZ/MPA have boundary polygons to look up -- Bathymetry (the third
  // EContextLayers member) is a point-sampled depth reading, not a region.
  const feature =
    dataset === EContextLayers.eez
      ? findEEZById(id)
      : dataset === EContextLayers.mpa
        ? findMPAById(id)
        : null;

  if (!feature) {
    return controllerResponse(a_Res, EStatusCode.BAD_REQUEST_400, {
      success: false,
      error: [`No ${dataset} geometry found for id ${id}.`],
    });
  }

  return controllerResponse(a_Res, EStatusCode.OK_200, {
    success: true,
    entries: [feature as TRegionGeometry],
  });
};
