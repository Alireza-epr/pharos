import {
  IConfigJSON,
  IEventSchema,
  IFeature,
  IFilteringParams,
  IFilteringParamsUI,
  IGeometry,
  IHotspotConfig,
  ISortOption,
  T4wingsSource,
  TExportConfig,
  TFilterKey,
  TSourceKey,
} from '@packages/types';
import { TDetailTab, TSidebarTab, TTheme } from '../enum/storeEnum';
import { IDropdownOption } from '../../components/common/inputs/DropdownInput';
import { TLanguage } from '../enum/translationEnum';
import {
  TMatchFilter,
  EFormat,
  EGroupBy,
  EHotspotTimeBins,
  ERegionDatasets,
  ESpatialResolution,
  ETemporalResolution,
} from '@packages/enum';

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
      | ((
          a_Prev: IAppStoreStates['backendStatus'],
        ) => IAppStoreStates['backendStatus']),
  ) => void;
}
export interface ISidebarStoreStates {
  activeTab: TSidebarTab;
  collapsed: boolean;
}
export interface ISidebarStoreActions {
  setActiveTab: (
    a_Value:
      | ISidebarStoreStates['activeTab']
      | ((
          a_Prev: ISidebarStoreStates['activeTab'],
        ) => ISidebarStoreStates['activeTab']),
  ) => void;
  setCollapsed: (
    a_Value:
      | ISidebarStoreStates['collapsed']
      | ((
          a_Prev: ISidebarStoreStates['collapsed'],
        ) => ISidebarStoreStates['collapsed']),
  ) => void;
}

export interface IDetailStoreStates {
  activeTab: TDetailTab;
  collapsed: boolean;
}
export interface IDetailStoreActions {
  setActiveTab: (
    a_Value:
      | IDetailStoreStates['activeTab']
      | ((
          a_Prev: IDetailStoreStates['activeTab'],
        ) => IDetailStoreStates['activeTab']),
  ) => void;
  setCollapsed: (
    a_Value:
      | IDetailStoreStates['collapsed']
      | ((
          a_Prev: IDetailStoreStates['collapsed'],
        ) => IDetailStoreStates['collapsed']),
  ) => void;
}

export interface ILoginStoreStates {
  accessToken: string;
  refreshToken: string;
}
export interface ILoginStoreActions {
  setAccessToken: (
    a_Value:
      | ILoginStoreStates['accessToken']
      | ((
          a_Prev: ILoginStoreStates['accessToken'],
        ) => ILoginStoreStates['accessToken']),
  ) => void;
  setRefreshToken: (
    a_Value:
      | ILoginStoreStates['refreshToken']
      | ((
          a_Prev: ILoginStoreStates['refreshToken'],
        ) => ILoginStoreStates['refreshToken']),
  ) => void;
  // Clears the session so the app routes back to the login screen.
  logout: () => void;
}

export interface IEventStoreStates {
  events: IEventSchema[];
  activeEvent: IEventSchema | null;
  selectedEvents: IEventSchema[];
}
export interface IEventStoreActions {
  setEvents: (
    a_Value:
      | IEventStoreStates['events']
      | ((a_Prev: IEventStoreStates['events']) => IEventStoreStates['events']),
  ) => void;
  setActiveEvent: (
    a_Value:
      | IEventStoreStates['activeEvent']
      | ((
          a_Prev: IEventStoreStates['activeEvent'],
        ) => IEventStoreStates['activeEvent']),
  ) => void;
  setSelectedEvents: (
    a_Value:
      | IEventStoreStates['selectedEvents']
      | ((
          a_Prev: IEventStoreStates['selectedEvents'],
        ) => IEventStoreStates['selectedEvents']),
  ) => void;
}

export interface IBottomStoreStates {
  filter: TMatchFilter;
  sorts: ISortOption[];
}
export interface IBottomStoreActions {
  setFilter: (
    a_Value:
      | IBottomStoreStates['filter']
      | ((
          a_Prev: IBottomStoreStates['filter'],
        ) => IBottomStoreStates['filter']),
  ) => void;
  setSorts: (
    a_Value:
      | IBottomStoreStates['sorts']
      | ((a_Prev: IBottomStoreStates['sorts']) => IBottomStoreStates['sorts']),
  ) => void;
}

