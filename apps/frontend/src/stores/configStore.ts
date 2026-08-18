import { create } from 'zustand';
import { combine } from 'zustand/middleware';
import {
  IConfigStoreActions,
  IConfigStoreStates,
} from '../helpers/types/storeTypes';
import { IConfigJSON } from '@packages/types';

const default_export: IConfigJSON['export'] = {
  'events.csv': true,
  'event.geojson': true,
  'run_metadata.json': true,
};

export const useConfigStore = create<IConfigStoreStates & IConfigStoreActions>(
  combine(
    {
      config: null as IConfigStoreStates['config'],
    },
    (set, get) => ({
      setConfig: (a_Value) =>
        set((state) => ({
          config:
            typeof a_Value === 'function' ? a_Value(state.config) : a_Value,
        })),
      getExport: () => {
        return get().config?.export ?? default_export;
      },
    }),
  ),
);
