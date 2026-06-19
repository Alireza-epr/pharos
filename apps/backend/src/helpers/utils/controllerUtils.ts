import { Response } from 'express';
import {
  IResponse,
  IValidationError,
  IValidationResult,
} from '@packages/types';
import { EResponseError, EStatusCode, EViolationError } from '@packages/enum';
import { deepSortObject, isObject } from '@packages/utils';
import { IExportBuffer } from '../types/generalTypes';

export const controllerResponse = <T>(
  a_Res: Response,
  a_StatusCode: EStatusCode,
  a_Json: IResponse<T>,
  a_ExportBundle?: IExportBuffer
) => {
  if(!a_ExportBundle) {
    a_Res.status(a_StatusCode).json(deepSortObject(a_Json));
  } else {
    a_Res
    .status(a_StatusCode)
    .set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${a_ExportBundle.filename}.zip"`,
    })
    .send(a_ExportBundle.buffer);
  }
};

export const addError = (
  a_Errors: IValidationError[],
  a_Message: EResponseError | EViolationError,
  a_Field: string,
) => {
  a_Errors.push({
    message: a_Message,
    field: a_Field,
  });
};

export const validateRequiredObject = (
  a_Value: unknown,
  a_Field: string,
  a_Errors: IValidationError[],
): a_Value is Record<string, any> => {
  if (a_Value === undefined || a_Value === null) {
    addError(a_Errors, EResponseError.REQUIRED_FIELD_MISSING, a_Field);
    return false;
  }

  if (!isObject(a_Value)) {
    addError(a_Errors, EResponseError.INVALID_OBJECT, a_Field);
    return false;
  }

  return true;
};

export const createErrorMessage = (
  a_ValidatioErrors: IValidationResult,
): IValidationError[] | undefined => {
  if (a_ValidatioErrors.errors === null) return undefined;
  return a_ValidatioErrors.errors;
};

export const getEnvVariable = (a_Key: string): string | undefined => {
  return process.env[a_Key.toUpperCase()];
};

export const isDevelopment = () => {
  return getEnvVariable('NODE_ENV') === 'development';
};
