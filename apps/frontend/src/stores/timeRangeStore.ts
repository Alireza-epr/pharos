import { create } from 'zustand';
import { combine } from 'zustand/middleware';
import {
  ITimeRangeStoreActions,
  ITimeRangeStoreStates,
} from '../helpers/types/storeTypes';
import { getLocaleISOString } from '@packages/utils';
import { EPastTime } from '@packages/enum';

export const useTimeRangeStore = create<
  ITimeRangeStoreStates & ITimeRangeStoreActions
>(
  combine(
    {
      dateFrom: getLocaleISOString(new Date(), {
        unit: EPastTime.months,
        value: 1,
      }) as ITimeRangeStoreStates['dateFrom'],
      dateTo: getLocaleISOString(new Date()) as ITimeRangeStoreStates['dateTo'],
    },
    (set) => ({
      setDateFrom: (a_Value) =>
        set((state) => ({
          dateFrom:
            typeof a_Value === 'function' ? a_Value(state.dateFrom) : a_Value,
        })),
      setDateTo: (a_Value) =>
        set((state) => ({
          dateTo:
            typeof a_Value === 'function' ? a_Value(state.dateTo) : a_Value,
        })),
    }),
  ),
);
