import { create } from 'zustand';
import { combine, persist } from 'zustand/middleware';
import {
  IHistoryStoreActions,
  IHistoryStoreStates,
} from '../helpers/types/storeTypes';

// Oldest entries drop off past this so localStorage doesn't grow unbounded
// over a long session.
const MAX_HISTORY_ENTRIES = 20;

export const useHistoryStore = create<
  IHistoryStoreStates & IHistoryStoreActions
>()(
  persist(
    combine(
      {
        entries: [] as IHistoryStoreStates['entries'],
      },
      (set) => ({
        addEntry: (a_Entry) =>
          set((state) => ({
            entries: [a_Entry, ...state.entries].slice(
              0,
              MAX_HISTORY_ENTRIES,
            ),
          })),
        clearHistory: () => set({ entries: [] }),
      }),
    ),
    { name: 'query-history' },
  ),
);
