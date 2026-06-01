import { Request, Response, NextFunction } from "express";
import { report_response, report_response_rate_limit_exceeded } from './events.samples';
import { validateViolation } from "./events.validators";
import { controllerResponse, createErrorMessage } from "../../helpers/utils/controllerUtils";
import { EStatusCode } from "@packages/enum";

export const rateLimitMiddleware = async (
    a_Req: Request,
    a_Res: Response,
    a_Next: NextFunction
) => {
    try {
        const result = report_response
        const validation = validateViolation(result.headers);

        if (!validation.isValid) {
            return controllerResponse(a_Res, EStatusCode.TOO_MANY_REQUESTS, {
                success: false,
                error: createErrorMessage(validation)
            })
        }

        a_Req.events = result.data
        return a_Next()
    } catch (err: any) {
        // fallback for provider 429 without headers
        if (err?.status === 429) {
            return controllerResponse(a_Res, EStatusCode.TOO_MANY_REQUESTS, {
                success: false,
                error: [err.message ?? err]
            })
        } 

        return controllerResponse(a_Res, EStatusCode.INTERNAL_SERVER_ERROR_500, {
            success: false,
            error: [err.message ?? err]
        })
        
    }
};