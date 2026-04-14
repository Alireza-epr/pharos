import { Response } from "express";
import { IResponse } from '@packages/types';
import { EStatusCode } from '@packages/enum';

export const controllerResponse = (a_Res:Response ,a_StatusCode: EStatusCode, a_Json: IResponse & { [key: string]: any }) => {
    a_Res.status(a_StatusCode).json(a_Json)
} 