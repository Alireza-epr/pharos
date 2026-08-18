import { create } from 'zustand';
import { combine } from 'zustand/middleware';
import {
  ISortOrderStoreActions,
  ISortOrderStoreStates,
} from '../helpers/types/storeTypes';
import { ISortOption } from '@packages/types';

const defaultSorts: ISortOption[] = [
  { sortBy: 'scoring.triage_score', direction: 'desc' },
  { sortBy: 'scoring.uncertainty_score', direction: 'asc' },
  { sortBy: 'timestamp_utc', direction: 'desc' },
];

export const useSortOrderStore = create<
  ISortOrderStoreStates & ISortOrderStoreActions
>(
  combine(
    {
      sort: defaultSorts as ISortOrderStoreStates['sort'],
    },
    (set, get) => ({
      setSort: (a_Value) =>
        set((state) => ({
          sort: typeof a_Value === 'function' ? a_Value(state.sort) : a_Value,
        })),
      getSortOrder: () => ({ sort: get().sort }),
      importSortOrder: (a_Data) => set({ sort: a_Data.sort }),
    }),
  ),
);
