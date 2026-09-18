import { IEventConfigJSON, IEventPostBodyParams } from '@packages/types';
import { EContextLayers, EFetchMethods, ERegionDatasets } from '@packages/enum';
import { useGfwEventSearchStore } from '../../stores/gfwEventSearchStore';
import { useTimeRangeStore } from '../../stores/timeRangeStore';
import { useAOIStore } from '../../stores/areaOfInterestStore';
import { loadRegionOptions } from '../../hooks/fetch';
import { globalfishingwatch } from '../fixtures/url';
import { IEventSearchParams, TAOIQuery } from '../types/storeTypes';

/**
 * The Event tab's analogue of vesselConfigUtils.ts's buildVesselSearchConfig()
 * -- builds the IEventConfigJSON sent to POST /v1/events/search.
 * `a_Params` lets a caller reuse a paging session's frozen params
 * (EventTab.tsx's Prev/Next buttons, with `offset` merged in) instead of the
 * live search form; omitted, it reads the current gfwEventSearchStore state,
 * plus useTimeRangeStore (shared date range -- see gfwEventSearchStore.ts's
 * own doc comment) and, when `useReportAOI` is set, useAOIStore.
 */
export const buildEventSearchConfig = (
  a_Params?: IEventSearchParams,
): IEventConfigJSON => {
  if (a_Params) {
    return {
      url: globalfishingwatch.url.events.endpoints.filteredByBody,
      method: EFetchMethods.post,
      url_params: a_Params.url_params,
      body_params: a_Params.body_params,
    };
  }

  const searchStore = useGfwEventSearchStore.getState();
  const { dateFrom, dateTo } = useTimeRangeStore.getState();

  const body_params: IEventPostBodyParams = {
    ...searchStore.getEventBodyParams(),
    // useTimeRangeStore's dateFrom/dateTo are datetime-local strings
    // ('YYYY-MM-DDTHH:mm:ss') -- append 'Z' for a full UTC ISO 8601
    // timestamp (e.g. '2025-12-04T00:00:00Z'), the exact same convention
    // useTimeRangeStore.getTimeRange() already uses for the Report tab's
    // own 'date-range' param, rather than truncating to a bare date.
    startDate: `${dateFrom}Z`,
    endDate: `${dateTo}Z`,
  };

  if (searchStore.useReportAOI) {
    const aoi = useAOIStore.getState().getAOI();
    if (aoi && 'body_params' in aoi) {
      // A drawn Zonal/Point shape -- geojson carries `properties` (the
      // Point tool's radius) that GFW's `geometry` field has no place for;
      // send only the fields the endpoint actually defines (type/coordinates).
      const { properties: _properties, ...geometry } = aoi.body_params.geojson;
      body_params.geometry = geometry;
    } else if (aoi && 'url_params' in aoi) {
      // A named EEZ/MPA region -- GFW's `region` field has no buffer
      // support, so a configured region buffer (buffer-operation/-unit/
      // -value on the Report tab's AOI) does NOT carry over here.
      body_params.region = {
        dataset: aoi.url_params['region-dataset'],
        id: aoi.url_params['region-id'],
      };
    }
  }

  const sort = searchStore.sort.trim();

  return {
    url: globalfishingwatch.url.events.endpoints.filteredByBody,
    method: EFetchMethods.post,
    url_params: {
      limit: searchStore.limit,
      offset: 0,
      ...(sort !== '' && { sort }),
    },
    body_params,
  };
};

/**
 * The reverse of buildEventSearchConfig()'s own geometry/region resolution
 * -- turns an imported/restored IEventPostBodyParams' geometry/region back
 * into the TAOIQuery shape useAOIStore.importAOI() expects. Returns null
 * when neither is present (an AOI-less Event search), which importAOI()
 * treats as "clear the AOI" -- see importEventAOIAndTimeRange()'s own doc
 * comment for why that's the correct behaviour here, not an edge case to
 * special-case around.
 */
const eventAOIQueryFromBodyParams = (
  a_BodyParams: IEventPostBodyParams,
): TAOIQuery => {
  if (a_BodyParams.geometry) {
    return {
      body_params: {
        // A Point AOI's radius (`properties`) never round-trips through
        // GFW's `geometry` field (see buildEventSearchConfig()'s own
        // comment) -- degrades gracefully to a plain Zonal-shaped polygon,
        // the same fallback configUtils.ts's own aoiQueryFromConfig() uses
        // for a config file predating that convention.
        geojson: { ...a_BodyParams.geometry, properties: null },
      },
    };
  }
  if (a_BodyParams.region) {
    return {
      url_params: {
        'region-dataset': a_BodyParams.region.dataset as ERegionDatasets,
        'region-id': a_BodyParams.region.id,
      },
    };
  }
  return null;
};

/**
 * Restores the AOI and date range an Event search config carries -- both
 * are state Pharos shares with the Report tab (useAOIStore/useTimeRangeStore
 * directly, not a copy), so importing an Event config here must fully
 * REPLACE them, exactly like the Report tab's own import does for itself:
 * an Event config with no geometry/region clears the current AOI rather
 * than leaving whatever the Report tab had set, and startDate/endDate
 * always overwrite dateFrom/dateTo even when absent (falling back to '').
 * Used by EventExportAndImportConfig.tsx's file import, historyUtils.ts's
 * "Apply" restore, and URLUtils.ts's eventConfig URL hydrate -- one shared
 * implementation so the three call sites can't drift out of sync.
 */
export const importEventAOIAndTimeRange = async (
  a_BodyParams: IEventPostBodyParams,
): Promise<void> => {
  const aoiQuery = eventAOIQueryFromBodyParams(a_BodyParams);

  // Same "preload the region options before importing" reasoning as
  // configUtils.ts's importConfigWithRegionPreload(): importAOI() resolves
  // a region id against useAOIStore's eezOptions/mpaOptions, which may not
  // be populated yet (e.g. hydrating straight from a URL on first load).
  const dataset =
    aoiQuery && 'url_params' in aoiQuery
      ? aoiQuery.url_params['region-dataset']
      : undefined;
  if (dataset === ERegionDatasets.eez) {
    await loadRegionOptions(EContextLayers.eez);
  } else if (dataset === ERegionDatasets.mpa) {
    await loadRegionOptions(EContextLayers.mpa);
  }

  useAOIStore.getState().importAOI(aoiQuery);

  // Reverse of buildEventSearchConfig()'s own `${dateFrom}Z` -- strip the
  // trailing 'Z' back off a full UTC timestamp to get the datetime-local
  // shape useTimeRangeStore's fields expect, exactly like
  // useTimeRangeStore.importTimeRange() already does for the Report tab.
  useTimeRangeStore
    .getState()
    .setDateFrom((a_BodyParams.startDate ?? '').replace(/Z$/, ''));
  useTimeRangeStore
    .getState()
    .setDateTo((a_BodyParams.endDate ?? '').replace(/Z$/, ''));

  // AOI and date range are a matched pair from the exporting Event
  // search's own point of view -- if geometry/region is present, the
  // search that produced this config had "Use Report AOI" checked, so the
  // checkbox should reflect that on import too (see gfwEventSearchStore.ts's
  // own importEventSearchParams(), which restores every *other* field of
  // the same body_params -- this one just can't live there, since it needs
  // eventAOIQueryFromBodyParams()'s already-computed aoiQuery, not a second
  // geometry/region presence check).
  useGfwEventSearchStore.getState().setUseReportAOI(aoiQuery !== null);
};
