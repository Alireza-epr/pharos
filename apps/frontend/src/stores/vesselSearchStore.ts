import { create } from 'zustand';
import { combine } from 'zustand/middleware';
import { IVesselSearchURLParams } from '@packages/types';
import { EVesselDataset, EVesselSearchInclude } from '@packages/enum';
import {
  IVesselSearchStoreActions,
  IVesselSearchStoreStates,
} from '../helpers/types/storeTypes';

// GFW's own default limit for /vessels/search (max 50).
const DEFAULT_LIMIT = 20;

// Same indexed-array convention 4Wings' datasets[]/filters[] already use
// (see filterStore.ts's getSources) -- reused here for Vessels' own
// datasets[]/match-fields[]/includes[] params.
const toIndexedParams = (
  a_Prefix: string,
  a_Values: string[],
): Record<string, string> =>
  a_Values.reduce<Record<string, string>>((acc, value, index) => {
    acc[`${a_Prefix}[${index}]`] = value;
    return acc;
  }, {});

export const useVesselSearchStore = create<
  IVesselSearchStoreStates & IVesselSearchStoreActions
>(
  combine(
    {
      query: '',
      where: '',
      // GFW currently allows only one legal dataset value -- fixed here
      // rather than exposed as a picker with nothing to actually choose.
      datasets: [EVesselDataset.vesselIdentity] as IVesselSearchStoreStates['datasets'],
      matchFields: [] as IVesselSearchStoreStates['matchFields'],
      // Mirrors the provider's own default includes (see the GFW client's
      // search_vessels()).
      includes: [
        EVesselSearchInclude.OWNERSHIP,
        EVesselSearchInclude.AUTHORIZATIONS,
        EVesselSearchInclude.MATCH_CRITERIA,
      ] as IVesselSearchStoreStates['includes'],
      limit: DEFAULT_LIMIT,
    },
    (set, get) => ({
      setQuery: (a_Value) =>
        set((state) => ({
          query: typeof a_Value === 'function' ? a_Value(state.query) : a_Value,
        })),
      setWhere: (a_Value) =>
        set((state) => ({
          where: typeof a_Value === 'function' ? a_Value(state.where) : a_Value,
        })),
      setMatchFields: (a_Value) =>
        set((state) => ({
          matchFields:
            typeof a_Value === 'function'
              ? a_Value(state.matchFields)
              : a_Value,
        })),
      setIncludes: (a_Value) =>
        set((state) => ({
          includes:
            typeof a_Value === 'function' ? a_Value(state.includes) : a_Value,
        })),
      setLimit: (a_Value) =>
        set((state) => ({
          limit: typeof a_Value === 'function' ? a_Value(state.limit) : a_Value,
        })),
      getVesselSearchParams: (): IVesselSearchURLParams => {
        const { query, where, datasets, matchFields, includes, limit } =
          get();
        return {
          limit,
          ...(query.trim() !== '' && { query: query.trim() }),
          ...(where.trim() !== '' && { where: where.trim() }),
          ...toIndexedParams('datasets', datasets),
          ...toIndexedParams('match-fields', matchFields),
          ...toIndexedParams('includes', includes),
        };
      },
    }),
  ),
);
