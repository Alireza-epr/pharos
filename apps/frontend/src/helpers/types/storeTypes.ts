import { IEventSchema } from "@packages/types";
import { ETheme } from "../enum/storeEnum";

export interface IAppStoreStates {
    theme: ETheme
}
export interface IAppStoreActions {
    setTheme: (a_Value: IAppStoreStates["theme"] | ((a_Prev: IAppStoreStates["theme"]) => IAppStoreStates["theme"])) => void;
}

export interface IEventStoreStates {
    selectedEvent: IEventSchema | null
}
export interface IEventStoreActions {
    setSelectedEvent: (a_Value: IEventStoreStates["selectedEvent"] | ((a_Prev: IEventStoreStates["selectedEvent"]) => IEventStoreStates["selectedEvent"])) => void;
}