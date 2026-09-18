import { create } from 'zustand';
import { combine } from 'zustand/middleware';
import {
  ITimeRangeQuery,
  ITimeRangeStoreActions,
  ITimeRangeStoreStates,
} from '../helpers/types/storeTypes';
import { getLocaleISOString } from '@packages/utils';
import { EPastTime } from '@packages/enum';

// Native <input type="datetime-local"> (DateInput.tsx) commonly reports its
// value as 'YYYY-MM-DDTHH:mm' -- WITHOUT seconds -- once a user actually
// edits it via the picker widget, even with step="1" set on the input;
// seconds only show up if the browser's widget happens to expose (and the
// user touches) a seconds sub-field. getTimeRange() below blindly appends
// 'Z' assuming HH:mm:ss precision, so an edited-but-not-normalized value
// produces a malformed 'date-range' (e.g. '2025-12-01T00:00Z', missing
// ':00' seconds) that the provider rejects with a 422 -- confirmed live.
// Normalized once here, at the single point every setter goes through,
// rather than defensively re-checked by every caller (getTimeRange() here,
// the Event tab's buildEventSearchConfig(), and any future consumer of
// dateFrom/dateTo, since this store is now shared between both tabs).
const ensureSeconds = (a_Value: string): string =>
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(a_Value) ? `${a_Value}:00` : a_Value;

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
          dateFrom: ensureSeconds(
            typeof a_Value === 'function' ? a_Value(state.dateFrom) : a_Value,
          ),
        })),
      setDateTo: (a_Value) =>
        set((state) => ({
          dateTo: ensureSeconds(
            typeof a_Value === 'function' ? a_Value(state.dateTo) : a_Value,
          ),
        })),
      getTimeRange: (): ITimeRangeQuery => {
        const { dateFrom, dateTo } = get();
        return { 'date-range': `${dateFrom}Z,${dateTo}Z` };
      },
      importTimeRange: (a_Data) => {
        const [from, to] = (a_Data['date-range'] ?? '').split(',');
        set({
          dateFrom: ensureSeconds((from ?? '').replace(/Z$/, '')),
          dateTo: ensureSeconds((to ?? '').replace(/Z$/, '')),
        });
      },
    }),
  ),
);
