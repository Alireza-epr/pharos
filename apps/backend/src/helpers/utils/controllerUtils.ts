import { Response } from "express";
import { EStatusCode, IResponse } from '@packages/types';

export const controllerResponse = (a_Res:Response ,a_StatusCode: EStatusCode, a_Json: IResponse & { [key: string]: any }) => {
    a_Res.status(a_StatusCode).json(a_Json)
} 