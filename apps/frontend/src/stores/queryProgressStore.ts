import { create } from 'zustand';
import { combine } from 'zustand/middleware';
import { EQueryStepStatus, QUERY_STEP_ORDER } from '@packages/enum';
import {
  IQueryProgressStoreActions,
  IQueryProgressStoreStates,
} from '../helpers/types/storeTypes';

const initialSteps = (): IQueryProgressStoreStates['steps'] =>
  QUERY_STEP_ORDER.map((id) => ({ id, status: EQueryStepStatus.pending }));

export const useQueryProgressStore = create<
  IQueryProgressStoreStates & IQueryProgressStoreActions
>(
  combine(
    {
      isOpen: false as IQueryProgressStoreStates['isOpen'],
      isRunning: false as IQueryProgressStoreStates['isRunning'],
      steps: initialSteps(),
    },
    (set) => ({
      start: () => set({ isOpen: true, isRunning: true, steps: initialSteps() }),
      applyStep: (a_Message) =>
        set((state) => ({
          steps: state.steps.map((step) =>
            step.id === a_Message.id
              ? {
                  id: step.id,
                  status: a_Message.status,
                  ...(a_Message.meta && { meta: a_Message.meta }),
                  ...(a_Message.reason && { reason: a_Message.reason }),
                  ...(a_Message.error && { error: a_Message.error }),
                }
              : step,
          ),
        })),
      // A total request failure (network error, backend unreachable) can happen
      // before the server ever writes a single `step` line - nothing would
      // otherwise mark a step as failed, leaving the checklist stuck at
      // `pending` forever. Attribute it to the first step that hasn't settled
      // yet, mirroring the backend's own "last step started" fallback.
      fail: (a_Error) =>
        set((state) => {
          const target = state.steps.find(
            (step) =>
              step.status === EQueryStepStatus.pending ||
              step.status === EQueryStepStatus.running,
          );
          if (!target) return {};
          return {
            steps: state.steps.map((step) =>
              step.id === target.id
                ? { id: step.id, status: EQueryStepStatus.error, error: a_Error }
                : step,
            ),
          };
        }),
      // The modal is just a *view* onto the current/last run — opening and
      // closing it never touches the run itself. The detection provider
      // allows only one concurrent report per token, and cancelling our own
      // connection doesn't reliably stop a report already accepted upstream,
      // so the Run Query button (see ReportTab) reads `isRunning` to decide
      // whether a click should start a new query or just reopen this one —
      // a run in flight is never silently duplicated just because its modal
      // was dismissed.
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      finish: () => set({ isRunning: false }),
    }),
  ),
);
