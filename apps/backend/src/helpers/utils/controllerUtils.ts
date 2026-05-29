import { Response } from 'express';
import {
  IResponse,
  IValidationErrorDetail,
  IValidationResult,
} from '@packages/types';
import { EResponseError, EStatusCode } from '@packages/enum';
import { isObject } from '@packages/utils';

export const controllerResponse = (
  a_Res: Response,
  a_StatusCode: EStatusCode,
  a_Json: IResponse,
) => {
  a_Res.status(a_StatusCode).json(a_Json);
};

export const addError = (
  a_Errors: IValidationErrorDetail[],
  a_Code: EResponseError,
  a_Field: string,
  a_Message: string,
) => {
  a_Errors.push({
    code: a_Code,
    field: a_Field,
    message: a_Message,
  });
};

export const validateRequiredObject = (
  a_Value: unknown,
  a_Field: string,
  a_Errors: IValidationErrorDetail[],
): a_Value is Record<string, any> => {
  if (a_Value === undefined || a_Value === null) {
    addError(
      a_Errors,
      EResponseError.REQUIRED_FIELD_MISSING,
      a_Field,
      `${a_Field} is required`,
    );
    return false;
  }

  if (!isObject(a_Value)) {
    addError(
      a_Errors,
      EResponseError.INVALID_OBJECT,
      a_Field,
      `${a_Field} must be an object`,
    );
    return false;
  }

  return true;
};

export const createErrorMessage = (
  a_ValidatioErrors: IValidationResult,
): EResponseError[] | undefined => {
  if (a_ValidatioErrors.errors === null) return undefined;
  return a_ValidatioErrors.errors.map((e) => e.code);
};
