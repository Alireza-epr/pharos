import { create } from 'zustand';
import { combine } from 'zustand/middleware';
import { ETheme } from '../helpers/enum/storeEnum';
import {
  IEventStoreActions,
  IEventStoreStates,
} from '../helpers/types/storeTypes';

export const useEventStore = create<IEventStoreStates & IEventStoreActions>(
  combine(
    {
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
    }),
  ),
);
