import {
  I4wingsReportPostURLParams,
  IConfigBase,
  IConfigJSON,
  IEventPostBodyParams,
  IEventPostURLParams,
  IEventSchema,
  IFeature,
  IFilteringParams,
  IFilteringParamsUI,
  IGeometry,
  IHotspotConfig,
  IPagination,
  IQueryProgressStepMessage,
  ISortOption,
  IVesselIdentity,
  IVesselSearchURLParams,
  T4wingsSource,
  TDatasetVersion,
  TEventConfidence,
  TEventEncounterType,
  TExportConfig,
  TFilterKey,
  TGlobalEvent,
  TRegionGeometry,
  TRegionOption,
  TSourceKey,
} from '@packages/types';
import { TDetailTab, TSidebarTab, TTheme } from '../enum/storeEnum';
import { TLanguage } from '../enum/translationEnum';
import {
  TMatchFilter,
  ECountryFlag,
  EEventDatasets,
  EEventVesselType,
  EFormat,
  EGroupBy,
  EHotspotTimeBins,
  ERegionBufferOperations,
  ERegionBufferUnits,
  ERegionDatasets,
  ESpatialResolution,
  ETemporalResolution,
  EVesselDataset,
  EVesselMatchField,
  EVesselSearchInclude,
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
  // The last events response's pagination (nextOffset/prevOffset/...) --
  // lives here rather than local component state so a history-tab "apply"
  // (see IHistoryEntry) can restore it without re-fetching, and Report tab's
  // prev/next buttons keep working after that restore.
  pagination: IPagination | null;
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
  setPagination: (
    a_Value:
      | IEventStoreStates['pagination']
      | ((
          a_Prev: IEventStoreStates['pagination'],
        ) => IEventStoreStates['pagination']),
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
  filter: IFilteringParams;
  filtersUI: IFilteringParamsUI;
}

export type TFilterURLParams = Omit<
  I4wingsReportPostURLParams,
  | 'format'
  | 'spatial-resolution'
  | 'group-by'
  | 'temporal-resolution'
  | 'date-range'
  | 'spatial-aggregation'
>;

export interface IFilterQuery extends Pick<IConfigBase, 'filter'> {
  url_params: TFilterURLParams;
}

export interface IFilterStoreActions {
  setFilter: (
    a_Value:
      | IFilterStoreStates['filter']
      | ((
          a_Prev: IFilterStoreStates['filter'],
        ) => IFilterStoreStates['filter']),
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
  getFilterConfig: () => IFilterQuery;
  importFilterConfig: (a_Data: IFilterQuery) => void;
}

export interface IContextLayersStoreStates {
  hotspots: boolean;
  eezBoundaries: boolean;
  mpaZones: boolean;
  // The currently-selected event's EEZ/MPA boundaries, once fetched by id
  // (ContextLayersBlock.tsx) -- an event can carry more than one enrichment
  // per layer (overlapping/disputed EEZ claims), so this is an array, empty
  // while the toggle is off, still loading, or the event has no such layer.
  // Kept in the store (not component state) so the map-drawing hook can read
  // it without a prop chain.
  eezGeometries: TRegionGeometry[];
  mpaGeometries: TRegionGeometry[];
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
  setEezGeometries: (
    a_Value:
      | IContextLayersStoreStates['eezGeometries']
      | ((
          a_Prev: IContextLayersStoreStates['eezGeometries'],
        ) => IContextLayersStoreStates['eezGeometries']),
  ) => void;
  setMpaGeometries: (
    a_Value:
      | IContextLayersStoreStates['mpaGeometries']
      | ((
          a_Prev: IContextLayersStoreStates['mpaGeometries'],
        ) => IContextLayersStoreStates['mpaGeometries']),
  ) => void;
}
export interface ISortOrderStoreStates {
  sort: ISortOption[];
}

export type ISortOrderQuery = Pick<IConfigBase, 'sort'>;

export interface ISortOrderStoreActions {
  setSort: (
    a_Value:
      | ISortOrderStoreStates['sort']
      | ((
          a_Prev: ISortOrderStoreStates['sort'],
        ) => ISortOrderStoreStates['sort']),
  ) => void;
  getSortOrder: () => ISortOrderQuery;
  importSortOrder: (a_Data: ISortOrderQuery) => void;
}

export interface IHotspotConfigStoreStates {
  resolution: IHotspotConfig['resolution'];
  timeBin: EHotspotTimeBins;
}

export type IHotspotQuery = Pick<IConfigBase, 'hotspot'>;

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
  getHotspotConfig: () => IHotspotQuery;
  importHotspotConfig: (a_Data: IHotspotQuery) => void;
}

export interface ITimeRangeStoreStates {
  dateFrom: string;
  dateTo: string;
}

export type ITimeRangeQuery = Pick<I4wingsReportPostURLParams, 'date-range'>;

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
  getTimeRange: () => ITimeRangeQuery;
  importTimeRange: (a_Data: ITimeRangeQuery) => void;
}

