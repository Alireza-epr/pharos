import { isBoolean, isNumber, isObject, isString } from '@packages/utils';
import {
  ERegionBufferOperations,
  ERegionBufferUnits,
  ERegionDatasets,
  EFetchMethods,
  EHotspotTimeBins,
} from '@packages/enum';
import { IVesselConfigJSON, IVesselSearchURLParams } from '@packages/types';
import {
  IAdvancedQueryQuery,
  IFilterQuery,
  IHotspotQuery,
  IPaginationQuery,
  ISortOrderQuery,
  IThresholdQuery,
  ITimeRangeQuery,
  TAOIQuery,
} from '../types/storeTypes';

// Matches getAOI()'s two possible shapes exactly: a named region lives under
// url_params; a drawn Zonal/Point polygon lives under body_params.geojson
// (with the Point tool's radius riding alongside type/coordinates there).
export const isValidAOIQuery = (a_Data: unknown): a_Data is TAOIQuery => {
  if (a_Data === null) return true;
  if (!isObject(a_Data)) return false;

  if ('url_params' in a_Data) {
    const url_params = a_Data['url_params'];
    return (
      isObject(url_params) &&
      isString(url_params['region-id']) &&
      (url_params['region-dataset'] === ERegionDatasets.eez ||
        url_params['region-dataset'] === ERegionDatasets.mpa) &&
      (url_params['buffer-operation'] === undefined ||
        Object.values(ERegionBufferOperations).includes(
          url_params['buffer-operation'],
        )) &&
      (url_params['buffer-unit'] === undefined ||
        Object.values(ERegionBufferUnits).includes(url_params['buffer-unit'])) &&
      (url_params['buffer-value'] === undefined ||
        isString(url_params['buffer-value']))
    );
  }

  if ('body_params' in a_Data) {
    const body_params = a_Data['body_params'];
    if (!isObject(body_params)) return false;
    const geojson = body_params['geojson'];
    if (
      !isObject(geojson) ||
      !isString(geojson['type']) ||
      !('coordinates' in geojson)
    ) {
      return false;
    }
    const properties = geojson['properties'];
    return (
      properties === null ||
      (isObject(properties) && isNumber(properties['radius']))
    );
  }

  return false;
};

// The same `date-range` URL param ReportTab sends to the backend. Trusted
// only if it splits into two comma-separated values that actually parse as
// dates.
export const isValidTimeRangeQuery = (
  a_Data: unknown,
): a_Data is ITimeRangeQuery => {
  if (!isObject(a_Data)) return false;
  const dateRange = a_Data['date-range'];
  if (!isString(dateRange)) return false;
  const [from, to] = dateRange.split(',');
  return (
    isString(from) &&
    isString(to) &&
    !Number.isNaN(Date.parse(from)) &&
    !Number.isNaN(Date.parse(to))
  );
};

// The same `pagination` body param ReportTab sends to the backend. Trusted
// only if both fields are a number or null, same as the store itself allows.
export const isValidPaginationQuery = (
  a_Data: unknown,
): a_Data is IPaginationQuery => {
  if (!isObject(a_Data)) return false;
  const pagination = a_Data['pagination'];
  if (!isObject(pagination)) return false;
  const { limit, offset } = pagination;
  return (
    (limit === null || isNumber(limit)) && (offset === null || isNumber(offset))
  );
};

// The same `sort` field IConfigJSON already carries. Trusted only if it's an
// array of { sortBy: string; direction?: 'asc' | 'desc' }.
export const isValidSortOrderQuery = (
  a_Data: unknown,
): a_Data is ISortOrderQuery => {
  if (!isObject(a_Data)) return false;
  const sort = a_Data['sort'];
  if (!Array.isArray(sort)) return false;
  return sort.every(
    (item) =>
      isObject(item) &&
      isString(item['sortBy']) &&
      (item['direction'] === undefined ||
        item['direction'] === 'asc' ||
        item['direction'] === 'desc'),
  );
};

export const isValidFilterQuery = (a_Data: unknown): a_Data is IFilterQuery => {
  if (!isObject(a_Data)) return false;
  const { filter, url_params } = a_Data;
  return isObject(filter) && isObject(url_params);
};

export const isValidThresholdQuery = (
  a_Data: unknown,
): a_Data is IThresholdQuery => {
  if (!isObject(a_Data)) return false;
  const { threshold } = a_Data;
  return isObject(threshold) && Object.values(threshold).every(isNumber);
};

export const isValidHotspotQuery = (
  a_Data: unknown,
): a_Data is IHotspotQuery => {
  if (!isObject(a_Data)) return false;
  const hotspot = a_Data['hotspot'];
  if (!isObject(hotspot)) return false;
  const { resolution, timeBin } = hotspot;
  return (
    isNumber(resolution) &&
    Number.isInteger(resolution) &&
    resolution >= 0 &&
    resolution <= 15 &&
    (timeBin === EHotspotTimeBins.DAILY || timeBin === EHotspotTimeBins.HOURLY)
  );
};

// The wire-format params getVesselSearchParams() sends (and
// IVesselConfigJSON.url_params carries) -- `datasets[i]`/`match-fields[i]`/
// `includes[i]` are indexed keys, not checked field-by-field here, same
// looseness as isValidFilterQuery/isValidAOIQuery above.
export const isValidVesselSearchURLParams = (
  a_Data: unknown,
): a_Data is IVesselSearchURLParams => {
  if (!isObject(a_Data)) return false;
  const { query, where, limit, binary } = a_Data;
  return (
    (query === undefined || isString(query)) &&
    (where === undefined || isString(where)) &&
    (limit === undefined || isNumber(limit)) &&
    (binary === undefined || isBoolean(binary))
  );
};

// The Vessel tab's own export/import config -- see
// VesselExportAndImportConfig.tsx. `method` has exactly one legal value
// (GFW's vessel search is GET-only), same invariant the type itself
// enforces at compile time.
export const isValidVesselConfigJSON = (
  a_Data: unknown,
): a_Data is IVesselConfigJSON => {
  if (!isObject(a_Data)) return false;
  const { url, method, url_params } = a_Data;
  return (
    isString(url) &&
    method === EFetchMethods.get &&
    isValidVesselSearchURLParams(url_params)
  );
};

export const isValidAdvancedQueryQuery = (
  a_Data: unknown,
): a_Data is IAdvancedQueryQuery => {
  if (!isObject(a_Data)) return false;
  const url_params = a_Data['url_params'];
  if (!isObject(url_params)) return false;
  return (
    isString(url_params['format']) &&
    isString(url_params['temporal-resolution']) &&
    (url_params['spatial-resolution'] === undefined ||
      isString(url_params['spatial-resolution'])) &&
    (url_params['group-by'] === undefined ||
      isString(url_params['group-by'])) &&
    (url_params['spatial-aggregation'] === undefined ||
      isBoolean(url_params['spatial-aggregation']))
  );
};
