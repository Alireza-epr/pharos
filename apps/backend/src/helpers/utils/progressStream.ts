import { Response } from 'express';
import {
  EQueryStepStatus,
  TQueryStepId,
  TQuerySkipReason,
} from '@packages/enum';
import {
  IQueryProgressStepMessage,
  IResponse,
  IStepReporter,
} from '@packages/types';

/**
 * Writes newline-delimited JSON (NDJSON) progress events for POST /v1/events
 * so the frontend can render a step-by-step checklist while the request is
 * still in flight. One line per `write*` call; `result()` is always the last
 * line and carries the same envelope `controllerResponse` would have sent in
 * one shot — only the delivery mechanism changed, the payload contract didn't.
 *
 * The HTTP status is committed to 200 the moment the stream opens (headers
 * flush before the outcome is known), so `success: false` in the final
 * `result` line — not the status code — is what callers must check. This
 * mirrors how the app already reports errors in its JSON envelope.
 */
export class ProgressStream implements IStepReporter {
  private lastRunning: TQueryStepId | null = null;

  constructor(private readonly res: Response) {
    this.res.writeHead(200, {
      'Content-Type': 'application/x-ndjson',
      'Cache-Control': 'no-cache',
    });
    // The client can disconnect mid-request (e.g. closing the progress modal
    // early). Writing to the socket after that is a no-op below, but without
    // this listener a late write can still emit an unhandled 'error' on the
    // response stream and crash the process.
    this.res.on('error', () => {});
  }

  private write(a_Message: IQueryProgressStepMessage) {
    if (this.res.writableEnded || this.res.destroyed) return;
    this.res.write(JSON.stringify(a_Message) + '\n');
  }

  running(a_Id: TQueryStepId) {
    this.lastRunning = a_Id;
    this.write({ type: 'step', id: a_Id, status: EQueryStepStatus.running });
  }

  success(a_Id: TQueryStepId, a_Meta?: Record<string, number>) {
    this.write({
      type: 'step',
      id: a_Id,
      status: EQueryStepStatus.success,
      ...(a_Meta && { meta: a_Meta }),
    });
  }

  skipped(a_Id: TQueryStepId, a_Reason: TQuerySkipReason) {
    this.write({
      type: 'step',
      id: a_Id,
      status: EQueryStepStatus.skipped,
      reason: a_Reason,
    });
  }

  error(a_Id: TQueryStepId, a_Error: string) {
    this.write({
      type: 'step',
      id: a_Id,
      status: EQueryStepStatus.error,
      error: a_Error,
    });
  }

  /** Attributes an unexpected exception to whichever step was last started. */
  errorCurrent(a_Error: string) {
    if (this.lastRunning) this.error(this.lastRunning, a_Error);
  }

  result<T>(a_Payload: IResponse<T>) {
    if (this.res.writableEnded || this.res.destroyed) return;
    this.res.write(
      JSON.stringify({ type: 'result', payload: a_Payload }) + '\n',
    );
    this.res.end();
  }
}