// A drawn AOI is a standard GeoJSON Feature (RFC 7946) — geometry plus a
// properties bag — not a bare Geometry. Properties are unused for now, but
// the envelope is what makes this a real, portable Feature.
export type TAOIFeature = IFeature<IGeometry, null>;

export interface IAOIStoreStates {
  zonal: boolean;
  point: boolean;
  feature: TAOIFeature | null;
  radius: number;
  eezOptions: TRegionOption[];
  eezActive: TRegionOption | undefined;
  mpaOptions: TRegionOption[];
  mpaActive: TRegionOption | undefined;
  // The active EEZ/MPA region's full boundary, once fetched by id
  // (AreaOfInterest.tsx, via useSyncRegionGeometry -- same mechanism
  // ContextLayersBlock.tsx uses for an event's own EEZ/MPA). Array for
  // symmetry with that hook's contract; a chosen AOI region only ever
  // populates one entry. Empty while nothing's chosen or still loading.
  // Kept in the store so the map-drawing hook can read it without a prop
  // chain -- see useAOIRegionBoundary.
  eezGeometries: TRegionGeometry[];
  mpaGeometries: TRegionGeometry[];
  bufferOperation: ERegionBufferOperations;
  bufferUnit: ERegionBufferUnits;
  bufferValue: number;
}

export interface IAOIRegionProperties {
  'region-dataset': ERegionDatasets;
  'region-id': string;
  'buffer-operation'?: ERegionBufferOperations;
  'buffer-unit'?: ERegionBufferUnits;
  'buffer-value'?: string;
}

export interface IAOIPointProperties {
  radius: number;
}

// getAOI()'s return, reused as-is for the AOI section's import/export button
// — same principle as every other section, but AOI's own query shape splits
// across two different IConfigJSON locations depending on the tool used, so
// this mirrors that directly instead of wrapping in a synthetic envelope: a
// named region belongs in url_params; a drawn Zonal/Point polygon belongs in
// body_params.geojson (with the Point tool's radius riding alongside
// type/coordinates there, since geojson has no other place to carry it —
// see configUtils.ts's buildConfig()).
export interface IAOIRegionQuery {
  url_params: IAOIRegionProperties;
}
export interface IAOIGeometryQuery {
  body_params: {
    geojson: IGeometry & { properties: IAOIPointProperties | null };
  };
}
export type TAOIQuery = IAOIRegionQuery | IAOIGeometryQuery | null;

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
  setEezGeometries: (
    a_Value:
      | IAOIStoreStates['eezGeometries']
      | ((
          a_Prev: IAOIStoreStates['eezGeometries'],
        ) => IAOIStoreStates['eezGeometries']),
  ) => void;
  setMpaGeometries: (
    a_Value:
      | IAOIStoreStates['mpaGeometries']
      | ((
          a_Prev: IAOIStoreStates['mpaGeometries'],
        ) => IAOIStoreStates['mpaGeometries']),
  ) => void;
  setBufferOperation: (
    a_Value:
      | IAOIStoreStates['bufferOperation']
      | ((
          a_Prev: IAOIStoreStates['bufferOperation'],
        ) => IAOIStoreStates['bufferOperation']),
  ) => void;
  setBufferUnit: (
    a_Value:
      | IAOIStoreStates['bufferUnit']
      | ((
          a_Prev: IAOIStoreStates['bufferUnit'],
        ) => IAOIStoreStates['bufferUnit']),
  ) => void;
  setBufferValue: (
    a_Value:
      | IAOIStoreStates['bufferValue']
      | ((
          a_Prev: IAOIStoreStates['bufferValue'],
        ) => IAOIStoreStates['bufferValue']),
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
  getExport: () => TExportConfig;
}

