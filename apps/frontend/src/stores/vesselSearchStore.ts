import { create } from 'zustand';
import { combine } from 'zustand/middleware';
import { IVesselSearchURLParams } from '@packages/types';
import { EVesselDataset, EVesselMatchField, EVesselSearchInclude } from '@packages/enum';
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

// The reverse of toIndexedParams() -- pulls `${a_Prefix}[n]` keys back out
// of a wire-format params object into a plain array, in index order.
// Tolerant of gaps/out-of-order keys (an imported file could be hand-edited)
// rather than assuming a clean 0..n-1 run the way toIndexedParams() produces.
const fromIndexedParams = (
  a_Prefix: string,
  a_Params: Record<string, unknown>,
): string[] => {
  const pattern = new RegExp(`^${a_Prefix}\\[(\\d+)\\]$`);
  return Object.keys(a_Params)
    .flatMap((key) => {
      const match = key.match(pattern);
      const value = a_Params[key];
      return match && typeof value === 'string'
        ? [{ index: Number(match[1]), value }]
        : [];
    })
    .sort((a, b) => a.index - b.index)
    .map((entry) => entry.value);
};

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
        set((state) => {
          const query =
            typeof a_Value === 'function' ? a_Value(state.query) : a_Value;
          return query === '' ? { query } : { query, where: '' };
        }),
      setWhere: (a_Value) =>
        set((state) => {
          const where =
            typeof a_Value === 'function' ? a_Value(state.where) : a_Value;
          return where === ''
            ? { where }
            : { where, query: '', matchFields: [] };
        }),
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
      importVesselSearchParams: (a_Params: IVesselSearchURLParams) => {
        const params = a_Params as unknown as Record<string, unknown>;
        set({
          query: a_Params.query ?? '',
          where: a_Params.where ?? '',
          matchFields: fromIndexedParams(
            'match-fields',
            params,
          ) as EVesselMatchField[],
          includes: fromIndexedParams(
            'includes',
            params,
          ) as EVesselSearchInclude[],
          limit: a_Params.limit ?? DEFAULT_LIMIT,
        });
      },
    }),
  ),
);
