import {
  IFilteringParams,
  IValidationError,
  IValidationResult,
} from '@packages/types';
import {
  EContextLayers,
  EFormat,
  EGeoJSONGeometryType,
  EGroupBy,
  EHotspotTimeBins,
  EReasonCodesStatic,
  ERegionBufferOperations,
  ERegionBufferUnits,
  ERegionDatasets,
  EResponseError,
  ESpatialResolution,
  EThresholdConfig,
  ETemporalResolution,
  EViolationError,
  EVesselRegistryInfoData,
} from '@packages/enum';
import { isBoolean, isNumber, isObject, isString } from '@packages/utils';
import { addError, validateRequiredObject } from './controllerUtils';

/* =========================================================
 * VIOLATIONS VALIDATOR
 * =======================================================*/

export const validateViolation = (a_Headers: any): IValidationResult => {
  if (a_Headers === null || a_Headers === undefined) {
    return {
      isValid: true,
      errors: null,
    };
  }
  const errors: IValidationError[] = [];

  const dailyRemaining = Number(
    a_Headers['x-ratelimit-daily-remaining-requests'],
  );
  const monthlyRemaining = Number(
    a_Headers['x-ratelimit-monthly-remaining-requests'],
  );

  const dailyResetHours = Number(a_Headers['x-ratelimit-daily-reset-hours']);
  const monthlyResetDays = Number(a_Headers['x-ratelimit-monthly-reset-days']);

  // Monthly exhausted
  if (monthlyRemaining === 0 && monthlyResetDays > 0) {
    addError(
      errors,
      EViolationError.MONTHLY_RATE_LIMIT_EXCEEDED,
      'x-ratelimit-monthly-remaining-requests',
    );
  }

  // Daily exhausted
  if (dailyRemaining === 0 && dailyResetHours > 0) {
    addError(
      errors,
      EViolationError.DAILY_RATE_LIMIT_EXCEEDED,
      'x-ratelimit-daily-remaining-requests',
    );
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length ? errors : null,
  };
};

/* =========================================================
 * MAIN BODY VALIDATOR
 * =======================================================*/

