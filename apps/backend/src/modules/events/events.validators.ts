import {
  IFilteringParams,
  IThresholdConfig,
  IValidationErrorDetail,
  IValidationResult,
} from '@packages/types';
import {
  EFormat,
  EGeoJSONGeometryType,
  EGroupBy,
  EHotspotTimeBins,
  ERegionBufferOperations,
  ERegionBufferUnits,
  ERegionDatasets,
  EResponseError,
  ESpatialResolution,
  EStatusCode,
  ETemporalResolution,
} from '@packages/enum';
import { isBoolean, isNumber, isObject, isString } from '@packages/utils';
import {
  addError,
  validateRequiredObject,
} from '../../helpers/utils/controllerUtils';

/* =========================================================
 * MAIN BODY VALIDATOR
 * =======================================================*/

export const validateBodyParams = (a_Body: unknown): IValidationResult => {
  const errors: IValidationErrorDetail[] = [];

  if (!isObject(a_Body)) {
    return {
      isValid: false,
      errors: [
        {
          code: EResponseError.BODY_NOT_OBJECT,
          field: 'body',
          message: 'Request a_Body must be an object',
        },
      ],
    };
  }

  // threshold (required)
  validateThreshold(a_Body.threshold, errors);

  // hotspot (required)
  validateHotspot(a_Body.hotspot, errors);

  // filters (required)
  validateFilters(a_Body.filters, errors);

  // sort (required)
  if (a_Body.sort === undefined) {
    addError(
      errors,
      EResponseError.REQUIRED_FIELD_MISSING,
      'sort',
      'sort is required',
    );
  } else {
    validateSort(a_Body.sort, errors);
  }

  // geojson (optional)
  if (a_Body.geojson !== undefined) {
    validateGeoJSON(a_Body.geojson, errors);
  }

  // region fields
  validateRegionFields(a_Body, errors);

  return {
    isValid: errors.length === 0,
    errors: errors.length ? errors : null,
  };
};

/* =========================================================
 * MAIN URL VALIDATOR
 * =======================================================*/
