import { create } from 'zustand';
import { combine } from 'zustand/middleware';
import {
  IThresholdQuery,
  IThresholdStoreActions,
  IThresholdStoreStates,
} from '../helpers/types/storeTypes';
import { IConfigJSON } from '@packages/types';

const default_threshold: IConfigJSON['threshold'] = {
  near_coast_threshold: 10,
  low_confidence_proxy_threshold: 2,
  shallow_water_threshold: -50,
  deep_water_threshold: -200,
  low_triage_score_threshold: 0.3,
  medium_triage_score_threshold: 0.6,
  high_triage_score_threshold: 0.85,
  base_uncertainty_weight: 0.1,
  missing_field_weight: 0.08,
  noisy_weight: 0.15,
  unmatched_weight: 0.2,
  near_coast_importance_weight: 0.3,
  eez_importance_weight: 0.2,
  mpa_importance_weight: 0.5,
  missing_confidence_proxy_weight: 0.25,
  low_confidence_proxy_weight: 0.2,
  low_confidence_tier_weight: 0.08,
  medium_confidence_tier_weight: 0.0,
  high_confidence_tier_weight: -0.05,
};

export const useThresholdStore = create<
  IThresholdStoreStates & IThresholdStoreActions
>(
  combine(
    {
      threshold: default_threshold as IThresholdStoreStates['threshold'],
    },
    (set, get) => ({
      setThreshold: (a_Value) =>
        set((state) => ({
          threshold:
            typeof a_Value === 'function' ? a_Value(state.threshold) : a_Value,
        })),
      getThresholdConfig: (): IThresholdQuery => ({
        threshold: get().threshold,
      }),
      importThresholdConfig: (a_Data) => set({ threshold: a_Data.threshold }),
    }),
  ),
);
