import { IConfigJSON, IGeometry, TURLParams } from '@packages/types';
import {
  EContextLayers,
  ECacheStatus,
  EFetchMethods,
  ERegionDatasets,
  EURLParams,
  TCacheStatus,
} from '@packages/enum';
import { loadRegionOptions } from '../../hooks/fetch';
import { useAOIStore } from '../../stores/areaOfInterestStore';
import { useTimeRangeStore } from '../../stores/timeRangeStore';
import { useSortOrderStore } from '../../stores/sortOrderStore';
import { useFilterStore } from '../../stores/filterStore';
import { useHotspotConfigStore } from '../../stores/hotspotConfigStore';
import { useThresholdStore } from '../../stores/thresholdStore';
import { useConfigStore } from '../../stores/configStore';
import { usePaginationStore } from '../../stores/paginationStore';
import { useAdvancedQueryStore } from '../../stores/advancedQueryStore';
import { globalfishingwatch } from '../fixtures/url';
import { IAOIPointProperties, TAOIQuery } from '../types/storeTypes';
import {
  isValidAdvancedQueryQuery,
  isValidAOIQuery,
  isValidFilterQuery,
  isValidHotspotQuery,
  isValidPaginationQuery,
  isValidSortOrderQuery,
  isValidThresholdQuery,
  isValidTimeRangeQuery,
} from './validationUtils';
import { getURLParam } from '@packages/utils';

export const buildConfig = (): IConfigJSON => {
  const aoi = useAOIStore.getState().getAOI();

  const dateRange = useTimeRangeStore.getState().getTimeRange();
  const sortOrder = useSortOrderStore.getState().getSortOrder();

  const filter = useFilterStore.getState().filter;
  const sources = useFilterStore.getState().getSources();
  const filters = useFilterStore.getState().getFilter();

  const hotspot = useHotspotConfigStore.getState().getHotspot();
  const threshold = useThresholdStore.getState().threshold;
  const exportConfig = useConfigStore.getState().getExport();
  const pagination = usePaginationStore.getState().getPagination();

  const {
    spatialResolution,
    spatialAggregation,
    temporalResolution,
    format,
    groupBy,
  } = useAdvancedQueryStore.getState().getAdvancedQuery();

  const urlParams_base = {
    'spatial-resolution': spatialResolution,
    'spatial-aggregation': spatialAggregation,
    'temporal-resolution': temporalResolution,
    format,
    'group-by': groupBy,
    ...dateRange,
    ...filters,
    ...sources,
  };
  // getAOI() already returns exactly the url_params or body_params fragment
  // IConfigJSON needs — no region/geometry derivation required here anymore.
  const urlParams: TURLParams =
    aoi && 'url_params' in aoi
      ? { ...urlParams_base, ...aoi.url_params }
      : { ...urlParams_base };

  const bodyParams_base = {
    URL: globalfishingwatch.url['4wings'].endpoints.report,
    ...sortOrder,
    filter,
    hotspot,
    threshold,
    ...pagination,
    export: exportConfig,
  };

  const config_base = {
    url_params: {
      ...urlParams,
    },
    ...bodyParams_base,
    cache: getURLParam<TCacheStatus>(EURLParams.cache) ?? ECacheStatus.enabled
  };

  const config: IConfigJSON =
    aoi && 'body_params' in aoi
      ? {
          ...config_base,
          method: EFetchMethods.post,
          body_params: aoi.body_params,
        }
      : {
          ...config_base,
          method: EFetchMethods.get,
        };

  return config;
};

const aoiQueryFromConfig = (a_Config: IConfigJSON): TAOIQuery => {
  if (a_Config.method === EFetchMethods.get) {
    const { 'region-dataset': dataset, 'region-id': id } = a_Config.url_params;
    if (!dataset || !id) return null;
    return { url_params: { 'region-dataset': dataset, 'region-id': id } };
  }
  const geojson = a_Config.body_params.geojson as
    | (IGeometry & { properties?: IAOIPointProperties | null })
    | undefined;
  if (!geojson) return null;
  // `properties` (a Point AOI's radius) rides alongside type/coordinates
  // directly on geojson — a file predating that convention simply won't
  // have it, which degrades gracefully to a plain Zonal-shaped polygon.
  return {
    body_params: { geojson: { ...geojson, properties: geojson.properties ?? null } },
  };
};

export const isValidConfig = (a_Data: unknown): a_Data is IConfigJSON => {
  if (
    !a_Data ||
    typeof a_Data !== 'object' ||
    !('method' in a_Data) ||
    !('url_params' in a_Data)
  ) {
    return false;
  }
  const config = a_Data as IConfigJSON;
  if (
    config.method !== EFetchMethods.get &&
    config.method !== EFetchMethods.post
  ) {
    return false;
  }
  return (
    isValidAOIQuery(aoiQueryFromConfig(config)) &&
    isValidTimeRangeQuery(config.url_params) &&
    isValidAdvancedQueryQuery({ url_params: config.url_params }) &&
    isValidSortOrderQuery({ sort: config.sort }) &&
    isValidPaginationQuery({ pagination: config.pagination }) &&
    isValidFilterQuery({
      filter: config.filter,
      url_params: config.url_params,
    }) &&
    isValidThresholdQuery({ threshold: config.threshold }) &&
    isValidHotspotQuery({ hotspot: config.hotspot })
  );
};

export const importConfig = (a_Config: IConfigJSON): void => {
  const aoiQuery = aoiQueryFromConfig(a_Config);
  if (aoiQuery) useAOIStore.getState().importAOI(aoiQuery);

  useTimeRangeStore.getState().importTimeRange(a_Config.url_params);
  useAdvancedQueryStore
    .getState()
    .importAdvancedQueryConfig({ url_params: a_Config.url_params });
  useSortOrderStore.getState().importSortOrder({ sort: a_Config.sort });
  usePaginationStore
    .getState()
    .importPagination({ pagination: a_Config.pagination });
  useFilterStore.getState().importFilterConfig({
    filter: a_Config.filter,
    url_params: a_Config.url_params,
  });
  useThresholdStore
    .getState()
    .importThresholdConfig({ threshold: a_Config.threshold });
  useHotspotConfigStore
    .getState()
    .importHotspotConfig({ hotspot: a_Config.hotspot });

  useConfigStore.getState().setConfig(a_Config);
};

/**
 * importConfig(), but first makes sure a region-based AOI (region-dataset +
 * region-id in url_params) can actually resolve. importAOI() looks the id
 * up in areaOfInterestStore's eezOptions/mpaOptions, which are normally
 * populated by AreaOfInterest.tsx's own mount-time fetch -- fine for a
 * button-driven file import (the app's been open a while by then), but a
 * URL hydrate (useURLConfigSync) can run before that fetch has even
 * started, let alone resolved, silently dropping the AOI. loadRegionOptions()
 * is cached, so this never doubles AreaOfInterest.tsx's own request.
 */
export const importConfigWithRegionPreload = async (
  a_Config: IConfigJSON,
): Promise<void> => {
  const aoiQuery = aoiQueryFromConfig(a_Config);
  const dataset =
    aoiQuery && 'url_params' in aoiQuery
      ? aoiQuery.url_params['region-dataset']
      : undefined;

  if (dataset === ERegionDatasets.eez) {
    await loadRegionOptions(EContextLayers.eez);
  } else if (dataset === ERegionDatasets.mpa) {
    await loadRegionOptions(EContextLayers.mpa);
  }

  importConfig(a_Config);
};
