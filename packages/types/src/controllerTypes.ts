import { EResponseError, EResponseMessage } from "@packages/enum";
import { IEventSchema, IRunMetadata } from "./eventTypes";
import { IStats } from "./generalTypes";

export interface IResponse {
  success?: boolean;
  error?: (EResponseError | IValidationError | string)[];
  pagination?: IPagination
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

export interface IPagination {
  total?: number | null,
  limit?: number | null,
  nextOffset?: number | null;
  prevOffset?: number | null;
  pageSize?: number | null;
  totalPages?: number | null;
  currentPage?: number | null;
}