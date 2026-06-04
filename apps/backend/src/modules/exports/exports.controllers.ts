import { Request, Response } from 'express';
import { controllerResponse } from '../../helpers/utils/controllerUtils';
import { EFetchMethods, EResponseMessage, EStatusCode } from '@packages/enum';
import config from '../../config/pilot.json';
import { IConfigJSON, TBodyParams, TURLParams } from '@packages/types';
import URLs from '../../config/globalFishingWatch.json';
import { evidenceExport } from '../../pipeline/export/bundle';

export const evidenceController = async (
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

  // Configuration
  const threshold = body?.threshold ?? config.threshold;
  const sort = body?.sort ?? config.sort;
  const hotspot = body?.hotspot ?? config.hotspot;

  const filter = body?.filter ?? {};
  const body_params = body?.body_params ?? null;

  const configs: IConfigJSON = {
    method: EFetchMethods.post,
    URL: URLs.url['4wings'].endpoints.report,
    body_params,
    url_params,
    threshold,
    sort,
    hotspot,
    filter,
    gitCommitSHA: a_Req.gitCommitSHA,
    output: 'data/out/exports/',
    export: {
      'events.csv': true,
      'event.geojson': true,
      'run_metadata.json': true,
    },
  };

  await evidenceExport(configs, events, a_Req.start_time, undefined, true);

  return controllerResponse(a_Res, EStatusCode.OK_200, {
    success: true,
  });
};
