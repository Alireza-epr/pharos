import { create } from 'zustand';
import { combine, persist } from 'zustand/middleware';
import { ESidebarTab } from '../helpers/enum/storeEnum';
import {
  ISidebarStoreActions,
  ISidebarStoreStates,
} from '../helpers/types/storeTypes';

export const useSidebarStore = create<ISidebarStoreStates & ISidebarStoreActions>()(
  persist(
    combine(
      {
        activeTab: ESidebarTab.report as ISidebarStoreStates['activeTab'],
        collapsed: false,
      },
      (set) => ({
        setActiveTab: (a_Value) => set((state) => ({ activeTab: typeof a_Value === 'function' ? a_Value(state.activeTab) : a_Value})),
        setCollapsed: (a_Value) => set((state) => ({ collapsed: typeof a_Value === 'function' ? a_Value(state.collapsed) : a_Value}))
      }),
    ),
    {
      name: 'sidebar-settings',
      partialize: (s) => ({ activeTab: s.activeTab, collapsed: s.collapsed }),
    },
  ),
);