export interface IFilterStoreStates {
  filters: IFilteringParams;
  filtersUI: IFilteringParamsUI;
}
export interface IFilterStoreActions {
  setFilters: (
    a_Value:
      | IFilterStoreStates['filters']
      | ((
          a_Prev: IFilterStoreStates['filters'],
        ) => IFilterStoreStates['filters']),
  ) => void;
  setFiltersUI: (
    a_Value:
      | IFilterStoreStates['filtersUI']
      | ((
          a_Prev: IFilterStoreStates['filtersUI'],
        ) => IFilterStoreStates['filtersUI']),
  ) => void;
  getSources: () => Record<TSourceKey, T4wingsSource> | {};
  getFilter: () => Record<TFilterKey, string> | {};
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
      | ((
          a_Prev: IContextLayersStoreStates['hotspots'],
        ) => IContextLayersStoreStates['hotspots']),
  ) => void;
  setEezBoundaries: (
    a_Value:
      | IContextLayersStoreStates['eezBoundaries']
      | ((
          a_Prev: IContextLayersStoreStates['eezBoundaries'],
        ) => IContextLayersStoreStates['eezBoundaries']),
  ) => void;
  setMpaZones: (
    a_Value:
      | IContextLayersStoreStates['mpaZones']
      | ((
          a_Prev: IContextLayersStoreStates['mpaZones'],
        ) => IContextLayersStoreStates['mpaZones']),
  ) => void;
}
export interface ISortOrderStoreStates {
  sorts: ISortOption[];
}
export interface ISortOrderStoreActions {
  setSorts: (
    a_Value:
      | ISortOrderStoreStates['sorts']
      | ((
          a_Prev: ISortOrderStoreStates['sorts'],
        ) => ISortOrderStoreStates['sorts']),
  ) => void;
}

export interface IHotspotConfigStoreStates {
  resolution: IHotspotConfig['resolution'];
  timeBin: EHotspotTimeBins;
}
export interface IHotspotConfigStoreActions {
  setResolution: (
    a_Value:
      | IHotspotConfigStoreStates['resolution']
      | ((
          a_Prev: IHotspotConfigStoreStates['resolution'],
        ) => IHotspotConfigStoreStates['resolution']),
  ) => void;
  setTimeBin: (
    a_Value:
      | IHotspotConfigStoreStates['timeBin']
      | ((
          a_Prev: IHotspotConfigStoreStates['timeBin'],
        ) => IHotspotConfigStoreStates['timeBin']),
  ) => void;
  getHotspot: () => IHotspotConfigStoreStates;
}

export interface ITimeRangeStoreStates {
  dateFrom: string;
  dateTo: string;
}
export interface ITimeRangeStoreActions {
  setDateFrom: (
    a_Value:
      | ITimeRangeStoreStates['dateFrom']
      | ((
          a_Prev: ITimeRangeStoreStates['dateFrom'],
        ) => ITimeRangeStoreStates['dateFrom']),
  ) => void;
  setDateTo: (
    a_Value:
      | ITimeRangeStoreStates['dateTo']
      | ((
          a_Prev: ITimeRangeStoreStates['dateTo'],
        ) => ITimeRangeStoreStates['dateTo']),
  ) => void;
}

// A drawn AOI is a standard GeoJSON Feature (RFC 7946) — geometry plus a
// properties bag — not a bare Geometry. Properties are unused for now, but
// the envelope is what makes this a real, portable Feature.
export type TAOIFeature = IFeature<IGeometry, null>;

export interface IAOIStoreStates {
  zonal: boolean;
  point: boolean;
  feature: TAOIFeature | null;
  // Circle radius (km) for the point tool. A point AOI is a circular buffer of
  // this radius; enforced minimum lives in AOI_RADIUS_MIN_KM.
  radius: number;
  eezOptions: IDropdownOption<string>[];
  eezActive: IDropdownOption<string> | undefined;
  mpaOptions: IDropdownOption<string>[];
  mpaActive: IDropdownOption<string> | undefined;
}

export interface IAOIRegionProperties {
  'region-dataset': ERegionDatasets;
  'region-id': string;
}

// A Point AOI is buffered into a circle Polygon before it's ever returned
// (the backend/export never sees a bare Point), which loses the one thing
// that told a Point apart from a freehand Zonal polygon: the radius. Carried
// here instead, so a Point AOI can be told apart from Zonal and reconstructed
// on import; a Zonal polygon needs no properties at all.
export interface IAOIPointProperties {
  radius: number;
}

// getAOI()'s return — reused as-is for the import/export button so there's a
// single AOI representation, not two, and it's always a standard GeoJSON
// Feature either way: a drawn AOI carries real geometry (plus radius
// properties if it came from the Point tool); a named region has no local
// geometry (geometry: null is valid per RFC 7946 §3.2), so its descriptor
// lives in properties instead.
export type TAOIQuery = IFeature<
  IGeometry | null,
  IAOIRegionProperties | IAOIPointProperties | null
