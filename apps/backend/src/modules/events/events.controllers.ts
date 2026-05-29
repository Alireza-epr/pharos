import { Request, Response } from 'express';
import { controllerResponse, createErrorMessage } from '../../helpers/utils/controllerUtils';
import { EResponseMessage, EStatusCode } from '@packages/enum';
import { samples } from "./events.samples"

import { IEventSchema } from '@packages/types';
import { validateBodyParams, validateQueryParams } from './events.validators';

export const eventsController = (a_Req: Request, a_Res: Response) => {

    const bodyParams = a_Req.body
    const urlParams = a_Req.query

    console.log("urlParams")
    console.log(urlParams)
    console.log("bodyParams")
    console.log(bodyParams)

    const urlParamsValidation = validateQueryParams(urlParams)
    if (!urlParamsValidation.isValid) {
        return controllerResponse(a_Res, EStatusCode.BAD_REQUEST_400, {
            success: false,
            error: createErrorMessage(urlParamsValidation)
        })
    }

    const bodyParamsValidation = validateBodyParams(bodyParams)
    if (!bodyParamsValidation.isValid) {
        return controllerResponse(a_Res, EStatusCode.BAD_REQUEST_400, {
            success: false,
            error: createErrorMessage(bodyParamsValidation)
        })
    }

    const events = samples as IEventSchema[]

    return controllerResponse(a_Res, EStatusCode.OK_200, {
        success: true,
        message: EResponseMessage.Done,
    });
};