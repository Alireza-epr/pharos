import { Request, Response } from 'express';
import { controllerResponse } from '../../helpers/utils/controllerUtils';
import { EFetchMethods, EResponseMessage, EStatusCode } from '@packages/enum';
import config from '../../config/pilot.json';
import { IConfigJSON, TBodyParams, TURLParams } from '@packages/types';
import { evidenceExport } from '../../pipeline/export/bundle';
import { getUserInfoFromReq } from '../../helpers/utils/backendUtils';

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
  const pagination = body.pagination;
  const URL = body.URL

  const filter = body?.filter ?? {};
  const body_params = body?.body_params ?? null;


  const base_config = {
    URL,
    url_params,
    threshold,
    sort,
    hotspot,
    filter,
    pagination,
    gitCommitSHA: a_Req.gitCommitSHA,
  }

  const configs: IConfigJSON = body.method === EFetchMethods.get
    ? {
      ...base_config,
      method: EFetchMethods.get
    } : {
      ...base_config,
      method: EFetchMethods.post,
      body_params: body.body_params!
    };

  await evidenceExport(
    configs,
    events,
    a_Req.start_time,
    undefined,
    true,
    true,
    getUserInfoFromReq<{}, {}, TBodyParams, TURLParams>(a_Req),
  );

  return controllerResponse(a_Res, EStatusCode.OK_200, {
    success: true,
  });
};