> | null;

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
  setFeature: (
    a_Value:
      | IAOIStoreStates['feature']
      | ((a_Prev: IAOIStoreStates['feature']) => IAOIStoreStates['feature']),
  ) => void;
  setRadius: (
    a_Value:
      | IAOIStoreStates['radius']
      | ((a_Prev: IAOIStoreStates['radius']) => IAOIStoreStates['radius']),
  ) => void;
  setEEZOptions: (
    a_Value:
      | IAOIStoreStates['eezOptions']
      | ((
          a_Prev: IAOIStoreStates['eezOptions'],
        ) => IAOIStoreStates['eezOptions']),
  ) => void;
  setEEZActive: (
    a_Value:
      | IAOIStoreStates['eezActive']
      | ((
          a_Prev: IAOIStoreStates['eezActive'],
        ) => IAOIStoreStates['eezActive']),
  ) => void;
  setMPAOptions: (
    a_Value:
      | IAOIStoreStates['mpaOptions']
      | ((
          a_Prev: IAOIStoreStates['mpaOptions'],
        ) => IAOIStoreStates['mpaOptions']),
  ) => void;
  setMPAActive: (
    a_Value:
      | IAOIStoreStates['mpaActive']
      | ((
          a_Prev: IAOIStoreStates['mpaActive'],
        ) => IAOIStoreStates['mpaActive']),
  ) => void;
  getAOI: () => TAOIQuery;
  importAOI: (a_Data: TAOIQuery) => void;
}

export interface IConfigStoreStates {
  config: IConfigJSON | null;
}
export interface IConfigStoreActions {
  setConfig: (
    a_Value:
      | IConfigStoreStates['config']
      | ((
          a_Prev: IConfigStoreStates['config'],
        ) => IConfigStoreStates['config']),
  ) => void;
  getThreshold: () => IConfigJSON['threshold'];
  getExport: () => TExportConfig;
}

export interface IAdvancedQueryStoreStates {
  spatialResolution: ESpatialResolution;
  format: EFormat;
  groupBy: EGroupBy;
  temporalResolution: ETemporalResolution;
  spatialAggregation: boolean;
}
export interface IAdvancedQueryStoreActions {
  setSpatialResolution: (
    a_Value:
      | IAdvancedQueryStoreStates['spatialResolution']
      | ((
          a_Prev: IAdvancedQueryStoreStates['spatialResolution'],
        ) => IAdvancedQueryStoreStates['spatialResolution']),
  ) => void;
  setFormat: (
    a_Value:
      | IAdvancedQueryStoreStates['format']
      | ((
          a_Prev: IAdvancedQueryStoreStates['format'],
        ) => IAdvancedQueryStoreStates['format']),
  ) => void;
  setGroupBy: (
    a_Value:
      | IAdvancedQueryStoreStates['groupBy']
      | ((
          a_Prev: IAdvancedQueryStoreStates['groupBy'],
        ) => IAdvancedQueryStoreStates['groupBy']),
  ) => void;
  setTemporalResolution: (
    a_Value:
      | IAdvancedQueryStoreStates['temporalResolution']
      | ((
          a_Prev: IAdvancedQueryStoreStates['temporalResolution'],
        ) => IAdvancedQueryStoreStates['temporalResolution']),
  ) => void;
  setSpatialAggregation: (
    a_Value:
      | IAdvancedQueryStoreStates['spatialAggregation']
      | ((
          a_Prev: IAdvancedQueryStoreStates['spatialAggregation'],
        ) => IAdvancedQueryStoreStates['spatialAggregation']),
  ) => void;
  getAdvancedQuery: () => Omit<
    IAdvancedQueryStoreStates,
    'datasets' | 'mainDatasetVersion' | 'subDatasetVersion'
  >;
}

export interface IPaginationStoreStates {
  limit: number | null;
  offset: number | null;
}
export interface IPaginationStoreActions {
  setLimit: (
    a_Value:
      | IPaginationStoreStates['limit']
      | ((
          a_Prev: IPaginationStoreStates['limit'],
        ) => IPaginationStoreStates['limit']),
  ) => void;
  setOffset: (
    a_Value:
      | IPaginationStoreStates['offset']
      | ((
          a_Prev: IPaginationStoreStates['offset'],
        ) => IPaginationStoreStates['offset']),
  ) => void;
  getPagination: () => IPaginationStoreStates;
}

export interface IMessageStoreStates {
  info: string | null
  warn: string | null
  error: string | null
}

export interface IMessageStoreActions {
  setMessage: ( a_Value: IMessageStoreStates['info'] | ((a_Prev: IMessageStoreStates['info']) => IMessageStoreStates['info']) ) => void;
  setWarn: ( a_Value: IMessageStoreStates['warn'] | ((a_Prev: IMessageStoreStates['warn']) => IMessageStoreStates['warn']) ) => void;
  setError: ( a_Value: IMessageStoreStates['error'] | ((a_Prev: IMessageStoreStates['error']) => IMessageStoreStates['error']) ) => void;
}