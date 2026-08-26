import { create } from 'zustand';
import { combine } from 'zustand/middleware';

import {
  IVesselStoreActions,
  IVesselStoreStates,
} from '../helpers/types/storeTypes';

// Mirrors eventStore.ts: holds whatever the last search returned, plus
// which record is currently selected -- extended with GFW's scroll-cursor
// pagination state (see the doc comment on IVesselStoreStates for why it's
// shaped the way it is, unlike the Report tab's offset-based paginationStore).
export const useVesselStore = create<IVesselStoreStates & IVesselStoreActions>(
  combine(
    {
      vessels: [] as IVesselStoreStates['vessels'],
      activeVessel: null as IVesselStoreStates['activeVessel'],
      selectedVessels: [] as IVesselStoreStates['selectedVessels'],
      pages: [] as IVesselStoreStates['pages'],
      pageIndex: 0,
      since: null as IVesselStoreStates['since'],
      total: null as IVesselStoreStates['total'],
      lastParams: null as IVesselStoreStates['lastParams'],
    },
    (set) => ({
      setVessels: (a_Value) =>
        set((state) => ({
          vessels:
            typeof a_Value === 'function' ? a_Value(state.vessels) : a_Value,
        })),
      setActiveVessel: (a_Value) =>
        set((state) => ({
          activeVessel:
            typeof a_Value === 'function'
              ? a_Value(state.activeVessel)
              : a_Value,
        })),
      setSelectedVessels: (a_Value) =>
        set((state) => ({
          selectedVessels:
            typeof a_Value === 'function'
              ? a_Value(state.selectedVessels)
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
      setSince: (a_Value) =>
        set((state) => ({
          since: typeof a_Value === 'function' ? a_Value(state.since) : a_Value,
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
