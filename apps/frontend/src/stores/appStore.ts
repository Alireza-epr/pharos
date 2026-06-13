import { create } from 'zustand';
import { combine, persist } from 'zustand/middleware';
import { ETheme } from '../helpers/enum/storeEnum';
import { IAppStoreActions, IAppStoreStates } from '../helpers/types/storeTypes';
import { detectBrowserLanguage } from '../helpers/utils/translationUtils';

export const useAppStore = create<IAppStoreStates & IAppStoreActions>()(
  persist(
    combine(
      {
        theme: ETheme.light as IAppStoreStates['theme'],
        language: detectBrowserLanguage() as IAppStoreStates['language'],
        backendStatus: false,
      },
      (set) => ({
        setTheme: (a_Value) =>
          set((state) => ({
            theme: typeof a_Value === 'function' ? a_Value(state.theme) : a_Value,
          })),
        setLanguage: (a_Value) =>
          set((state) => ({
            language: typeof a_Value === 'function' ? a_Value(state.language) : a_Value,
          })),
        setBackendStatus: (a_Value) =>
          set((state) => ({
            backendStatus: typeof a_Value === 'function' ? a_Value(state.backendStatus) : a_Value,
          })),
      }),
    ),
    {
      name: 'app-settings',
      partialize: (s) => ({ theme: s.theme, language: s.language }),
    },
  ),
);