export const validateBodyParams = (a_Body: unknown): IValidationResult => {
  const errors: IValidationError[] = [];

  if (!isObject(a_Body)) {
    return {
      isValid: false,
      errors: [
        {
          message: EResponseError.BODY_NOT_OBJECT,
          field: 'body',
        },
      ],
    };
  }

  // pagination (optional)
  if (a_Body.pagination !== undefined) {
    validatePagination(a_Body.pagination, errors);
  }

  // threshold (optional)
  if (a_Body.threshold !== undefined) {
    validateThreshold(a_Body.threshold, errors);
  }

  // hotspot (optional)
  if (a_Body.hotspot !== undefined) {
    validateHotspot(a_Body.hotspot, errors);
  }

  // filter (optional)
  if (a_Body.filter !== undefined) {
    validateFilters(a_Body.filter, errors);
  }

  // sort (optional)
  if (a_Body.sort !== undefined) {
    validateSort(a_Body.sort, errors);
  }

  // body_params (optional)
  if (a_Body.body_params) {
    if (a_Body.body_params.geojson !== undefined) {
      validateGeoJSON(a_Body.body_params.geojson, errors);
    }

    if (a_Body.body_params.region !== undefined) {
      validateRegionFields(a_Body.body_params.region, errors);
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length ? errors : null,
  };
};

/* =========================================================
 * MAIN URL VALIDATOR
 * =======================================================*/
export const validateQueryParams = (a_Query: unknown): IValidationResult => {
  const errors: IValidationError[] = [];

  if (!isObject(a_Query)) {
    return {
      isValid: false,
      errors: [
        {
          message: EResponseError.QUERY_NOT_OBJECT,
          field: 'query',
        },
      ],
    };
  }

  // Required
  validateEnum(a_Query.format, FORMAT, 'format', errors, true);

  validateEnum(
    a_Query['temporal-resolution'],
    TEMPORAL_RESOLUTION,
    'temporal-resolution',
    errors,
    true,
  );

  // Optional
  validateEnum(
    a_Query['spatial-resolution'],
    SPATIAL_RESOLUTION,
    'spatial-resolution',
    errors,
  );

  validateEnum(a_Query['group-by'], GROUP_BY, 'group-by', errors);

  validateBoolean(
    a_Query['spatial-aggregation'],
    'spatial-aggregation',
    errors,
  );

  validateString(a_Query['date-range'], 'date-range', errors);

  validateEnum(
    a_Query['region-dataset'],
    REGION_DATASETS,
    'region-dataset',
    errors,
  );

  validateString(a_Query['region-id'], 'region-id', errors);

  validateEnum(
    a_Query['buffer-operation'],
    REGION_BUFFER_OPERATIONS,
    'buffer-operation',
    errors,
  );

  validateEnum(
    a_Query['buffer-unit'],
    REGION_BUFFER_UNITS,
    'buffer-unit',
    errors,
  );

  validateString(a_Query['buffer-value'], 'buffer-value', errors);

  validateDynamicKeys(a_Query, 'datasets[', errors);
  validateDynamicKeys(a_Query, 'filters[', errors);

  return {
    isValid: errors.length === 0,
    errors: errors.length ? errors : null,
  };
};

/* =========================================================
 * REGIONS QUERY VALIDATOR (GET /v1/regions)
 * =======================================================*/

export const validateRegionsQueryParams = (
  a_Query: unknown,
): IValidationResult => {
  const errors: IValidationError[] = [];

  if (!isObject(a_Query)) {
    return {
      isValid: false,
      errors: [
        {
          message: EResponseError.QUERY_NOT_OBJECT,
          field: 'query',
        },
      ],
    };
  }

  validateEnum(a_Query.dataset, REGIONS_DATASETS, 'dataset', errors, true);

  return {
    isValid: errors.length === 0,
    errors: errors.length ? errors : null,
  };
};

/* =========================================================
 * REGION GEOMETRY QUERY VALIDATOR (GET /v1/regions/geometry)
 * =======================================================*/

export const validateRegionGeometryQueryParams = (
  a_Query: unknown,
): IValidationResult => {
  const errors: IValidationError[] = [];

  if (!isObject(a_Query)) {
    return {
      isValid: false,
      errors: [
        {
          message: EResponseError.QUERY_NOT_OBJECT,
          field: 'query',
        },
      ],
    };
  }

  validateEnum(a_Query.dataset, REGIONS_DATASETS, 'dataset', errors, true);
  validateString(a_Query.id, 'id', errors, true);

  return {
    isValid: errors.length === 0,
    errors: errors.length ? errors : null,
  };
};

/* =========================================================
 * VESSEL SEARCH QUERY VALIDATOR (GET /v1/vessels/search)
 * =======================================================*/

export const validateVesselSearchQueryParams = (
  a_Query: unknown,
): IValidationResult => {
  const errors: IValidationError[] = [];

  if (!isObject(a_Query)) {
    return {
      isValid: false,
      errors: [
        {
          message: EResponseError.QUERY_NOT_OBJECT,
          field: 'query',
        },
      ],
    };
  }

  validateString(a_Query.since, 'since', errors);
  validateNumber(a_Query.limit, 'limit', errors);
  validateString(a_Query.query, 'query', errors);
  validateString(a_Query.where, 'where', errors);
  validateBoolean(a_Query.binary, 'binary', errors);

  validateDynamicKeys(a_Query, 'datasets[', errors);
  validateDynamicKeys(a_Query, 'match-fields[', errors);
  validateDynamicKeys(a_Query, 'includes[', errors);

  return {
    isValid: errors.length === 0,
    errors: errors.length ? errors : null,
  };
};

/* =========================================================
 * VESSEL LIST QUERY VALIDATOR (GET /v1/vessels)
 * =======================================================*/

export const validateVesselListQueryParams = (
  a_Query: unknown,
): IValidationResult => {
  const errors: IValidationError[] = [];

  if (!isObject(a_Query)) {
    return {
      isValid: false,
      errors: [
        {
          message: EResponseError.QUERY_NOT_OBJECT,
          field: 'query',
        },
      ],
    };
  }

  validateEnum(
    a_Query['registries-info-data'],
    REGISTRY_INFO_DATA,
    'registries-info-data',
    errors,
  );
  validateBoolean(a_Query.binary, 'binary', errors);

  validateDynamicKeys(a_Query, 'datasets[', errors);
  validateDynamicKeys(a_Query, 'ids[', errors);
  validateDynamicKeys(a_Query, 'match-fields[', errors);
  validateDynamicKeys(a_Query, 'includes[', errors);

  // At least one id is required -- there's nothing to look up otherwise.
  if (!Object.keys(a_Query).some((k) => k.startsWith('ids['))) {
    addError(errors, EResponseError.REQUIRED_FIELD_MISSING, 'ids');
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length ? errors : null,
  };
};

/* =========================================================
 * HELPERS
 * =======================================================*/

const GEOJSON_TYPES = Object.values(EGeoJSONGeometryType);
const REGION_DATASETS = Object.values(ERegionDatasets);
const REGIONS_DATASETS = Object.values(EContextLayers);
const REGION_BUFFER_OPERATIONS = Object.values(ERegionBufferOperations);
const REGION_BUFFER_UNITS = Object.values(ERegionBufferUnits);
const HOTSPOT_TIME_BINS = Object.values(EHotspotTimeBins);
const REASON_CODES = Object.values(EReasonCodesStatic);

const SPATIAL_RESOLUTION = Object.values(ESpatialResolution);
const FORMAT = Object.values(EFormat);
const GROUP_BY = Object.values(EGroupBy);
const TEMPORAL_RESOLUTION = Object.values(ETemporalResolution);
const REGISTRY_INFO_DATA = Object.values(EVesselRegistryInfoData);

/* =========================================================
 * GEOJSON VALIDATION
 * =======================================================*/

const validateGeoJSON = (a_Geojson: unknown, a_Errors: IValidationError[]) => {
  if (!isObject(a_Geojson)) {
    addError(a_Errors, EResponseError.INVALID_GEOJSON, 'geojson');
    return;
  }

  if (!GEOJSON_TYPES.includes(a_Geojson.type)) {
    addError(a_Errors, EResponseError.INVALID_GEOJSON_TYPE, 'geojson.type');
  }

  if (a_Geojson.coordinates === undefined || a_Geojson.coordinates === null) {
    addError(
      a_Errors,
      EResponseError.INVALID_GEOJSON_COORDINATES,
      'geojson.coordinates',
    );
  }
};

/* =========================================================
 * PAGINATION VALIDATION
 * =======================================================*/

const validatePagination = (
  a_Pagination: unknown,
  a_Errors: IValidationError[],
) => {
  if (!validateRequiredObject(a_Pagination, 'pagination', a_Errors)) {
    return;
  }

  const requiredFields = ['limit', 'offset'];

  for (const field of requiredFields) {
    const value = a_Pagination[field];

    if (value === undefined) {
      addError(
        a_Errors,
        EResponseError.REQUIRED_FIELD_MISSING,
        `pagination.${field}`,
      );
      continue;
    }

    if (!isNumber(value)) {
      addError(a_Errors, EResponseError.INVALID_NUMBER, `pagination.${field}`);
    }
  }
};

/* =========================================================
 * THRESHOLD VALIDATION
 * =======================================================*/

const validateThreshold = (
  a_Threshold: unknown,
  a_Errors: IValidationError[],
) => {
  if (!validateRequiredObject(a_Threshold, 'threshold', a_Errors)) {
    return;
  }

  const requiredFields = Object.keys(EThresholdConfig);

  for (const field of requiredFields) {
    const value = a_Threshold[field];

    if (value === undefined) {
      addError(
        a_Errors,
        EResponseError.REQUIRED_FIELD_MISSING,
        `threshold.${field}`,
      );
      continue;
    }

    if (!isNumber(value)) {
      addError(a_Errors, EResponseError.INVALID_NUMBER, `threshold.${field}`);
    }
  }
};

/* =========================================================
 * HOTSPOT VALIDATION
 * =======================================================*/

const validateHotspot = (a_Hotspot: unknown, a_Errors: IValidationError[]) => {
  if (!validateRequiredObject(a_Hotspot, 'hotspot', a_Errors)) {
    return;
  }

  if (!isNumber(a_Hotspot.resolution)) {
    addError(a_Errors, EResponseError.INVALID_NUMBER, 'hotspot.resolution');
  } else if (a_Hotspot.resolution < 0 || a_Hotspot.resolution > 15) {
    addError(a_Errors, EResponseError.INVALID_HOTSPOT, 'hotspot.resolution');
  }

  if (!HOTSPOT_TIME_BINS.includes(a_Hotspot.timeBin)) {
    addError(a_Errors, EResponseError.INVALID_ENUM_VALUE, 'hotspot.timeBin');
  }
};

/* =========================================================
 * FILTERS VALIDATION
 * =======================================================*/

const validateFilters = (a_Filters: unknown, a_Errors: IValidationError[]) => {
  if (!validateRequiredObject(a_Filters, 'filters', a_Errors)) {
    return;
  }

  const numberFields: (keyof IFilteringParams)[] = [
    'triage_score_min',
    'triage_score_max',
    'uncertainty_score_min',
    'uncertainty_score_max',
    'distance_to_coast_km_min',
    'distance_to_coast_km_max',
    'bathymetry_min',
    'bathymetry_max',
  ];

  for (const field of numberFields) {
    const value = a_Filters[field];

    if (value !== undefined && !isNumber(value)) {
      addError(a_Errors, EResponseError.INVALID_NUMBER, `filters.${field}`);
    }
  }

  const booleanFields: (keyof IFilteringParams)[] = [
    'only_inside_eez',
    'only_inside_mpa',
  ];

  for (const field of booleanFields) {
    const value = a_Filters[field];

    if (value !== undefined && !isBoolean(value)) {
      addError(a_Errors, EResponseError.INVALID_BOOLEAN, `filters.${field}`);
    }
  }

  const arrayFields: (keyof IFilteringParams)[] = [
    'reason_codes_include',
    'reason_codes_exclude',
  ];

  for (const field of arrayFields) {
    const values: any[] = a_Filters[field];
    if (values !== undefined) {
      for (const value of values) {
        if (!isString(value)) {
          addError(
            a_Errors,
            EResponseError.INVALID_STRING,
            `filters.${field}[${value}]`,
          );
        }
        if (
          value !== undefined &&
          !REASON_CODES.includes(value as EReasonCodesStatic) &&
          !value.startsWith('missing_required_field:')
        ) {
          addError(
            a_Errors,
            EResponseError.INVALID_ARRAY,
            `filters.${field}[${value}]`,
          );
        }
      }
    }
  }

  const textFields: (keyof IFilteringParams)[] = ['event_id'];

  for (const field of textFields) {
    const value = a_Filters[field];

    if (value !== undefined && !isString(value)) {
      addError(a_Errors, EResponseError.INVALID_STRING, `filters.${field}`);
    }
  }
};

/* =========================================================
 * SORT VALIDATION
 * =======================================================*/

const validateSort = (a_Sort: unknown, a_Errors: IValidationError[]) => {
  if (!Array.isArray(a_Sort)) {
    addError(a_Errors, EResponseError.INVALID_ARRAY, 'sort');
    return;
  }

  a_Sort.forEach((item, index) => {
    if (!isObject(item)) {
      addError(a_Errors, EResponseError.INVALID_SORT, `sort[${index}]`);
      return;
    }

    if (!isString(item.sortBy) || item.sortBy.trim() === '') {
      addError(
        a_Errors,
        EResponseError.INVALID_STRING,
        `sort[${index}].sortBy`,
      );
    }

    if (
      item.direction !== undefined &&
      !['asc', 'desc'].includes(item.direction)
    ) {
      addError(
        a_Errors,
        EResponseError.INVALID_ENUM_VALUE,
        `sort[${index}].direction`,
      );
    }
  });
};

/* =========================================================
 * REGION VALIDATION
 * =======================================================*/

const validateRegionFields = (
  a_Region: Record<string, any>,
  a_Errors: IValidationError[],
) => {
  if (!isObject(a_Region)) {
    addError(a_Errors, EResponseError.INVALID_REGION_CONFIGURATION, 'region');
    return;
  }
  if (
    a_Region.dataset !== undefined &&
    (!isString(a_Region.dataset) || a_Region.dataset.trim() === '')
  ) {
    addError(a_Errors, EResponseError.INVALID_STRING, 'region.dataset');
  }

  if (
    a_Region.id !== undefined &&
    (!isString(a_Region.id) || a_Region.id.trim() === '')
  ) {
    addError(a_Errors, EResponseError.INVALID_STRING, 'region.id');
  }

  if (
    a_Region.dataset !== undefined &&
    !REGION_DATASETS.includes(a_Region.dataset)
  ) {
    addError(a_Errors, EResponseError.INVALID_ENUM_VALUE, 'region.dataset');
  }

  if (
    a_Region.bufferOperation !== undefined &&
    !REGION_BUFFER_OPERATIONS.includes(a_Region.bufferOperation)
  ) {
    addError(
      a_Errors,
      EResponseError.INVALID_ENUM_VALUE,
      'region.bufferOperation',
    );
  }

  if (
    a_Region.bufferUnit !== undefined &&
    !REGION_BUFFER_UNITS.includes(a_Region.bufferUnit)
  ) {
    addError(a_Errors, EResponseError.INVALID_ENUM_VALUE, 'region.bufferUnit');
  }

  if (a_Region.bufferValue !== undefined && !isString(a_Region.bufferValue)) {
    addError(a_Errors, EResponseError.INVALID_STRING, 'region.bufferValue');
  }
};

/* =========================================================
 * CORE VALIDATION
 * =======================================================*/

const validateEnum = <T extends readonly string[]>(
  a_Value: unknown,
  a_Allowed: T,
  a_Field: string,
  a_errors: IValidationError[],
  a_Required = false,
) => {
  if (a_Value === undefined) {
    if (a_Required) {
      addError(a_errors, EResponseError.REQUIRED_FIELD_MISSING, a_Field);
    }
    return;
  }

  if (!isString(a_Value) || !a_Allowed.includes(a_Value as any)) {
    addError(a_errors, EResponseError.INVALID_ENUM_VALUE, a_Field);
  }
};

const validateString = (
  a_Value: unknown,
  a_Field: string,
  a_Errors: IValidationError[],
  a_Required = false,
) => {
  if (a_Value === undefined) {
    if (a_Required) {
      addError(a_Errors, EResponseError.REQUIRED_FIELD_MISSING, a_Field);
    }
    return;
  }

  if (!isString(a_Value) || a_Value.trim() === '') {
    addError(a_Errors, EResponseError.INVALID_STRING, a_Field);
  }
};

const validateBoolean = (
  a_Value: unknown,
  a_Field: string,
  a_Errors: IValidationError[],
) => {
  if (a_Value === undefined) return;

  if (!(a_Value === 'true' || a_Value === 'false' || isBoolean(a_Value))) {
    addError(a_Errors, EResponseError.INVALID_BOOLEAN, a_Field);
  }
};

const validateNumber = (
  a_Value: unknown,
  a_Field: string,
  a_Errors: IValidationError[],
  a_Required = false,
) => {
  if (a_Value === undefined) {
    if (a_Required) {
      addError(a_Errors, EResponseError.REQUIRED_FIELD_MISSING, a_Field);
    }
    return;
  }

  const parsed = typeof a_Value === 'string' ? Number(a_Value) : a_Value;

  if (!isNumber(parsed)) {
    addError(a_Errors, EResponseError.INVALID_NUMBER, a_Field);
  }
};

const validateDynamicKeys = (
  a_Query: Record<string, any>,
  a_Prefix: string,
  a_Errors: IValidationError[],
) => {
  Object.keys(a_Query).forEach((a_Key) => {
    if (!a_Key.startsWith(a_Prefix)) return;

    const a_Value = a_Query[a_Key];

    // Every indexed-array param so far (4Wings' datasets[]/filters[],
    // Vessels' datasets[]/match-fields[]/includes[]/ids[]) is a required
    // string -- one shared check for all of them.
    if (
      a_Prefix === 'datasets[' ||
      a_Prefix === 'filters[' ||
      a_Prefix === 'match-fields[' ||
      a_Prefix === 'includes[' ||
      a_Prefix === 'ids['
    ) {
      validateString(a_Value, a_Key, a_Errors, true);
    }
  });
};