export interface IThresholdStoreStates {
  threshold: IConfigJSON['threshold'];
}

export type IThresholdQuery = Pick<IConfigBase, 'threshold'>;

export interface IThresholdStoreActions {
  setThreshold: (
    a_Value:
      | IThresholdStoreStates['threshold']
      | ((
          a_Prev: IThresholdStoreStates['threshold'],
        ) => IThresholdStoreStates['threshold']),
  ) => void;
  getThresholdConfig: () => IThresholdQuery;
  importThresholdConfig: (a_Data: IThresholdQuery) => void;
}

export interface IAdvancedQueryStoreStates {
  spatialResolution: ESpatialResolution;
  format: EFormat;
  groupBy: EGroupBy;
  temporalResolution: ETemporalResolution;
  spatialAggregation: boolean;
}

// These 5 fields live under IConfigJSON.url_params, not at the top level, so
// the export is wrapped the same way — same as getFilterConfig()'s
// url_params fragment, derived via Pick so it can't drift from the actual
// URL params contract.
export interface IAdvancedQueryQuery {
  url_params: Pick<
    I4wingsReportPostURLParams,
    | 'spatial-resolution'
    | 'format'
    | 'group-by'
    | 'temporal-resolution'
    | 'spatial-aggregation'
  >;
}
export interface IAdvancedQueryStoreActions {
  setSpatialResolution: (
    a_Value:
      | IAdvancedQueryStoreStates['spatialResolution']
      | ((
          a_Prev: IAdvancedQueryStoreStates['spatialResolution'],
        ) => IAdvancedQueryStoreStates['spatialResolution']),
  ) => void;
  /* setFormat: (
    a_Value:
      | IAdvancedQueryStoreStates['format']
      | ((
          a_Prev: IAdvancedQueryStoreStates['format'],
        ) => IAdvancedQueryStoreStates['format']),
  ) => void; */
  setGroupBy: (
    a_Value:
      | IAdvancedQueryStoreStates['groupBy']
      | ((
          a_Prev: IAdvancedQueryStoreStates['groupBy'],
        ) => IAdvancedQueryStoreStates['groupBy']),
  ) => void;
  /* setTemporalResolution: (
    a_Value:
      | IAdvancedQueryStoreStates['temporalResolution']
      | ((
          a_Prev: IAdvancedQueryStoreStates['temporalResolution'],
        ) => IAdvancedQueryStoreStates['temporalResolution']),
  ) => void; */
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
  getAdvancedQueryConfig: () => IAdvancedQueryQuery;
  importAdvancedQueryConfig: (a_Data: IAdvancedQueryQuery) => void;
}

export interface IPaginationStoreStates {
  limit: number | null;
  offset: number | null;
}

export type IPaginationQuery = Pick<IConfigBase, 'pagination'>;

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
  getPagination: () => IPaginationQuery;
  importPagination: (a_Data: IPaginationQuery) => void;
}

export interface IQueryProgressStoreStates {
  isOpen: boolean;
  /** True from `start()` until the request settles (success or error) — see `finish()`. */
  isRunning: boolean;
  steps: Omit<IQueryProgressStepMessage, 'type'>[];
}

