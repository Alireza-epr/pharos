import { create } from 'zustand';
import { combine } from 'zustand/middleware';
import { IBottomStoreStates, IBottomStoreActions} from '../helpers/types/storeTypes';
import { EMatchFilter } from '@packages/enum';
import { ISortOption } from '@packages/types';

const defaultSorts: ISortOption[] = [{ sortBy: 'scoring.triage_score', direction: 'desc' }]

export const useBottomStore = create<IBottomStoreStates & IBottomStoreActions>(
  combine(
    {
      filter: EMatchFilter.all as IBottomStoreStates['filter'],
      sorts: defaultSorts as IBottomStoreStates['sorts'],
    },
    (set) => ({
      setFilter: (a_Value) => set((state) => ({filter: typeof a_Value === 'function' ? a_Value(state.filter) : a_Value,})),
      setSorts: (a_Value) => set((state) => ({sorts: typeof a_Value === 'function' ? a_Value(state.sorts) : a_Value,})),
    }),
  ),
);