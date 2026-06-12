import { IEventSchema } from '@packages/types';
import { TTheme } from '../enum/storeEnum';
import { IDropdownOption } from '../../components/common/inputs/DropdownInput';
import { TLanguage } from '../enum/translationEnum';
import { EHotspotTimeBins } from '@packages/enum';

export interface IAppStoreStates {
  theme: TTheme;
  language: TLanguage;
  backendStatus: boolean
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
  setBackendStatus: (
    a_Value:
      | IAppStoreStates['backendStatus']
      | ((a_Prev: IAppStoreStates['backendStatus']) => IAppStoreStates['backendStatus']),
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

export interface IContextLayersStoreStates {
  hotspots: boolean;
  eezBoundaries: boolean;
  mpaZones: boolean;
}
export interface IContextLayersStoreActions {
  setHotspots: (
    a_Value:
      | IContextLayersStoreStates['hotspots']
      | ((a_Prev: IContextLayersStoreStates['hotspots']) => IContextLayersStoreStates['hotspots']),
  ) => void;
  setEezBoundaries: (
    a_Value:
      | IContextLayersStoreStates['eezBoundaries']
      | ((a_Prev: IContextLayersStoreStates['eezBoundaries']) => IContextLayersStoreStates['eezBoundaries']),
  ) => void;
  setMpaZones: (
    a_Value:
      | IContextLayersStoreStates['mpaZones']
      | ((a_Prev: IContextLayersStoreStates['mpaZones']) => IContextLayersStoreStates['mpaZones']),
  ) => void;
}

export interface IHotspotConfigStoreStates {
  resolution: number;
  timeBin: EHotspotTimeBins;
}
export interface IHotspotConfigStoreActions {
  setResolution: (
    a_Value:
      | IHotspotConfigStoreStates['resolution']
      | ((a_Prev: IHotspotConfigStoreStates['resolution']) => IHotspotConfigStoreStates['resolution']),
  ) => void;
  setTimeBin: (
    a_Value:
      | IHotspotConfigStoreStates['timeBin']
      | ((a_Prev: IHotspotConfigStoreStates['timeBin']) => IHotspotConfigStoreStates['timeBin']),
  ) => void;
}

export interface ITimeRangeStoreStates {
  dateFrom: string;
  dateTo: string;
}
export interface ITimeRangeStoreActions {
  setDateFrom: (
    a_Value:
      | ITimeRangeStoreStates['dateFrom']
      | ((a_Prev: ITimeRangeStoreStates['dateFrom']) => ITimeRangeStoreStates['dateFrom']),
  ) => void;
  setDateTo: (
    a_Value:
      | ITimeRangeStoreStates['dateTo']
      | ((a_Prev: ITimeRangeStoreStates['dateTo']) => ITimeRangeStoreStates['dateTo']),
  ) => void;
}

export interface IAOIStoreStates {
  zonal: boolean;
  point: boolean;
  eezOptions: IDropdownOption<string>[];
  eezActive: IDropdownOption<string> | undefined;
  mpaOptions: IDropdownOption<string>[];
  mpaActive: IDropdownOption<string> | undefined;
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