import { create } from 'zustand';
import { combine } from 'zustand/middleware';
import { IEventPostBodyParams, TDatasetVersion } from '@packages/types';
import { ECountryFlag, EEventDatasets } from '@packages/enum';
import {
  IGfwEventSearchStoreActions,
  IGfwEventSearchStoreStates,
} from '../helpers/types/storeTypes';

const DEFAULT_LIMIT = 20;

// Mirrors filterStore.ts's own per-dataset { active, version } default --
// every event dataset starts off, pinned to the same 'v3.0' version pinned
// elsewhere in this codebase (samples.ts, filterStore.ts).
const DEFAULT_DATASETS: IGfwEventSearchStoreStates['datasets'] = {
  [EEventDatasets.fishingEvent]: { active: false, version: 'v3.0' },
  [EEventDatasets.encountersEvent]: { active: false, version: 'v3.0' },
  [EEventDatasets.loiteringEvent]: { active: false, version: 'v3.0' },
  [EEventDatasets.portVisitsEvent]: { active: false, version: 'v3.0' },
  [EEventDatasets.AISOffEvent]: { active: false, version: 'v3.0' },
};

// `vessels`/`vesselGroups` are entered as one comma-separated free-text
// field each in the UI (no autocomplete this iteration) rather than a
// picker -- split defensively so stray commas/whitespace never produce an
// empty id.
const parseCommaList = (a_Value: string): string[] =>
  a_Value
    .split(',')
    .map((v) => v.trim())
    .filter((v) => v.length > 0);

export const useGfwEventSearchStore = create<
  IGfwEventSearchStoreStates & IGfwEventSearchStoreActions
>(
  combine(
    {
      datasets: DEFAULT_DATASETS,
      vessels: '',
      confidences: [] as IGfwEventSearchStoreStates['confidences'],
      encounterTypes: [] as IGfwEventSearchStoreStates['encounterTypes'],
      vesselTypes: [] as IGfwEventSearchStoreStates['vesselTypes'],
      vesselGroups: '',
      flags: [] as IGfwEventSearchStoreStates['flags'],
      duration: 0,
      sort: '',
      limit: DEFAULT_LIMIT,
      useReportAOI: false,
    },
    (set, get) => ({
      setDatasets: (a_Value) =>
        set((state) => ({
          datasets:
            typeof a_Value === 'function' ? a_Value(state.datasets) : a_Value,
        })),
      setVessels: (a_Value) =>
        set((state) => ({
          vessels:
            typeof a_Value === 'function' ? a_Value(state.vessels) : a_Value,
        })),
      setConfidences: (a_Value) =>
        set((state) => ({
          confidences:
            typeof a_Value === 'function'
              ? a_Value(state.confidences)
              : a_Value,
        })),
      setEncounterTypes: (a_Value) =>
        set((state) => ({
          encounterTypes:
            typeof a_Value === 'function'
              ? a_Value(state.encounterTypes)
              : a_Value,
        })),
      setVesselTypes: (a_Value) =>
        set((state) => ({
          vesselTypes:
            typeof a_Value === 'function'
              ? a_Value(state.vesselTypes)
              : a_Value,
        })),
      setVesselGroups: (a_Value) =>
        set((state) => ({
          vesselGroups:
            typeof a_Value === 'function'
              ? a_Value(state.vesselGroups)
              : a_Value,
        })),
      setFlags: (a_Value) =>
        set((state) => ({
          flags: typeof a_Value === 'function' ? a_Value(state.flags) : a_Value,
        })),
      setDuration: (a_Value) =>
        set((state) => ({
          duration:
            typeof a_Value === 'function' ? a_Value(state.duration) : a_Value,
        })),
      setSort: (a_Value) =>
        set((state) => ({
          sort: typeof a_Value === 'function' ? a_Value(state.sort) : a_Value,
        })),
      setLimit: (a_Value) =>
        set((state) => ({
          limit: typeof a_Value === 'function' ? a_Value(state.limit) : a_Value,
        })),
      setUseReportAOI: (a_Value) =>
        set((state) => ({
          useReportAOI:
            typeof a_Value === 'function'
              ? a_Value(state.useReportAOI)
              : a_Value,
        })),
      getEventBodyParams: (): IEventPostBodyParams => {
        const {
          datasets,
          vessels,
          confidences,
          encounterTypes,
          vesselTypes,
          vesselGroups,
          flags,
          duration,
        } = get();

        const activeDatasets = Object.entries(datasets)
          .filter(([, v]) => v.active)
          .map(
            ([ds, v]) =>
              `${ds}:${v.version}` as IEventPostBodyParams['datasets'][number],
          );

        const vesselIds = parseCommaList(vessels);
        const vesselGroupIds = parseCommaList(vesselGroups);

        return {
          datasets: activeDatasets,
          ...(vesselIds.length > 0 && { vessels: vesselIds }),
          ...(confidences.length > 0 && { confidences }),
          ...(encounterTypes.length > 0 && { encounterTypes }),
          ...(vesselTypes.length > 0 && { vesselTypes }),
          ...(vesselGroupIds.length > 0 && { vesselGroups: vesselGroupIds }),
          ...(flags.length > 0 && { flags }),
          ...(duration > 0 && { duration }),
        };
      },
      importEventSearchParams: (a_Params: IEventPostBodyParams) => {
        const activeVersioned = new Set(a_Params.datasets ?? []);
        const datasets = Object.fromEntries(
          Object.entries(DEFAULT_DATASETS).map(([ds, defaultEntry]) => {
            const versioned = [...activeVersioned].find((v) =>
              v.startsWith(`${ds}:`),
            );
            return [
              ds,
              versioned
                ? {
                    active: true,
                    version: versioned.split(':')[1] as TDatasetVersion,
                  }
                : { active: false, version: defaultEntry.version },
            ];
          }),
        ) as IGfwEventSearchStoreStates['datasets'];

        set({
          datasets,
          vessels: (a_Params.vessels ?? []).join(', '),
          confidences: a_Params.confidences ?? [],
          encounterTypes: a_Params.encounterTypes ?? [],
          vesselTypes: a_Params.vesselTypes ?? [],
          vesselGroups: (a_Params.vesselGroups ?? []).join(', '),
          flags: (a_Params.flags ?? []) as ECountryFlag[],
          duration: a_Params.duration ?? 0,
        });
      },
    }),
  ),
);
