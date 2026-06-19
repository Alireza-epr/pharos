import { create } from 'zustand';
import { combine } from 'zustand/middleware';
import { EHotspotTimeBins } from '@packages/enum';
import {
  IHotspotConfigStoreActions,
  IHotspotConfigStoreStates,
} from '../helpers/types/storeTypes';

export const useHotspotConfigStore = create<
  IHotspotConfigStoreStates & IHotspotConfigStoreActions
>(
  combine(
    {
      resolution: 5 as IHotspotConfigStoreStates['resolution'],
      timeBin: EHotspotTimeBins.HOURLY,
    },
    (set, get) => ({
      setResolution: (a_Value) =>
        set((state) => ({
          resolution:
            typeof a_Value === 'function' ? a_Value(state.resolution) : a_Value,
        })),
      setTimeBin: (a_Value) =>
        set((state) => ({
          timeBin:
            typeof a_Value === 'function' ? a_Value(state.timeBin) : a_Value,
        })),
      getHotspot: () => {
        const state = get();
        return {
          resolution: state.resolution,
          timeBin: state.timeBin,
        };
      },
    }),
  ),
);
