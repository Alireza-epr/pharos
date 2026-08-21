import { TQueryStepId, TQueryStepStatus, TQuerySkipReason } from "@packages/enum";
import { IResponse } from "./controllerTypes";

export interface IQueryProgressStepMessage {
  type: "step";
  id: TQueryStepId;
  status: TQueryStepStatus;
  /** Step-specific counters (e.g. `{ valid, total }`), present on `success`. */
  meta?: Record<string, number>;
  /** Why a `skipped` step didn't run. */
  reason?: TQuerySkipReason;
  /** Failure detail, present on `error`. */
  error?: string;
}

export interface IQueryProgressResultMessage<T> {
  type: "result";
  payload: IResponse<T>;
}

/** One NDJSON line of the POST /v1/events progress stream. */
export type TQueryProgressMessage<T> =
  | IQueryProgressStepMessage
  | IQueryProgressResultMessage<T>;

/**
 * Narrow interface for reporting step transitions. Implemented by the HTTP
 * NDJSON writer but consumed by orchestration code (`ServingService`) that
 * has no business knowing about the transport underneath it.
 */
export interface IStepReporter {
  running(a_Id: TQueryStepId): void;
  success(a_Id: TQueryStepId, a_Meta?: Record<string, number>): void;
  skipped(a_Id: TQueryStepId, a_Reason: TQuerySkipReason): void;
  error(a_Id: TQueryStepId, a_Error: string): void;
}
