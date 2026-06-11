import { create } from 'zustand';
import { combine } from 'zustand/middleware';
import { ETheme } from '../helpers/enum/storeEnum';
import { IAppStoreActions, IAppStoreStates } from '../helpers/types/storeTypes';

export const useAppStore = create<IAppStoreStates & IAppStoreActions>(
  combine(
    {
      theme: ETheme.light as IAppStoreStates["theme"],
    },
    (set) => ({
      setTheme: (a_Value) =>
        set((state) => ({
          theme: typeof a_Value === 'function' ? a_Value(state.theme) : a_Value,
        })),
    }),
  ),
);
