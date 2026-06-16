import { create } from 'zustand';
import { combine } from 'zustand/middleware';
import { IAOIStoreActions, IAOIStoreStates } from '../helpers/types/storeTypes';
import { ERegionDatasets } from '@packages/enum';

export const useAOIStore = create<IAOIStoreStates & IAOIStoreActions>(
    combine(
        {
            zonal: false,
            point: false,
            feature: null as IAOIStoreStates["feature"],
            eezOptions: [] as IAOIStoreStates["eezOptions"],
            eezActive: undefined as IAOIStoreStates["eezActive"],
            mpaOptions: [] as IAOIStoreStates["mpaOptions"],
            mpaActive: undefined as IAOIStoreStates["mpaActive"],
        },
        (set, get) => ({
            setZonal: (a_Value) =>
                set((state) => ({
                    zonal: typeof a_Value === 'function' ? a_Value(state.zonal) : a_Value,
                })),
            setPoint: (a_Value) =>
                set((state) => ({
                    point: typeof a_Value === 'function' ? a_Value(state.point) : a_Value,
                })),
            setEEZOptions: (a_Value) =>
                set((state) => ({
                    eezOptions: typeof a_Value === 'function' ? a_Value(state.eezOptions) : a_Value,
                })),
            setEEZActive: (a_Value) =>
                set((state) => ({
                    eezActive: typeof a_Value === 'function' ? a_Value(state.eezActive) : a_Value,
                })),
            setMPAOptions: (a_Value) =>
                set((state) => ({
                    mpaOptions: typeof a_Value === 'function' ? a_Value(state.mpaOptions) : a_Value,
                })),
            setMPAActive: (a_Value) =>
                set((state) => ({
                    mpaActive: typeof a_Value === 'function' ? a_Value(state.mpaActive) : a_Value,
                })),
            getAOI: () => {
                const { eezActive, mpaActive, feature } = get()
                if (eezActive) return { "region-dataset": ERegionDatasets.eez, "region-id": eezActive.value }
                if (mpaActive) return { "region-dataset": ERegionDatasets.mpa, "region-id": mpaActive.value }
                return feature
            },
        }),
    ),
);