import { create } from 'zustand';
import { combine, persist } from 'zustand/middleware';
import { EDetailTab } from '../helpers/enum/storeEnum';
import {
  IDetailStoreActions,
  IDetailStoreStates,
} from '../helpers/types/storeTypes';

export const useDetailStore = create<
  IDetailStoreStates & IDetailStoreActions
>()(
  persist(
    combine(
      {
        activeTab: EDetailTab.detail as IDetailStoreStates['activeTab'],
        collapsed: false,
      },
      (set) => ({
        setActiveTab: (a_Value) =>
          set((state) => ({
            activeTab:
              typeof a_Value === 'function'
                ? a_Value(state.activeTab)
                : a_Value,
          })),
        setCollapsed: (a_Value) =>
          set((state) => ({
            collapsed:
              typeof a_Value === 'function'
                ? a_Value(state.collapsed)
                : a_Value,
          })),
      }),
    ),
    {
      name: 'detail-settings',
      partialize: (s) => ({ activeTab: s.activeTab, collapsed: s.collapsed }),
    },
  ),
);
