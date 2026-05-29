export const validBodyParams = {
  threshold: {
    near_coast_threshold: 1,
    low_confidence_proxy_threshold: 1,
    shallow_water_threshold: 1,
    deep_water_threshold: 1,
    low_triage_score_threshold: 1,
    medium_triage_score_threshold: 1,
    high_triage_score_threshold: 1,
  },
  hotspot: {
    resolution: 10,
    timeBin: "DAILY",
  },
  filters: {
    triage_score_min: 1,
  },
  sort: [{ sortBy: "date", direction: "asc" }],
  geojson: {
    type: "Point",
    coordinates: [0, 0],
  },
  region: "test-region",
};

export const invalidBody_missingRequired = {
  hotspot: { resolution: 10, timeBin: "DAILY" },
};

export const invalidBody_wrongTypes = {
  threshold: "wrong",
  hotspot: { resolution: "bad", timeBin: "DAILY" },
  filters: {},
  sort: "not-array",
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
  },
  hotspot: {
    resolution: 10,
    timeBin: "DAILY",
  },
  filters: {
    triage_score_min: 1,
    triage_score_max: 10,
    reason_codes_include: true,
    is_inside_eez: false,
  },
  sort: [{ sortBy: "date", direction: "asc" }],
  geojson: {
    type: "Point",
    coordinates: [0, 0],
  },
  region: "eu-west",
};

export const invalidBody_missing_required = {};

export const invalidBody_missing_sort = {
  threshold: validBodyParams.threshold,
  hotspot: validBodyParams.hotspot,
  filters: validBodyParams.filters,
};

export const invalidBody_wrong_types = {
  threshold: "wrong",
  hotspot: { resolution: "bad", timeBin: 123 },
  filters: { triage_score_min: "low" },
  sort: "not-array",
};

export const invalidBody_partial_threshold = {
  threshold: {
    near_coast_threshold: "wrong",
  },
  hotspot: validBodyParams.hotspot,
  filters: validBodyParams.filters,
  sort: validBodyParams.sort,
};

export const invalidBody_geojson = {
  ...validBodyParams,
  geojson: {
    type: "InvalidType",
    coordinates: null,
  },
};