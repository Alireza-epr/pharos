import { create } from 'zustand';
import { combine } from 'zustand/middleware';
import { E4wingsDatasets, E4wingsDatasetsUI, EFormat, EGroupBy, ESpatialResolution, ETemporalResolution } from '@packages/enum';
import { IAdvancedQueryStoreActions, IAdvancedQueryStoreStates } from '../helpers/types/storeTypes';
import { T4wingsSource } from '@packages/types';

export const useAdvancedQueryStore = create<IAdvancedQueryStoreStates & IAdvancedQueryStoreActions>(
    combine(
        {
            spatialResolution: ESpatialResolution.HIGH as IAdvancedQueryStoreStates['spatialResolution'],
            format: EFormat.JSON,
            groupBy: EGroupBy.VESSEL_ID as IAdvancedQueryStoreStates['groupBy'],
            temporalResolution: ETemporalResolution.DAILY,
            datasets: [E4wingsDatasetsUI['public-global-sar-presence']] as IAdvancedQueryStoreStates['datasets'],
            mainDatasetVersion: 3,
            subDatasetVersion: 0,
            filterText: '',
            spatialAggregation: false,
            rawQuery: '',
        },
        (set, get) => ({
            setSpatialResolution: (a_Value) => set((state) => ({ spatialResolution: typeof a_Value === 'function' ? a_Value(state.spatialResolution) : a_Value })),
            setFormat: (a_Value) => set((state) => ({ format: typeof a_Value === 'function' ? a_Value(state.format) : a_Value })),
            setGroupBy: (a_Value) => set((state) => ({ groupBy: typeof a_Value === 'function' ? a_Value(state.groupBy) : a_Value })),
            setTemporalResolution: (a_Value) => set((state) => ({ temporalResolution: typeof a_Value === 'function' ? a_Value(state.temporalResolution) : a_Value })),
            setDatasets: (a_Value) => set((state) => ({ datasets: typeof a_Value === 'function' ? a_Value(state.datasets) : a_Value })),
            setMainDatasetVersion: (a_Value) => set((state) => ({ mainDatasetVersion: typeof a_Value === 'function' ? a_Value(state.mainDatasetVersion) : a_Value })),
            setSubDatasetVersion: (a_Value) => set((state) => ({ subDatasetVersion: typeof a_Value === 'function' ? a_Value(state.subDatasetVersion) : a_Value })),
            setFilterText: (a_Value) => set((state) => ({ filterText: typeof a_Value === 'function' ? a_Value(state.filterText) : a_Value })),
            setSpatialAggregation: (a_Value) => set((state) => ({ spatialAggregation: typeof a_Value === 'function' ? a_Value(state.spatialAggregation) : a_Value })),
            setRawQuery: (a_Value) => set((state) => ({ rawQuery: typeof a_Value === 'function' ? a_Value(state.rawQuery) : a_Value })),
            getDatasets: () => {
                const { datasets, mainDatasetVersion, subDatasetVersion } = get()
                const datasetsObject: Record<string, T4wingsSource> = {}
                let datasetNum = 0
                for(const dataset of datasets){
                    const key= `datasets[${datasetNum}]`
                    const uiKey = Object.entries(E4wingsDatasetsUI).find( ([_,v]) => v === dataset )
                    if(!uiKey) return
                    const value = Object.entries(E4wingsDatasets).find( ([_, v]) =>  v == uiKey[0] )
                    if(!value) return 
                    datasetsObject[key] = `${value[1]}:v${mainDatasetVersion}.${subDatasetVersion}`
                    datasetNum++
                }
                return datasetsObject
            },
            getAdvancedQuery: () => {
                const {
                    spatialResolution,
                    spatialAggregation,
                    temporalResolution,
                    format,
                    groupBy,
                    filterText,
                    rawQuery
                } = get()
                return {
                    spatialResolution,
                    spatialAggregation,
                    temporalResolution,
                    format,
                    groupBy,
                    filterText,
                    rawQuery
                }
            },
        })
    )
);
