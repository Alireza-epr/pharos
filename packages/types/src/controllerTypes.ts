import { EResponseError, EResponseMessage } from "@packages/enum";
import { IEventSchema, IRunMetadata } from "./eventTypes";
import { IStats } from "./generalTypes";

export interface IResponse {
  success?: boolean;
  error?: (EResponseError | IValidationError)[];
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

export interface IValidationError {
  field: string;
  message: EResponseError;
}

export interface IValidationResult {
  isValid: boolean;
  errors: IValidationError[] | null;
}
