import { IMessageStoreActions, IMessageStoreStates } from '@/helpers/types/storeTypes';
import { create } from 'zustand';
import { combine, persist } from 'zustand/middleware';


export const useMessageStore = create<IMessageStoreStates & IMessageStoreActions>()(
    persist(
        combine(
            {
                info: null as IMessageStoreStates["info"],
                warn: null as IMessageStoreStates["warn"],
                error: null as IMessageStoreStates["error"]
            },
            (set) => ({
                setMessage: (a_Value) => set((state) => ({ info: typeof a_Value === 'function' ? a_Value(state.info) : a_Value })),
                setWarn: (a_Value) => set((state) => ({ warn: typeof a_Value === 'function' ? a_Value(state.warn) : a_Value })),
                setError: (a_Value) => set((state) => ({ error: typeof a_Value === 'function' ? a_Value(state.error) : a_Value })),
            })
        ),
        {
            name: "message-store",
            partialize: (s) => ({ info: s.info, warn: s.warn, error: s.error }),
        }
    )
)