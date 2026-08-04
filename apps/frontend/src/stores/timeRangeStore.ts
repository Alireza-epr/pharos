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
    (set, get) => ({
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
      getTimeRange: () => {
        const { dateFrom, dateTo } = get();
        return { 'date-range': `${dateFrom}Z,${dateTo}Z` };
      },
      importTimeRange: (a_Data) => {
        const [from, to] = a_Data['date-range'].split(',');
        set({
          dateFrom: (from ?? '').replace(/Z$/, ''),
          dateTo: (to ?? '').replace(/Z$/, ''),
        });
      },
    }),
  ),
);
