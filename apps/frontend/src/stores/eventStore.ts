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
      selectedEvent: null as IEventStoreStates['selectedEvent'],
    },
    (set) => ({
      setSelectedEvent: (a_Value) =>
        set((state) => ({
          selectedEvent:
            typeof a_Value === 'function'
              ? a_Value(state.selectedEvent)
              : a_Value,
        })),
      setEvents: (a_Value) =>
        set((state) => ({
          events:
            typeof a_Value === 'function' ? a_Value(state.events) : a_Value,
        })),
    }),
  ),
);
