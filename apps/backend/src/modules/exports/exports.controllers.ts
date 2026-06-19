import { Request, Response } from 'express';
import { controllerResponse } from '../../helpers/utils/controllerUtils';
import { EStatusCode } from '@packages/enum';
import {
  IConfigJSON,
  TBodyParams_export,
  TExportConfig,
} from '@packages/types';
import { evidenceExport } from '../../pipeline/export/bundle';
import { getUserInfoFromReq } from '../../helpers/utils/backendUtils';
import { formatTimestamp } from '@packages/utils';
import { generateRunMetadata } from '../../pipeline/normalize/generation';

export const evidenceController = async (
  a_Req: Request<{}, {}, TBodyParams_export, {}>,
  a_Res: Response,
) => {
  const body = a_Req.body;

  if (body === undefined) {
    return controllerResponse(a_Res, EStatusCode.BAD_REQUEST_400, {
      success: false,
      error: [`No body in request`],
    });
  }

  const events = body.events;

  if (events === undefined || events.length === 0) {
    return controllerResponse(a_Res, EStatusCode.BAD_REQUEST_400, {
      success: false,
      error: [`No events available`],
    });
  }

  // Configuration
  const default_export_output = 'data/out/exports/';
  const config_export: TExportConfig = !body.config.export
    ? {
        'events.csv': true,
        'event.geojson': true,
        'run_metadata.json': true,
      }
    : body.config.export;

  const configs: IConfigJSON = {
    ...body.config,
    output: default_export_output,
    export: config_export,
    gitCommitSHA: a_Req.gitCommitSHA,
  };

  try {
    const export_bundle = await evidenceExport(
      configs,
      events,
      a_Req.body.hotspots,
      a_Req.start_time,
      true,
      true,
      getUserInfoFromReq<{}, {}, TBodyParams_export, {}>(a_Req),
    );

    // Response
    if (export_bundle.buffer) {
      return controllerResponse(a_Res, EStatusCode.OK_200, {}, export_bundle);
    } else {
      // Metadata
      const metadata = await generateRunMetadata(
        [configs],
        events,
        a_Req.start_time,
        formatTimestamp(),
      );

      return controllerResponse(a_Res, EStatusCode.INTERNAL_SERVER_ERROR_500, {
        success: false,
        error: ['No export bundle found'],
        metadata,
      });
    }
  } catch (e) {
    // Metadata
    const metadata = await generateRunMetadata(
      [configs],
      events,
      a_Req.start_time,
      formatTimestamp(),
    );

    return controllerResponse(a_Res, EStatusCode.INTERNAL_SERVER_ERROR_500, {
      success: false,
      metadata,
      error: [e instanceof Error ? e.message : String(e)],
    });
  }
};
