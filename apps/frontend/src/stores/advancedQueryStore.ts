import { create } from 'zustand';
import { combine } from 'zustand/middleware';
import { EFormat, EGroupBy, ESpatialResolution, ETemporalResolution } from '@packages/enum';
import { IAdvancedQueryStoreActions, IAdvancedQueryStoreStates } from '../helpers/types/storeTypes';

export const useAdvancedQueryStore = create<IAdvancedQueryStoreStates & IAdvancedQueryStoreActions>(
    combine(
        {
            spatialResolution: ESpatialResolution.HIGH as IAdvancedQueryStoreStates['spatialResolution'],
            format: EFormat.JSON,
            groupBy: EGroupBy.VESSEL_ID as IAdvancedQueryStoreStates['groupBy'],
            temporalResolution: ETemporalResolution.DAILY,
            spatialAggregation: false
        },
        (set, get) => ({
            setSpatialResolution: (a_Value) => set((state) => ({ spatialResolution: typeof a_Value === 'function' ? a_Value(state.spatialResolution) : a_Value })),
            setFormat: (a_Value) => set((state) => ({ format: typeof a_Value === 'function' ? a_Value(state.format) : a_Value })),
            setGroupBy: (a_Value) => set((state) => ({ groupBy: typeof a_Value === 'function' ? a_Value(state.groupBy) : a_Value })),
            setTemporalResolution: (a_Value) => set((state) => ({ temporalResolution: typeof a_Value === 'function' ? a_Value(state.temporalResolution) : a_Value })),
            setSpatialAggregation: (a_Value) => set((state) => ({ spatialAggregation: typeof a_Value === 'function' ? a_Value(state.spatialAggregation) : a_Value })),
            getAdvancedQuery: () => {
                const status = get()
                return status
            },
        })
    )
);