export interface IQueryProgressStoreActions {
  /** Starts a new run: resets every step to `pending`, opens the modal, marks it running. */
  start: () => void;
  applyStep: (a_Message: IQueryProgressStepMessage) => void;
  /** Marks the first unsettled step as `error` — for failures the stream never reported. */
  fail: (a_Error: string) => void;
  /**
   * Reopens the modal on the current/last run without resetting anything —
   * for a run still in flight whose modal was dismissed early (see ReportTab).
   */
  open: () => void;
  /** Hides the modal only. The run, if still in flight, keeps going. */
  close: () => void;
  /** Marks the run as no longer in flight, whichever way it ended. */
  finish: () => void;
}

export interface IMessageStoreStates {
  info: string | null;
  warn: string | null;
  error: string | null;
}

export interface IMessageStoreActions {
  setMessage: (
    a_Value:
      | IMessageStoreStates['info']
      | ((a_Prev: IMessageStoreStates['info']) => IMessageStoreStates['info']),
  ) => void;
  setWarn: (
    a_Value:
      | IMessageStoreStates['warn']
      | ((a_Prev: IMessageStoreStates['warn']) => IMessageStoreStates['warn']),
  ) => void;
  setError: (
    a_Value:
      | IMessageStoreStates['error']
      | ((
          a_Prev: IMessageStoreStates['error'],
        ) => IMessageStoreStates['error']),
  ) => void;
}

// Vessel search config -- the Vessel tab's analogue of AdvancedQuery/Filter
// for the Report tab, but for GET /vessels/search's own (much smaller)
// parameter set rather than 4Wings'. `datasets`/`matchFields`/`includes`
// stay arrays (mirroring the 4Wings `datasets[]` shape) even though GFW
// currently allows only one legal dataset value, so a second one is a
// config change, not a UI rewrite, if the provider ever adds one.
export interface IVesselSearchStoreStates {
  query: string;
  where: string;
  datasets: EVesselDataset[];
  matchFields: EVesselMatchField[];
  includes: EVesselSearchInclude[];
  limit: number;
}

export interface IVesselSearchStoreActions {
  setQuery: (
    a_Value:
      | IVesselSearchStoreStates['query']
      | ((
          a_Prev: IVesselSearchStoreStates['query'],
        ) => IVesselSearchStoreStates['query']),
  ) => void;
  setWhere: (
    a_Value:
      | IVesselSearchStoreStates['where']
      | ((
          a_Prev: IVesselSearchStoreStates['where'],
        ) => IVesselSearchStoreStates['where']),
  ) => void;
  setMatchFields: (
    a_Value:
      | IVesselSearchStoreStates['matchFields']
      | ((
          a_Prev: IVesselSearchStoreStates['matchFields'],
        ) => IVesselSearchStoreStates['matchFields']),
  ) => void;
  setIncludes: (
    a_Value:
      | IVesselSearchStoreStates['includes']
      | ((
          a_Prev: IVesselSearchStoreStates['includes'],
        ) => IVesselSearchStoreStates['includes']),
  ) => void;
  setLimit: (
    a_Value:
      | IVesselSearchStoreStates['limit']
      | ((
          a_Prev: IVesselSearchStoreStates['limit'],
        ) => IVesselSearchStoreStates['limit']),
  ) => void;
  /** Builds the exact GET /vessels/search query params -- indexed-array
   * fields (`datasets[n]`, `match-fields[n]`, `includes[n]`) included. */
  getVesselSearchParams: () => IVesselSearchURLParams;
  importVesselSearchParams: (a_Params: IVesselSearchURLParams) => void;
}

