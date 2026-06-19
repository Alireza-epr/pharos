import { create } from 'zustand';
import { combine } from 'zustand/middleware';

import {
  IEventStoreActions,
  IEventStoreStates,
} from '../helpers/types/storeTypes';

export const useEventStore = create<IEventStoreStates & IEventStoreActions>(
  combine(
    {
      events: [] as IEventStoreStates['events'],
      activeEvent: null as IEventStoreStates['activeEvent'],
      selectedEvents: [] as IEventStoreStates['selectedEvents'],
    },
    (set) => ({
      setActiveEvent: (a_Value) =>
        set((state) => ({
          activeEvent:
            typeof a_Value === 'function'
              ? a_Value(state.activeEvent)
              : a_Value,
        })),
      setEvents: (a_Value) =>
        set((state) => ({
          events:
            typeof a_Value === 'function' ? a_Value(state.events) : a_Value,
        })),
      setSelectedEvents: (a_Value) =>
        set((state) => ({
          selectedEvents:
            typeof a_Value === 'function'
              ? a_Value(state.selectedEvents)
              : a_Value,
        })),
    }),
  ),
);
