import { create } from 'zustand';
import { combine } from 'zustand/middleware';
import {
  IFilteringParams,
  IFilteringParamsUI,
  T4wingsSource,
  TDatasetVersion,
  TFilterKey,
  TSourceKey,
} from '@packages/types';
import {
  IFilterStoreActions,
  IFilterStoreStates,
} from '../helpers/types/storeTypes';
import {
  E4wingsDatasets,
  E4wingsDatasetsUI,
  EMatchFilter,
  ENeuralVesselType,
  TMatchFilter,
} from '@packages/enum';
import {
  getFlags,
  getGearTypes,
  getMatched,
  getMinimumDistanceFromPorts,
  getNeuralVesselType,
  getSpeeds,
  getVesselId,
  getVesselTypes,
} from '@/helpers/utils/queryUtils';

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
  reason_codes_exclude: [],
  event_id: '',
};

const defaultFiltersUI: IFilteringParamsUI = {
  datasets: {
    [E4wingsDatasets.SARVesselDetections]: {
      active: true,
      version: 'v3.0',
    },
    [E4wingsDatasets.AISVesselPresence]: {
      active: false,
      version: 'v3.0',
    },
    [E4wingsDatasets.fishingEffort]: {
      active: false,
      version: 'v3.0',
    },
  },
  matchingStatus: EMatchFilter.all,
  flags: [],
  gearTypes: [],
  vesselTypes: [],
  neuralVesselType: '',
  vessel_id: '',
  speeds: [],
  minimumDistanceFromPorts: '',
};

const FILTER_BUILDERS: Record<
  E4wingsDatasets,
  ((ui: IFilteringParamsUI) => string)[]
> = {
  [E4wingsDatasets.SARVesselDetections]: [
    (ui) => getMatched(ui.matchingStatus),
    (ui) => getFlags(ui.flags),
    (ui) => getVesselTypes(ui.vesselTypes),
    (ui) => getGearTypes(ui.gearTypes),
    (ui) => getNeuralVesselType(ui.neuralVesselType),
    (ui) => getVesselId(ui.vessel_id),
  ],
  [E4wingsDatasets.AISVesselPresence]: [
    (ui) => getFlags(ui.flags),
    (ui) => getVesselTypes(ui.vesselTypes),
    (ui) => getSpeeds(ui.speeds),
  ],
  [E4wingsDatasets.fishingEffort]: [
    (ui) => getFlags(ui.flags),
    (ui) => getGearTypes(ui.gearTypes),
    (ui) => getMinimumDistanceFromPorts(ui.minimumDistanceFromPorts),
    (ui) => getVesselId(ui.vessel_id),
  ],
};

export const useFilterStore = create<IFilterStoreStates & IFilterStoreActions>(
  combine(
    {
      filters: defaultFilters satisfies IFilterStoreStates['filters'],
      filtersUI: defaultFiltersUI satisfies IFilterStoreStates['filtersUI'],
    },
    (set, get) => ({
      setFilters: (a_Value) =>
        set((state) => ({
          filters:
            typeof a_Value === 'function' ? a_Value(state.filters) : a_Value,
        })),
      setFiltersUI: (a_Value) =>
        set((state) => ({
          filtersUI:
            typeof a_Value === 'function' ? a_Value(state.filtersUI) : a_Value,
        })),
      getSources: () => {
        const { datasets } = get().filtersUI;
        let datasetNum = 0;
        const datasetsObject = Object.entries(datasets).reduce(
          (acc: Record<TSourceKey, T4wingsSource>, [ds, value]) => {
            if (value.active) {
              const key: TSourceKey = `datasets[${datasetNum}]`;
              acc[key] = `${ds as E4wingsDatasets}:${value.version}`;
              ++datasetNum;
            }
            return acc;
          },
          {},
        );

        return datasetsObject;
      },
      getFilter: () => {
        const { filtersUI } = get();
        const { datasets } = get().filtersUI;
        const active = (
          Object.entries(datasets) as [
            E4wingsDatasets,
            { active: boolean; version: TDatasetVersion },
          ][]
        ).filter(([_, value]) => value.active);
        return active.reduce(
          (acc: Record<TFilterKey, string>, [dataset], i) => {
            const parts = FILTER_BUILDERS[dataset]
              .map((build) => build(filtersUI))
              .filter(Boolean); // drop the "" ones
            if (parts.length) acc[`filters[${i}]`] = parts.join(' AND ');
            return acc;
          },
          {},
        );
      },
    }),
  ),
);