// Vessel search results -- the Vessel tab's analogue of eventStore, holding
// whatever the last search returned plus which record is selected.
//
// Pagination here is GFW's own forward-only scroll cursor (`since`), not
// the Report tab's offset-based paging: the *same* `since` token is reused
// for every subsequent page (GFW's response echoes it back unchanged --
// confirmed live, it's an Elasticsearch scroll id under the hood), and
// there's no backward cursor at all. So "Prev" is answered from `pages`
// (every page already fetched this search, cached client-side) rather than
// a server round-trip, and "has more" is inferred by comparing how many
// entries have been fetched so far against `total` -- GFW doesn't send an
// explicit end-of-results flag either.
export interface IVesselStoreStates {
  vessels: IVesselIdentity[];
  activeVessel: IVesselIdentity | null;
  // The Vessel tab's analogue of eventStore's selectedEvents -- vessels
  // added to the export list from any search, not just the currently
  // displayed page, so this persists independently of `vessels`/`pages`.
  selectedVessels: IVesselIdentity[];
  pages: IVesselIdentity[][];
  pageIndex: number;
  since: string | null;
  total: number | null;
  // The exact params the current scroll session was started with -- reused
  // (with `since` merged in) for every "next" fetch instead of rebuilding
  // from the live search form, since editing the form mid-scroll must not
  // silently change the query a stale `since` token is still scoped to.
  lastParams: IVesselSearchURLParams | null;
}

export interface IVesselStoreActions {
  setVessels: (
    a_Value:
      | IVesselStoreStates['vessels']
      | ((
          a_Prev: IVesselStoreStates['vessels'],
        ) => IVesselStoreStates['vessels']),
  ) => void;
  setActiveVessel: (
    a_Value:
      | IVesselStoreStates['activeVessel']
      | ((
          a_Prev: IVesselStoreStates['activeVessel'],
        ) => IVesselStoreStates['activeVessel']),
  ) => void;
  setSelectedVessels: (
    a_Value:
      | IVesselStoreStates['selectedVessels']
      | ((
          a_Prev: IVesselStoreStates['selectedVessels'],
        ) => IVesselStoreStates['selectedVessels']),
  ) => void;
  setPages: (
    a_Value:
      | IVesselStoreStates['pages']
      | ((a_Prev: IVesselStoreStates['pages']) => IVesselStoreStates['pages']),
  ) => void;
  setPageIndex: (
    a_Value:
      | IVesselStoreStates['pageIndex']
      | ((
          a_Prev: IVesselStoreStates['pageIndex'],
        ) => IVesselStoreStates['pageIndex']),
  ) => void;
  setSince: (
    a_Value:
      | IVesselStoreStates['since']
      | ((a_Prev: IVesselStoreStates['since']) => IVesselStoreStates['since']),
  ) => void;
  setTotal: (
    a_Value:
      | IVesselStoreStates['total']
      | ((a_Prev: IVesselStoreStates['total']) => IVesselStoreStates['total']),
  ) => void;
  setLastParams: (
    a_Value:
      | IVesselStoreStates['lastParams']
      | ((
          a_Prev: IVesselStoreStates['lastParams'],
        ) => IVesselStoreStates['lastParams']),
  ) => void;
}

export interface IGfwEventSearchStoreStates {
  datasets: Record<EEventDatasets, { active: boolean; version: TDatasetVersion }>;
  vessels: string;
  confidences: TEventConfidence[];
  encounterTypes: TEventEncounterType[];
  vesselTypes: EEventVesselType[];
  vesselGroups: string;
  flags: ECountryFlag[];
  duration: number;
  sort: string;
  limit: number;
  useReportAOI: boolean;
}

