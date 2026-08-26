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
  IFilterQuery,
  IFilterStoreActions,
  IFilterStoreStates,
  TFilterURLParams,
} from '../helpers/types/storeTypes';
import { E4wingsDatasets, EMatchFilter } from '@packages/enum';
import {
  getFlags,
  getGearTypes,
  getMatched,
  getMinimumDistanceFromPorts,
  getNeuralVesselType,
  getSpeeds,
  getVesselId,
  getVesselTypes,
  parseFlags,
  parseGearTypes,
  parseMatched,
  parseMinimumDistanceFromPorts,
  parseNeuralVesselType,
  parseSpeeds,
  parseVesselId,
  parseVesselTypes,
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
  only_inside_eez: false,
  only_inside_mpa: false,
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

const buildSources = (
  a_FiltersUI: IFilteringParamsUI,
): Record<TSourceKey, T4wingsSource> => {
  let datasetNum = 0;
  return Object.entries(a_FiltersUI.datasets).reduce(
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
};

const buildFilterExpressions = (
  a_FiltersUI: IFilteringParamsUI,
): Record<TFilterKey, string> => {
  const active = (
    Object.entries(a_FiltersUI.datasets) as [
      E4wingsDatasets,
      { active: boolean; version: TDatasetVersion },
    ][]
  ).filter(([_, value]) => value.active);
  return active.reduce((acc: Record<TFilterKey, string>, [dataset], i) => {
    const parts = FILTER_BUILDERS[dataset]
      .map((build) => build(a_FiltersUI))
      .filter(Boolean); // drop the "" ones
    if (parts.length) acc[`filters[${i}]`] = parts.join(' AND ');
    return acc;
  }, {});
};

const buildFilterUI = (a_URLParams: TFilterURLParams): IFilteringParamsUI => {
  const datasets = Object.fromEntries(
    Object.entries(defaultFiltersUI.datasets).map(([name, value]) => [
      name,
      { active: false, version: value.version },
    ]),
  ) as IFilteringParamsUI['datasets'];

  Object.entries(a_URLParams)
    .filter((entry): entry is [TSourceKey, T4wingsSource] =>
      entry[0].startsWith('datasets['),
    )
    .forEach(([, source]) => {
      const [name, version] = source.split(':') as [
        E4wingsDatasets,
        TDatasetVersion,
      ];
      if (!name || !version || !(name in datasets)) return;
      datasets[name] = { active: true, version };
    });

  const expression = Object.entries(a_URLParams)
    .filter((entry): entry is [TFilterKey, string] =>
      entry[0].startsWith('filters['),
    )
    .map(([, value]) => value)
    .join(' AND ');

  return {
    datasets,
    matchingStatus: parseMatched(expression),
    flags: parseFlags(expression),
    vesselTypes: parseVesselTypes(expression),
    gearTypes: parseGearTypes(expression),
    neuralVesselType: parseNeuralVesselType(expression),
    vessel_id: parseVesselId(expression),
    speeds: parseSpeeds(expression),
    minimumDistanceFromPorts: parseMinimumDistanceFromPorts(expression),
  };
};

export const useFilterStore = create<IFilterStoreStates & IFilterStoreActions>(
  combine(
    {
      filter: defaultFilters satisfies IFilterStoreStates['filter'],
      filtersUI: defaultFiltersUI satisfies IFilterStoreStates['filtersUI'],
    },
    (set, get) => ({
      setFilter: (a_Value) =>
        set((state) => ({
          filter:
            typeof a_Value === 'function' ? a_Value(state.filter) : a_Value,
        })),
      setFiltersUI: (a_Value) =>
        set((state) => ({
          filtersUI:
            typeof a_Value === 'function' ? a_Value(state.filtersUI) : a_Value,
        })),
      getSources: () => buildSources(get().filtersUI),
      getFilter: () => buildFilterExpressions(get().filtersUI),
      getFilterConfig: (): IFilterQuery => {
        const { filter, filtersUI } = get();
        const url_params = {
          ...buildSources(filtersUI),
          ...buildFilterExpressions(filtersUI),
        };
        return { filter, url_params };
      },
      importFilterConfig: (a_Data: IFilterQuery) => {
        const filtersUI = buildFilterUI(a_Data.url_params);
        return set({ filter: a_Data.filter, filtersUI });
      },
    }),
  ),
);
