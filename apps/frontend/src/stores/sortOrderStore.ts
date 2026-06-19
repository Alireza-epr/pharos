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
      sorts: defaultSorts as ISortOrderStoreStates['sorts'],
    },
    (set) => ({
      setSorts: (a_Value) =>
        set((state) => ({
          sorts: typeof a_Value === 'function' ? a_Value(state.sorts) : a_Value,
        })),
    }),
  ),
);
