import { EResponseError, EResponseMessage } from "@packages/enum";
import { IEventSchema, IRunMetadata } from "./eventTypes";
import { IStats } from "./generalTypes";

export interface IResponse {
  success?: boolean;
  error?: EResponseError[];
  message?: EResponseMessage;
  limit?: number | null;
  offset?: number | null;
  nextOffset?: number | null;
  page_size?: number | null;
  page?: number | null;
  stats?: IStats;
  metadata?: IRunMetadata;
  entries?: Partial<IEventSchema>[];
  accessToken?: string;
  refreshToken?: string;
}

export interface IValidationErrorDetail {
  code: EResponseError;
  field: string;
  message: string;
}

export interface IValidationResult {
  isValid: boolean;
  errors: IValidationErrorDetail[] | null;
}
