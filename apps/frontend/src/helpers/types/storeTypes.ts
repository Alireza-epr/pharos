import { IConfigJSON, IEventSchema, IFilteringParams, IFilteringParamsUI, ISortOption } from '@packages/types';
import { TTheme } from '../enum/storeEnum';
import { IDropdownOption } from '../../components/common/inputs/DropdownInput';
import { TLanguage } from '../enum/translationEnum';
import { EFormat, EGroupBy, EHotspotTimeBins, ESpatialResolution, ETemporalResolution, T4wingsDatasetsUI } from '@packages/enum';
import { TMatchFilter } from '../enum/generalEnum';

export interface IAppStoreStates {
  theme: TTheme;
  language: TLanguage;
  backendStatus: boolean;
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

export interface ILoginStoreStates {
  accessToken: string;
  refreshToken: string;
}
export interface ILoginStoreActions {
  setAccessToken: ( a_Value: ILoginStoreStates['accessToken'] | ((a_Prev: ILoginStoreStates['accessToken']) => ILoginStoreStates['accessToken']) ) => void;
  setRefreshToken: ( a_Value: ILoginStoreStates['refreshToken'] | ((a_Prev: ILoginStoreStates['refreshToken']) => ILoginStoreStates['refreshToken']) ) => void;
  // Clears the session so the app routes back to the login screen.
  logout: () => void;
}

export interface IEventStoreStates {
  events: IEventSchema[];
  selectedEvent: IEventSchema | null;
}
export interface IEventStoreActions {
  setSelectedEvent: ( a_Value: IEventStoreStates['selectedEvent'] | ((a_Prev: IEventStoreStates['selectedEvent'] ) => IEventStoreStates['selectedEvent']) ) => void;
  setEvents: ( a_Value: IEventStoreStates['events'] | ((a_Prev: IEventStoreStates['events'] ) => IEventStoreStates['events']) ) => void;
}

export interface IBottomStoreStates {
  filter: TMatchFilter;
  sorts: ISortOption[];
}
export interface IBottomStoreActions {
  setFilter: ( a_Value: IBottomStoreStates['filter'] | ((a_Prev: IBottomStoreStates['filter'] ) => IBottomStoreStates['filter']) ) => void;
  setSorts: ( a_Value: IBottomStoreStates['sorts'] | ((a_Prev: IBottomStoreStates['sorts'] ) => IBottomStoreStates['sorts']) ) => void;
}

export interface IFilterStoreStates {
  filters: IFilteringParams & IFilteringParamsUI;
}
export interface IFilterStoreActions {
  setFilters: (
    a_Value:
      | IFilterStoreStates['filters']
      | ((a_Prev: IFilterStoreStates['filters']) => IFilterStoreStates['filters']),
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
export interface ISortOrderStoreStates {
  sorts: ISortOption[];
}
export interface ISortOrderStoreActions {
  setSorts: (
    a_Value:
      | ISortOrderStoreStates['sorts']
      | ((a_Prev: ISortOrderStoreStates['sorts']) => ISortOrderStoreStates['sorts']),
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

export interface IThresholdAndWeightsStoreStates {
  threshold: IConfigJSON["threshold"]
}
export interface IThresholdAndWeightsStoreActions {
  setThreshold: (
    a_Value:
      | IThresholdAndWeightsStoreStates['threshold']
      | ((a_Prev: IThresholdAndWeightsStoreStates['threshold']) => IThresholdAndWeightsStoreStates['threshold']),
  ) => void;
}

export interface IAdvancedQueryStoreStates {
  spatialResolution: ESpatialResolution | '';
  format: EFormat;
  groupBy: EGroupBy | '';
  temporalResolution: ETemporalResolution;
  datasets: T4wingsDatasetsUI[];
  filterText: string;
  spatialAggregation: boolean;
  rawQuery: string;
}
export interface IAdvancedQueryStoreActions {
  setSpatialResolution: (a_Value: IAdvancedQueryStoreStates['spatialResolution'] | ((a_Prev: IAdvancedQueryStoreStates['spatialResolution']) => IAdvancedQueryStoreStates['spatialResolution'])) => void;
  setFormat: (a_Value: IAdvancedQueryStoreStates['format'] | ((a_Prev: IAdvancedQueryStoreStates['format']) => IAdvancedQueryStoreStates['format'])) => void;
  setGroupBy: (a_Value: IAdvancedQueryStoreStates['groupBy'] | ((a_Prev: IAdvancedQueryStoreStates['groupBy']) => IAdvancedQueryStoreStates['groupBy'])) => void;
  setTemporalResolution: (a_Value: IAdvancedQueryStoreStates['temporalResolution'] | ((a_Prev: IAdvancedQueryStoreStates['temporalResolution']) => IAdvancedQueryStoreStates['temporalResolution'])) => void;
  setDatasets: (a_Value: IAdvancedQueryStoreStates['datasets'] | ((a_Prev: IAdvancedQueryStoreStates['datasets']) => IAdvancedQueryStoreStates['datasets'])) => void;
  setFilterText: (a_Value: IAdvancedQueryStoreStates['filterText'] | ((a_Prev: IAdvancedQueryStoreStates['filterText']) => IAdvancedQueryStoreStates['filterText'])) => void;
  setSpatialAggregation: (a_Value: IAdvancedQueryStoreStates['spatialAggregation'] | ((a_Prev: IAdvancedQueryStoreStates['spatialAggregation']) => IAdvancedQueryStoreStates['spatialAggregation'])) => void;
  setRawQuery: (a_Value: IAdvancedQueryStoreStates['rawQuery'] | ((a_Prev: IAdvancedQueryStoreStates['rawQuery']) => IAdvancedQueryStoreStates['rawQuery'])) => void;
}