export const validateQueryParams = (a_Query: unknown): IValidationResult => {
  const errors: IValidationErrorDetail[] = [];

  if (!isObject(a_Query)) {
    return {
      isValid: false,
      errors: [
        {
          code: EResponseError.QUERY_NOT_OBJECT,
          field: 'query',
          message: 'Request query must be an object',
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
    true,
  );

  validateString(a_Query['region-id'], 'region-id', errors, true);

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
 * HELPERS
 * =======================================================*/

const GEOJSON_TYPES = Object.values(EGeoJSONGeometryType);
const REGION_DATASETS = Object.values(ERegionDatasets);
const REGION_BUFFER_OPERATIONS = Object.values(ERegionBufferOperations);
const REGION_BUFFER_UNITS = Object.values(ERegionBufferUnits);
const HOTSPOT_TIME_BINS = Object.values(EHotspotTimeBins);

const SPATIAL_RESOLUTION = Object.values(ESpatialResolution);
const FORMAT = Object.values(EFormat);
const GROUP_BY = Object.values(EGroupBy);
const TEMPORAL_RESOLUTION = Object.values(ETemporalResolution);

/* =========================================================
 * GEOJSON VALIDATION
 * =======================================================*/

const validateGeoJSON = (
  a_Geojson: unknown,
  a_Errors: IValidationErrorDetail[],
) => {
  if (!isObject(a_Geojson)) {
    addError(
      a_Errors,
      EResponseError.INVALID_GEOJSON,
      'geojson',
      'geojson must be an object',
    );
    return;
  }

  if (!GEOJSON_TYPES.includes(a_Geojson.type)) {
    addError(
      a_Errors,
      EResponseError.INVALID_GEOJSON_TYPE,
      'geojson.type',
      `Invalid geojson.type`,
    );
  }

  if (a_Geojson.coordinates === undefined || a_Geojson.coordinates === null) {
    addError(
      a_Errors,
      EResponseError.INVALID_GEOJSON_COORDINATES,
      'geojson.coordinates',
      'geojson.coordinates is required',
    );
  }
};

/* =========================================================
 * THRESHOLD VALIDATION
 * =======================================================*/

const validateThreshold = (
  a_Threshold: unknown,
  a_Errors: IValidationErrorDetail[],
) => {
  if (!validateRequiredObject(a_Threshold, 'threshold', a_Errors)) {
    return;
  }

  const requiredFields: (keyof IThresholdConfig)[] = [
    'near_coast_threshold',
    'low_confidence_proxy_threshold',
    'shallow_water_threshold',
    'deep_water_threshold',
    'low_triage_score_threshold',
    'medium_triage_score_threshold',
    'high_triage_score_threshold',
  ];

  for (const field of requiredFields) {
    const value = a_Threshold[field];

    if (value === undefined) {
      addError(
        a_Errors,
        EResponseError.REQUIRED_FIELD_MISSING,
        `threshold.${field}`,
        `threshold.${field} is required`,
      );
      continue;
    }

    if (!isNumber(value)) {
      addError(
        a_Errors,
        EResponseError.INVALID_NUMBER,
        `threshold.${field}`,
        `threshold.${field} must be a valid number`,
      );
    }
  }
};

/* =========================================================
 * HOTSPOT VALIDATION
 * =======================================================*/

const validateHotspot = (
  a_Hotspot: unknown,
  a_Errors: IValidationErrorDetail[],
) => {
  if (!validateRequiredObject(a_Hotspot, 'hotspot', a_Errors)) {
    return;
  }

  if (!isNumber(a_Hotspot.resolution)) {
    addError(
      a_Errors,
      EResponseError.INVALID_NUMBER,
      'hotspot.resolution',
      'hotspot.resolution must be a number',
    );
  } else if (a_Hotspot.resolution < 0 || a_Hotspot.resolution > 15) {
    addError(
      a_Errors,
      EResponseError.INVALID_HOTSPOT,
      'hotspot.resolution',
      'hotspot.resolution must be between 0 and 15',
    );
  }

  if (!HOTSPOT_TIME_BINS.includes(a_Hotspot.timeBin)) {
    addError(
      a_Errors,
      EResponseError.INVALID_ENUM_VALUE,
      'hotspot.timeBin',
      `hotspot.timeBin must be one of: ${HOTSPOT_TIME_BINS.join(', ')}`,
    );
  }
};

/* =========================================================
 * FILTERS VALIDATION
 * =======================================================*/

const validateFilters = (
  a_Filters: unknown,
  a_Errors: IValidationErrorDetail[],
) => {
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
  ];

  for (const field of numberFields) {
    const value = a_Filters[field];

    if (value !== undefined && !isNumber(value)) {
      addError(
        a_Errors,
        EResponseError.INVALID_NUMBER,
        `filters.${field}`,
        `filters.${field} must be a number`,
      );
    }
  }

  const booleanFields: (keyof IFilteringParams)[] = [
    'reason_codes_include',
    'is_inside_eez',
    'is_inside_mpa',
  ];

  for (const field of booleanFields) {
    const value = a_Filters[field];

    if (value !== undefined && !isBoolean(value)) {
      addError(
        a_Errors,
        EResponseError.INVALID_BOOLEAN,
        `filters.${field}`,
        `filters.${field} must be a boolean`,
      );
    }
  }
};

/* =========================================================
 * SORT VALIDATION
 * =======================================================*/

const validateSort = (a_Sort: unknown, a_Errors: IValidationErrorDetail[]) => {
  if (!Array.isArray(a_Sort)) {
    addError(
      a_Errors,
      EResponseError.INVALID_ARRAY,
      'sort',
      'sort must be an array',
    );
    return;
  }

  a_Sort.forEach((item, index) => {
    if (!isObject(item)) {
      addError(
        a_Errors,
        EResponseError.INVALID_SORT,
        `sort[${index}]`,
        `sort[${index}] must be an object`,
      );
      return;
    }

    if (!isString(item.sortBy) || item.sortBy.trim() === '') {
      addError(
        a_Errors,
        EResponseError.INVALID_STRING,
        `sort[${index}].sortBy`,
        `sort[${index}].sortBy must be a non-empty string`,
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
        `sort[${index}].direction must be "asc" or "desc"`,
      );
    }
  });
};

/* =========================================================
 * REGION VALIDATION
 * =======================================================*/

const validateRegionFields = (
  a_Body: Record<string, any>,
  a_Errors: IValidationErrorDetail[],
) => {
  if (
    a_Body.region !== undefined &&
    (!isString(a_Body.region) || a_Body.region.trim() === '')
  ) {
    addError(
      a_Errors,
      EResponseError.INVALID_STRING,
      'region',
      'region must be a non-empty string',
    );
  }

  if (
    a_Body['region.dataset'] !== undefined &&
    !REGION_DATASETS.includes(a_Body['region.dataset'])
  ) {
    addError(
      a_Errors,
      EResponseError.INVALID_ENUM_VALUE,
      'region.dataset',
      `Invalid region.dataset`,
    );
  }

  if (a_Body['region.id'] !== undefined && !isString(a_Body['region.id'])) {
    addError(
      a_Errors,
      EResponseError.INVALID_STRING,
      'region.id',
      'region.id must be a string',
    );
  }

  if (
    a_Body['region.bufferOperation'] !== undefined &&
    !REGION_BUFFER_OPERATIONS.includes(a_Body['region.bufferOperation'])
  ) {
    addError(
      a_Errors,
      EResponseError.INVALID_ENUM_VALUE,
      'region.bufferOperation',
      'Invalid region.bufferOperation',
    );
  }

  if (
    a_Body['region.bufferUnit'] !== undefined &&
    !REGION_BUFFER_UNITS.includes(a_Body['region.bufferUnit'])
  ) {
    addError(
      a_Errors,
      EResponseError.INVALID_ENUM_VALUE,
      'region.bufferUnit',
      'Invalid region.bufferUnit',
    );
  }

  if (
    a_Body['region.bufferValue'] !== undefined &&
    !isString(a_Body['region.bufferValue'])
  ) {
    addError(
      a_Errors,
      EResponseError.INVALID_STRING,
      'region.bufferValue',
      'region.bufferValue must be a string',
    );
  }
};

/* =========================================================
 * CORE VALIDATION
 * =======================================================*/

const validateEnum = <T extends readonly string[]>(
  a_Value: unknown,
  a_Allowed: T,
  a_Field: string,
  a_errors: IValidationErrorDetail[],
  a_Required = false,
) => {
  if (a_Value === undefined) {
    if (a_Required) {
      addError(
        a_errors,
        EResponseError.REQUIRED_FIELD_MISSING,
        a_Field,
        `${a_Field} is required`,
      );
    }
    return;
  }

  if (!isString(a_Value) || !a_Allowed.includes(a_Value as any)) {
    addError(
      a_errors,
      EResponseError.INVALID_ENUM_VALUE,
      a_Field,
      `${a_Field} must be one of: ${a_Allowed.join(', ')}`,
    );
  }
};

const validateString = (
  a_Value: unknown,
  a_Field: string,
  a_Errors: IValidationErrorDetail[],
  a_Required = false,
) => {
  if (a_Value === undefined) {
    if (a_Required) {
      addError(
        a_Errors,
        EResponseError.REQUIRED_FIELD_MISSING,
        a_Field,
        `${a_Field} is required`,
      );
    }
    return;
  }

  if (!isString(a_Value) || a_Value.trim() === '') {
    addError(
      a_Errors,
      EResponseError.INVALID_STRING,
      a_Field,
      `${a_Field} must be a non-empty string`,
    );
  }
};

const validateBoolean = (
  a_Value: unknown,
  a_Field: string,
  a_Errors: IValidationErrorDetail[],
) => {
  if (a_Value === undefined) return;

  if (!(a_Value === 'true' || a_Value === 'false' || isBoolean(a_Value))) {
    addError(
      a_Errors,
      EResponseError.INVALID_BOOLEAN,
      a_Field,
      `${a_Field} must be boolean (true/false)`,
    );
  }
};

const validateNumber = (
  a_Value: unknown,
  a_Field: string,
  a_Errors: IValidationErrorDetail[],
  a_Required = false,
) => {
  if (a_Value === undefined) {
    if (a_Required) {
      addError(
        a_Errors,
        EResponseError.REQUIRED_FIELD_MISSING,
        a_Field,
        `${a_Field} is required`,
      );
    }
    return;
  }

  const parsed = typeof a_Value === 'string' ? Number(a_Value) : a_Value;

  if (!isNumber(parsed)) {
    addError(
      a_Errors,
      EResponseError.INVALID_NUMBER,
      a_Field,
      `${a_Field} must be a valid number`,
    );
  }
};

const validateDynamicKeys = (
  a_Query: Record<string, any>,
  a_Prefix: string,
  a_Errors: IValidationErrorDetail[],
) => {
  Object.keys(a_Query).forEach((a_Key) => {
    if (!a_Key.startsWith(a_Prefix)) return;

    const a_Value = a_Query[a_Key];

    if (a_Prefix === 'datasets[') {
      validateString(a_Value, a_Key, a_Errors, true);
    }

    if (a_Prefix === 'filters[') {
      validateString(a_Value, a_Key, a_Errors, true);
    }
  });
};