export interface IGfwEventSearchStoreActions {
  setDatasets: (
    a_Value:
      | IGfwEventSearchStoreStates['datasets']
      | ((
          a_Prev: IGfwEventSearchStoreStates['datasets'],
        ) => IGfwEventSearchStoreStates['datasets']),
  ) => void;
  setVessels: (
    a_Value:
      | IGfwEventSearchStoreStates['vessels']
      | ((
          a_Prev: IGfwEventSearchStoreStates['vessels'],
        ) => IGfwEventSearchStoreStates['vessels']),
  ) => void;
  setConfidences: (
    a_Value:
      | IGfwEventSearchStoreStates['confidences']
      | ((
          a_Prev: IGfwEventSearchStoreStates['confidences'],
        ) => IGfwEventSearchStoreStates['confidences']),
  ) => void;
  setEncounterTypes: (
    a_Value:
      | IGfwEventSearchStoreStates['encounterTypes']
      | ((
          a_Prev: IGfwEventSearchStoreStates['encounterTypes'],
        ) => IGfwEventSearchStoreStates['encounterTypes']),
  ) => void;
  setVesselTypes: (
    a_Value:
      | IGfwEventSearchStoreStates['vesselTypes']
      | ((
          a_Prev: IGfwEventSearchStoreStates['vesselTypes'],
        ) => IGfwEventSearchStoreStates['vesselTypes']),
  ) => void;
  setVesselGroups: (
    a_Value:
      | IGfwEventSearchStoreStates['vesselGroups']
      | ((
          a_Prev: IGfwEventSearchStoreStates['vesselGroups'],
        ) => IGfwEventSearchStoreStates['vesselGroups']),
  ) => void;
  setFlags: (
    a_Value:
      | IGfwEventSearchStoreStates['flags']
      | ((
          a_Prev: IGfwEventSearchStoreStates['flags'],
        ) => IGfwEventSearchStoreStates['flags']),
  ) => void;
  setDuration: (
    a_Value:
      | IGfwEventSearchStoreStates['duration']
      | ((
          a_Prev: IGfwEventSearchStoreStates['duration'],
        ) => IGfwEventSearchStoreStates['duration']),
  ) => void;
  setSort: (
    a_Value:
      | IGfwEventSearchStoreStates['sort']
      | ((
          a_Prev: IGfwEventSearchStoreStates['sort'],
        ) => IGfwEventSearchStoreStates['sort']),
  ) => void;
  setLimit: (
    a_Value:
      | IGfwEventSearchStoreStates['limit']
      | ((
          a_Prev: IGfwEventSearchStoreStates['limit'],
        ) => IGfwEventSearchStoreStates['limit']),
  ) => void;
  setUseReportAOI: (
    a_Value:
      | IGfwEventSearchStoreStates['useReportAOI']
      | ((
          a_Prev: IGfwEventSearchStoreStates['useReportAOI'],
        ) => IGfwEventSearchStoreStates['useReportAOI']),
  ) => void;
  /** Builds the POST body's filter fields from live store state --
   * `datasets` resolved to versioned dataset ids, everything else passed
   * through when non-empty. Does NOT include startDate/endDate (read from
   * useTimeRangeStore by the caller) or geometry/region (resolved from
   * useAOIStore by the caller when useReportAOI is set) -- both live in
   * other stores, so building them here would risk a stale read. */
  getEventBodyParams: () => IEventPostBodyParams;
  importEventSearchParams: (a_Params: IEventPostBodyParams) => void;
}

// The exact request-shaped params a paging session was started with --
// IEventConfigJSON minus `url`/`method` (which never change per-session).
export interface IEventSearchParams {
  url_params: IEventPostURLParams;
  body_params: IEventPostBodyParams;
}

// Event search results -- the Event tab's analogue of vesselStore, holding
// whatever the last search returned plus which record is selected.
//
// Pagination here is GFW's plain offset/limit paging (`nextOffset`/`total`
// on the response), unlike the Vessel tab's forward-only scroll cursor --
// simpler: "next" is just `offset + limit`, "prev" is `offset - limit`, both
// answerable without a server round-trip once a page has been seen, using
// the same already-fetched-pages cache shape vesselStore uses for the same
// "don't re-fetch what's already in memory" reason.
export interface IGfwEventStoreStates {
  events: TGlobalEvent[];
  activeEvent: TGlobalEvent | null;
  selectedEvents: TGlobalEvent[];
  pages: TGlobalEvent[][];
  pageIndex: number;
  total: number | null;
  // The exact params the current paging session was started with -- reused
  // (with `offset` merged in) for every "next"/"prev" fetch instead of
  // rebuilding from the live search form, since editing the form mid-page
  // must not silently change the query already-fetched pages are scoped to.
  lastParams: IEventSearchParams | null;
  flyToRequest: { lat: number; lon: number } | null;
}

