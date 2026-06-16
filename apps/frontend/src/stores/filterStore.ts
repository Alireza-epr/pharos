import { create } from 'zustand';
import { combine } from 'zustand/middleware';
import { IFilteringParams, IFilteringParamsUI } from '@packages/types';
import { IFilterStoreActions, IFilterStoreStates } from '../helpers/types/storeTypes';

const defaultFilters: IFilteringParams = {
    triage_score_min: 0,
    triage_score_max: 1,
    uncertainty_score_min: 0,
    uncertainty_score_max: 1,
    distance_to_coast_km_min: 0,
    distance_to_coast_km_max: 100,
    bathymetry_min: -100,
    bathymetry_max: 0,
    is_inside_eez: false,
    is_inside_mpa: false,
    reason_codes_include: [],
    reason_codes_exclude: []
}

const defaultFiltersUI: IFilteringParamsUI = {
    unmatched_only: false
}

export const useFilterStore = create<IFilterStoreStates & IFilterStoreActions>(
    combine(
        {
            filters: defaultFilters satisfies IFilterStoreStates['filters'],
            filtersUI: defaultFiltersUI satisfies IFilterStoreStates['filtersUI'],
        },
        (set) => ({
            setFilters: (a_Value) =>
                set((state) => ({
                    filters: typeof a_Value === 'function' ? a_Value(state.filters) : a_Value,
                })),
            setFiltersUI: (a_Value) =>
                set((state) => ({
                    filtersUI: typeof a_Value === 'function' ? a_Value(state.filtersUI) : a_Value,
                })),
        }),
    ),
);
