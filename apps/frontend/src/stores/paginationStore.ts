import { create } from 'zustand';
import { combine } from 'zustand/middleware';
import {
  IPaginationStoreStates,
  IPaginationStoreActions,
} from '../helpers/types/storeTypes';

export const usePaginationStore = create<
  IPaginationStoreStates & IPaginationStoreActions
>(
  combine(
    {
      limit: 10 as IPaginationStoreStates['limit'],
      offset: 0 as IPaginationStoreStates['offset'],
    },
    (set, get) => ({
      setLimit: (a_Value) =>
        set((state) => ({
          limit: typeof a_Value === 'function' ? a_Value(state.limit) : a_Value,
        })),
      setOffset: (a_Value) =>
        set((state) => ({
          offset:
            typeof a_Value === 'function' ? a_Value(state.offset) : a_Value,
        })),
      getPagination: () => {
        const state = get();
        return {
          limit: state.limit,
          offset: state.offset,
        };
      },
    }),
  ),
);
