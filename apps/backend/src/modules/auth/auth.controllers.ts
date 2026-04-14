import { Request, Response } from "express";
import { controllerResponse } from "../../helpers/utils/controllerUtils";
import { EResponseError, EResponseMessage, EStatusCode } from "@packages/enum";
import { users } from "./auth.users";
import { log } from "../../helpers/utils/backendUtils";
import { ELogType } from "../../helpers/types/generalTypes";
import { getUser, verifyToken } from "../../helpers/utils/tokenUtils";

export const loginController = (a_Req: Request, a_Res: Response) => {

    // --- User/Pass Login ---
    // Support both JSON body and query parameters
    const username = a_Req.body?.username || a_Req.query?.username;
    const password = a_Req.body?.password || a_Req.query?.password;


    if (username && password) {


        // Simulated database record
        const userFromDB = users.find(u => u.username === username && u.password === password)

        if (userFromDB) {
            log(`[Login] User ${username} logged in`, ELogType.success);
            const user = getUser(userFromDB.username, userFromDB.role) //Get User from DB
            return controllerResponse(a_Res, EStatusCode.OK_200, { message: EResponseMessage.Done, accessToken: user.accessToken, refreshToken: user.refreshToken })
        } else {
            log(`[Login] Failed login attempt for user: ${username}`, ELogType.error);
            return controllerResponse(a_Res, EStatusCode.UNAUTHORIZED_401, { error: EResponseError.InvalidCredentials })
        }
    } else {
        return controllerResponse(a_Res, EStatusCode.BAD_REQUEST_400, { error: EResponseError.CredentialIsRequired })
    }

}

export const checkTokenController = (a_Req: Request, a_Res: Response) => {
    // Support both JSON body and query parameters
    const token = a_Req.body?.token || a_Req.query?.token;

    if(token) {
        try {
            const tokenVerification = verifyToken(token)
            return controllerResponse(a_Res, EStatusCode.OK_200, { message: EResponseMessage.Done })
        } catch (err) {
            log(`[Login] Failed verify token: ${err}`, ELogType.error);
            return controllerResponse(a_Res, EStatusCode.BAD_REQUEST_400, { error: EResponseError.InvalidOrExpiredToken })
        }
        
    } else {
        return controllerResponse(a_Res, EStatusCode.BAD_REQUEST_400, { error: EResponseError.InvalidOrExpiredToken })
    }
} 