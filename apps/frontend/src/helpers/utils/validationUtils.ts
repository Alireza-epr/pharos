import { isBoolean, isNumber, isObject, isString } from '@packages/utils';
import { ERegionDatasets, EHotspotTimeBins } from '@packages/enum';
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

export const isValidAOIQuery = (a_Data: unknown): a_Data is TAOIQuery => {
  if (a_Data === null) return true;
  if (!isObject(a_Data) || a_Data['type'] !== 'Feature') return false;

  const geometry = a_Data['geometry'];
  const hasValidGeometry =
    geometry === null ||
    (isObject(geometry) &&
      isString(geometry['type']) &&
      'coordinates' in geometry);
  if (!hasValidGeometry) return false;

  const properties = a_Data['properties'];
  return (
    properties === null ||
    (isObject(properties) &&
      ((isString(properties['region-id']) &&
        (properties['region-dataset'] === ERegionDatasets.eez ||
          properties['region-dataset'] === ERegionDatasets.mpa)) ||
        isNumber(properties['radius'])))
  );
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

export const isValidFilterQuery = (
  a_Data: unknown,
): a_Data is IFilterQuery => {
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
