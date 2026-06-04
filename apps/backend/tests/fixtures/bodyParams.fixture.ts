export const validBodyParams = {
  threshold: {
    "near_coast_threshold": 10,
    "low_confidence_proxy_threshold": 2,
    "shallow_water_threshold": -50,
    "deep_water_threshold": -200,
    "low_triage_score_threshold": 0.3,
    "medium_triage_score_threshold": 0.6,
    "high_triage_score_threshold": 0.85,
    "base_uncertainty_weight": 0.1,
    "missing_field_weight": 0.08,
    "noisy_weight": 0.15,
    "unmatched_weight": 0.2,
    "near_coast_importance_weight": 0.3,
    "eez_importance_weight": 0.2,
    "mpa_importance_weight": 0.5,
    "missing_confidence_proxy_weight": 0.25,
    "low_confidence_proxy_weight": 0.2,
    "low_confidence_tier_weight": 0.08,
    "medium_confidence_tier_weight": 0.0,
    "high_confidence_tier_weight": -0.05
  },
  hotspot: {
    resolution: 10,
    timeBin: 'DAILY',
  },
  filters: {
    triage_score_min: 1,
  },
  sort: [{ sortBy: 'date', direction: 'asc' }],
  body_params: {
    geojson: {
      type: 'Point',
      coordinates: [0, 0],
    },
  },
};

export const invalidBody_missingRequired = {
  hotspot: { resolution: 10, timeBin: 'DAILY' },
};

export const invalidBody_wrongTypes = {
  threshold: 'wrong',
  hotspot: { resolution: 'bad', timeBin: 'DAILY' },
  filters: {},
  sort: 'not-array',
};

export const validBodyParams_2 = {
  threshold: {
    near_coast_threshold: 1,
    low_confidence_proxy_threshold: 2,
    shallow_water_threshold: 3,
    deep_water_threshold: 4,
    low_triage_score_threshold: 5,
    medium_triage_score_threshold: 6,
    high_triage_score_threshold: 7,
    "base_uncertainty_weight": 0.1,
    "missing_field_weight": 0.08,
    "noisy_weight": 0.15,
    "unmatched_weight": 0.2,
    "near_coast_importance_weight": 0.3,
    "eez_importance_weight": 0.2,
    "mpa_importance_weight": 0.5,
    "missing_confidence_proxy_weight": 0.25,
    "low_confidence_proxy_weight": 0.2,
    "low_confidence_tier_weight": 0.08,
    "medium_confidence_tier_weight": 0.0,
    "high_confidence_tier_weight": -0.05
  },
  hotspot: {
    resolution: 10,
    timeBin: 'DAILY',
  },
  filters: {
    triage_score_min: 1,
    triage_score_max: 10,
    reason_codes_include: true,
    is_inside_eez: false,
  },
  sort: [{ sortBy: 'date', direction: 'asc' }],
  body_params: {
    region: {
      dataset: 'public-mpa-all',
      id: '555635930',
    },
  },
};

export const invalidBody_missing_required = {};

export const invalidBody_invalid_sort = {
  threshold: validBodyParams.threshold,
  hotspot: validBodyParams.hotspot,
  filters: validBodyParams.filters,
  sort: 'triage_score',
};

export const invalidBody_wrong_types = {
  threshold: 'wrong',
  hotspot: { resolution: 'bad', timeBin: 123 },
  filters: { triage_score_min: 'low' },
  sort: 'not-array',
};

export const invalidBody_partial_threshold = {
  threshold: {
    near_coast_threshold: 'wrong',
  },
  hotspot: validBodyParams.hotspot,
  filters: validBodyParams.filters,
  sort: validBodyParams.sort,
};

export const invalidBody_geojson = {
  ...validBodyParams,
  body_params: {
    geojson: {
      type: 'InvalidType',
      coordinates: null,
    },
  },
};

export const invalidBody_region = {
  ...validBodyParams_2,
  body_params: {
    region: {
      id: 123,
    },
  },
};

export const invalidBody_region_2 = {
  ...validBodyParams_2,
  body_params: {
    region: {
      dataset: 'EEZ',
      id: 123,
    },
  },
};
