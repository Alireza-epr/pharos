import { IEventSchema } from '@packages/types';
import { TTheme } from '../enum/storeEnum';
import { IDropdownOption } from '../../components/common/inputs/DropdownInput';
import { TLanguage } from '../enum/translationEnum';

export interface IAppStoreStates {
  theme: TTheme;
  language: TLanguage
}
export interface IAppStoreActions {
  setTheme: (
    a_Value:
      | IAppStoreStates['theme']
      | ((a_Prev: IAppStoreStates['theme']) => IAppStoreStates['theme']),
  ) => void;
  setLanguage: (
    a_Value:
      | IAppStoreStates['language']
      | ((a_Prev: IAppStoreStates['language']) => IAppStoreStates['language']),
  ) => void;
}

export interface IEventStoreStates {
  selectedEvent: IEventSchema | null;
}
export interface IEventStoreActions {
  setSelectedEvent: (
    a_Value:
      | IEventStoreStates['selectedEvent']
      | ((
          a_Prev: IEventStoreStates['selectedEvent'],
        ) => IEventStoreStates['selectedEvent']),
  ) => void;
}

export interface IAOIStoreStates {
  zonal: boolean;
  point: boolean;
  eezOptions: IDropdownOption[];
  eezActive: IDropdownOption | undefined;
  mpaOptions: IDropdownOption[];
  mpaActive: IDropdownOption | undefined;
}
export interface IAOIStoreActions {
  setZonal: (
    a_Value:
      | IAOIStoreStates['zonal']
      | ((a_Prev: IAOIStoreStates['zonal']) => IAOIStoreStates['zonal']),
  ) => void;
  setPoint: (
    a_Value:
      | IAOIStoreStates['point']
      | ((a_Prev: IAOIStoreStates['point']) => IAOIStoreStates['point']),
  ) => void;
  setEEZOptions: (
    a_Value:
      | IAOIStoreStates['eezOptions']
      | ((a_Prev: IAOIStoreStates['eezOptions']) => IAOIStoreStates['eezOptions']),
  ) => void;
  setEEZActive: (
    a_Value:
      | IAOIStoreStates['eezActive']
      | ((a_Prev: IAOIStoreStates['eezActive']) => IAOIStoreStates['eezActive']),
  ) => void;
  setMPAOptions: (
    a_Value:
      | IAOIStoreStates['mpaOptions']
      | ((a_Prev: IAOIStoreStates['mpaOptions']) => IAOIStoreStates['mpaOptions']),
  ) => void;
  setMPAActive: (
    a_Value:
      | IAOIStoreStates['mpaActive']
      | ((a_Prev: IAOIStoreStates['mpaActive']) => IAOIStoreStates['mpaActive']),
  ) => void;
}