import { create } from 'zustand';
import { combine } from 'zustand/middleware';
import {
  IContextLayersStoreActions,
  IContextLayersStoreStates,
} from '../helpers/types/storeTypes';

export const useContextLayersStore = create<
  IContextLayersStoreStates & IContextLayersStoreActions
>(
  combine(
    {
      hotspots: false as IContextLayersStoreStates['hotspots'],
      eezBoundaries: false as IContextLayersStoreStates['eezBoundaries'],
      mpaZones: false as IContextLayersStoreStates['mpaZones'],
      eezGeometries: [] as IContextLayersStoreStates['eezGeometries'],
      mpaGeometries: [] as IContextLayersStoreStates['mpaGeometries'],
    },
    (set) => ({
      setHotspots: (a_Value) =>
        set((state) => ({
          hotspots:
            typeof a_Value === 'function' ? a_Value(state.hotspots) : a_Value,
        })),
      setEezBoundaries: (a_Value) =>
        set((state) => ({
          eezBoundaries:
            typeof a_Value === 'function'
              ? a_Value(state.eezBoundaries)
              : a_Value,
        })),
      setMpaZones: (a_Value) =>
        set((state) => ({
          mpaZones:
            typeof a_Value === 'function' ? a_Value(state.mpaZones) : a_Value,
        })),
      setEezGeometries: (a_Value) =>
        set((state) => ({
          eezGeometries:
            typeof a_Value === 'function'
              ? a_Value(state.eezGeometries)
              : a_Value,
        })),
      setMpaGeometries: (a_Value) =>
        set((state) => ({
          mpaGeometries:
            typeof a_Value === 'function'
              ? a_Value(state.mpaGeometries)
              : a_Value,
        })),
    }),
  ),
);
