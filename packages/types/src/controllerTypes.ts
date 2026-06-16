import { EResponseError, EViolationError } from "@packages/enum";
import { IRunMetadata } from "./eventTypes";
import { IStats } from "./generalTypes";

export interface IResponse<T> {
  success?: boolean;
  error?: (EResponseError | IValidationError | string)[];
  pagination?: IPagination;
  stats?: IStats;
  metadata?: IRunMetadata;
  entries?: T[];
  accessToken?: string;
  refreshToken?: string;
}

export interface IValidationError {
  field: string;
  message: EResponseError | EViolationError;
}

export interface IValidationResult {
  isValid: boolean;
  errors: IValidationError[] | null;
}

export interface IPagination {
  total?: number | null;
  limit?: number | null;
  offset?: number | null;
  nextOffset?: number | null;
  prevOffset?: number | null;
  pageSize?: number | null;
  totalPages?: number | null;
  currentPage?: number | null;
}

export type TPaginationConfig = Pick<IPagination, "limit" | "offset">
