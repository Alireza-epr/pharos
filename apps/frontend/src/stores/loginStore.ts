import { create } from 'zustand';
import { combine, persist } from 'zustand/middleware';
import {
  ILoginStoreActions,
  ILoginStoreStates,
} from '../helpers/types/storeTypes';

export const useLoginStore = create<ILoginStoreStates & ILoginStoreActions>()(
  persist(
    combine(
      {
        accessToken: '' as ILoginStoreStates['accessToken'],
        refreshToken: '' as ILoginStoreStates['refreshToken'],
      },
      (set) => ({
        setAccessToken: (a_Value) =>
          set((state) => ({
            accessToken: typeof a_Value === 'function' ? a_Value(state.accessToken) : a_Value,
          })),
        setRefreshToken: (a_Value) =>
          set((state) => ({
            refreshToken: typeof a_Value === 'function' ? a_Value(state.refreshToken) : a_Value,
          })),
        logout: () => set({ accessToken: '', refreshToken: '' }),
      }),
    ),
    {
      name: 'login',
      partialize: (s) => ({ accessToken: s.accessToken, refreshToken: s.refreshToken }),
    },
  ),
);
