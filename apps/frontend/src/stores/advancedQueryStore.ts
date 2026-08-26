import { create } from 'zustand';
import { combine } from 'zustand/middleware';
import {
  EFormat,
  EGroupBy,
  ESpatialResolution,
  ETemporalResolution,
} from '@packages/enum';
import {
  IAdvancedQueryQuery,
  IAdvancedQueryStoreActions,
  IAdvancedQueryStoreStates,
} from '../helpers/types/storeTypes';

const default_spatialResolution = ESpatialResolution.HIGH;
const default_groupBy = EGroupBy.VESSEL_ID;

export const useAdvancedQueryStore = create<
  IAdvancedQueryStoreStates & IAdvancedQueryStoreActions
>(
  combine(
    {
      spatialResolution:
        default_spatialResolution as IAdvancedQueryStoreStates['spatialResolution'],
      format: EFormat.JSON,
      groupBy: default_groupBy as IAdvancedQueryStoreStates['groupBy'],
      temporalResolution: ETemporalResolution.HOURLY,
      spatialAggregation: false,
    },
    (set, get) => ({
      setSpatialResolution: (a_Value) =>
        set((state) => ({
          spatialResolution:
            typeof a_Value === 'function'
              ? a_Value(state.spatialResolution)
              : a_Value,
        })),
      setFormat: (a_Value) =>
        set((state) => ({
          format:
            typeof a_Value === 'function' ? a_Value(state.format) : a_Value,
        })),
      setGroupBy: (a_Value) =>
        set((state) => ({
          groupBy:
            typeof a_Value === 'function' ? a_Value(state.groupBy) : a_Value,
        })),
      /* setTemporalResolution: (a_Value) =>
        set((state) => ({
          temporalResolution:
            typeof a_Value === 'function'
              ? a_Value(state.temporalResolution)
              : a_Value,
        })), */
      setSpatialAggregation: (a_Value) =>
        set((state) => ({
          spatialAggregation:
            typeof a_Value === 'function'
              ? a_Value(state.spatialAggregation)
              : a_Value,
        })),
      getAdvancedQuery: () => {
        const status = get();
        return status;
      },
      getAdvancedQueryConfig: (): IAdvancedQueryQuery => {
        const {
          spatialResolution,
          format,
          groupBy,
          temporalResolution,
          spatialAggregation,
        } = get();
        return {
          url_params: {
            'spatial-resolution': spatialResolution,
            format,
            'group-by': groupBy,
            'temporal-resolution': temporalResolution,
            'spatial-aggregation': spatialAggregation,
          },
        };
      },
      importAdvancedQueryConfig: (a_Data) =>
        set({
          spatialResolution:
            a_Data.url_params['spatial-resolution'] ??
            default_spatialResolution,
          format: a_Data.url_params.format,
          groupBy: a_Data.url_params['group-by'] ?? default_groupBy,
          temporalResolution: ETemporalResolution.HOURLY,
          spatialAggregation: a_Data.url_params['spatial-aggregation'] ?? false,
        }),
    }),
  ),
);
