import { create } from 'zustand';
import { combine } from 'zustand/middleware';
import { E4wingsDatasetsUI, EFormat, EGroupBy, ETemporalResolution } from '@packages/enum';
import { IAdvancedQueryStoreActions, IAdvancedQueryStoreStates } from '../helpers/types/storeTypes';

export const useAdvancedQueryStore = create<IAdvancedQueryStoreStates & IAdvancedQueryStoreActions>(
    combine(
        {
            spatialResolution: '' as IAdvancedQueryStoreStates['spatialResolution'],
            format: EFormat.JSON,
            groupBy: EGroupBy.VESSEL_ID as IAdvancedQueryStoreStates['groupBy'],
            temporalResolution: ETemporalResolution.DAILY,
            datasets: [E4wingsDatasetsUI['public-global-sar-presence']] as IAdvancedQueryStoreStates['datasets'],
            filterText: '',
            spatialAggregation: false,
            rawQuery: '',
        },
        (set) => ({
            setSpatialResolution: (a_Value) => set((state) => ({ spatialResolution: typeof a_Value === 'function' ? a_Value(state.spatialResolution) : a_Value })),
            setFormat: (a_Value) => set((state) => ({ format: typeof a_Value === 'function' ? a_Value(state.format) : a_Value })),
            setGroupBy: (a_Value) => set((state) => ({ groupBy: typeof a_Value === 'function' ? a_Value(state.groupBy) : a_Value })),
            setTemporalResolution: (a_Value) => set((state) => ({ temporalResolution: typeof a_Value === 'function' ? a_Value(state.temporalResolution) : a_Value })),
            setDatasets: (a_Value) => set((state) => ({ datasets: typeof a_Value === 'function' ? a_Value(state.datasets) : a_Value })),
            setFilterText: (a_Value) => set((state) => ({ filterText: typeof a_Value === 'function' ? a_Value(state.filterText) : a_Value })),
            setSpatialAggregation: (a_Value) => set((state) => ({ spatialAggregation: typeof a_Value === 'function' ? a_Value(state.spatialAggregation) : a_Value })),
            setRawQuery: (a_Value) => set((state) => ({ rawQuery: typeof a_Value === 'function' ? a_Value(state.rawQuery) : a_Value })),
        })
    )
);