export interface IGfwEventStoreActions {
  setEvents: (
    a_Value:
      | IGfwEventStoreStates['events']
      | ((
          a_Prev: IGfwEventStoreStates['events'],
        ) => IGfwEventStoreStates['events']),
  ) => void;
  setFlyToRequest: (
    a_Value:
      | IGfwEventStoreStates['flyToRequest']
      | ((
          a_Prev: IGfwEventStoreStates['flyToRequest'],
        ) => IGfwEventStoreStates['flyToRequest']),
  ) => void;
  setActiveEvent: (
    a_Value:
      | IGfwEventStoreStates['activeEvent']
      | ((
          a_Prev: IGfwEventStoreStates['activeEvent'],
        ) => IGfwEventStoreStates['activeEvent']),
  ) => void;
  setSelectedEvents: (
    a_Value:
      | IGfwEventStoreStates['selectedEvents']
      | ((
          a_Prev: IGfwEventStoreStates['selectedEvents'],
        ) => IGfwEventStoreStates['selectedEvents']),
  ) => void;
  setPages: (
    a_Value:
      | IGfwEventStoreStates['pages']
      | ((
          a_Prev: IGfwEventStoreStates['pages'],
        ) => IGfwEventStoreStates['pages']),
  ) => void;
  setPageIndex: (
    a_Value:
      | IGfwEventStoreStates['pageIndex']
      | ((
          a_Prev: IGfwEventStoreStates['pageIndex'],
        ) => IGfwEventStoreStates['pageIndex']),
  ) => void;
  setTotal: (
    a_Value:
      | IGfwEventStoreStates['total']
      | ((a_Prev: IGfwEventStoreStates['total']) => IGfwEventStoreStates['total']),
  ) => void;
  setLastParams: (
    a_Value:
      | IGfwEventStoreStates['lastParams']
      | ((
          a_Prev: IGfwEventStoreStates['lastParams'],
        ) => IGfwEventStoreStates['lastParams']),
  ) => void;
}

// The History tab (right-side drawer) caches a query + its result together,
// per originating left-sidebar tab, so "Apply" can restore both without a
// backend fetch.
export interface IReportHistoryResult {
  events: IEventSchema[];
  pagination: IPagination | null;
}

export interface IVesselHistoryResult {
  vessels: IVesselIdentity[];
  pages: IVesselIdentity[][];
  pageIndex: number;
  since: string | null;
  total: number | null;
  lastParams: IVesselSearchURLParams | null;
}

export interface IGfwEventHistoryResult {
  events: TGlobalEvent[];
  pages: TGlobalEvent[][];
  pageIndex: number;
  total: number | null;
  lastParams: IEventSearchParams | null;
}

export type IHistoryEntry =
  | {
      id: string;
      tab: 'report';
      timestamp: string;
      success: boolean;
      resultCount: number;
      config: IConfigJSON;
      result: IReportHistoryResult;
    }
  | {
      id: string;
      tab: 'vessel';
      timestamp: string;
      success: boolean;
      resultCount: number;
      config: IVesselSearchURLParams;
      result: IVesselHistoryResult;
    }
  | {
      id: string;
      tab: 'event';
      timestamp: string;
      success: boolean;
      resultCount: number;
      config: IEventSearchParams;
      result: IGfwEventHistoryResult;
    };

export interface IHistoryStoreStates {
  entries: IHistoryEntry[];
}
export interface IHistoryStoreActions {
  addEntry: (a_Entry: IHistoryEntry) => void;
  clearHistory: () => void;
}
