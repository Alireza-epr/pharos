import { create } from 'zustand';
import { combine } from 'zustand/middleware';

import {
  IGfwEventStoreActions,
  IGfwEventStoreStates,
} from '../helpers/types/storeTypes';

export const useGfwEventStore = create<
  IGfwEventStoreStates & IGfwEventStoreActions
>(
  combine(
    {
      events: [] as IGfwEventStoreStates['events'],
      activeEvent: null as IGfwEventStoreStates['activeEvent'],
      selectedEvents: [] as IGfwEventStoreStates['selectedEvents'],
      pages: [] as IGfwEventStoreStates['pages'],
      pageIndex: 0,
      total: null as IGfwEventStoreStates['total'],
      lastParams: null as IGfwEventStoreStates['lastParams'],
    },
    (set) => ({
      setEvents: (a_Value) =>
        set((state) => ({
          events:
            typeof a_Value === 'function' ? a_Value(state.events) : a_Value,
        })),
      setActiveEvent: (a_Value) =>
        set((state) => ({
          activeEvent:
            typeof a_Value === 'function'
              ? a_Value(state.activeEvent)
              : a_Value,
        })),
      setSelectedEvents: (a_Value) =>
        set((state) => ({
          selectedEvents:
            typeof a_Value === 'function'
              ? a_Value(state.selectedEvents)
              : a_Value,
        })),
      setPages: (a_Value) =>
        set((state) => ({
          pages: typeof a_Value === 'function' ? a_Value(state.pages) : a_Value,
        })),
      setPageIndex: (a_Value) =>
        set((state) => ({
          pageIndex:
            typeof a_Value === 'function' ? a_Value(state.pageIndex) : a_Value,
        })),
      setTotal: (a_Value) =>
        set((state) => ({
          total: typeof a_Value === 'function' ? a_Value(state.total) : a_Value,
        })),
      setLastParams: (a_Value) =>
        set((state) => ({
          lastParams:
            typeof a_Value === 'function'
              ? a_Value(state.lastParams)
              : a_Value,
        })),
    }),
  ),
);
