export const validQueryParams = {
  format: 'JSON',
  'temporal-resolution': 'DAILY',
  'spatial-resolution': 'HIGH',
  'group-by': 'VESSEL_ID',
  'spatial-aggregation': true,
  'date-range': '2024-01-01:2024-02-01',
  'region-dataset': 'public-eez-areas',
  'region-id': '123',
  'buffer-operation': 'DIFFERENCE',
  'buffer-unit': 'KILOMETERS',
  'buffer-value': '10',
  'datasets[0]': 'public-global-fishing-effort:v1.0',
  'filters[0]': 'matched="true"',
  limit: 2,
  offset: 10,
};

export const invalidQuery_missingRequired = {
  format: 'JSON',
};

export const invalidQuery_wrongTypes = {
  format: 123,
  'temporal-resolution': false,
  'region-id': 10,
};

export const validQueryParams_2 = {
  format: 'JSON',
  'temporal-resolution': 'DAILY',
  'spatial-resolution': 'HIGH',
  'group-by': 'VESSEL_ID',
  'spatial-aggregation': true,
  'date-range': '2024-01-01:2024-01-31',
  'region-dataset': 'public-eez-areas',
  'region-id': 'region-1',
  'buffer-operation': 'DIFFERENCE',
  'buffer-unit': 'KILOMETERS',
  'buffer-value': '10',
  'datasets[0]': 'public-global-fishing-effort:v1.0',
  'filters[0]': 'speed>5',
  limit: 2,
  offset: 10,
};

export const invalidQuery_missing_required = {
  'temporal-resolution': 'DAILY',
};

export const invalidQuery_wrong_types = {
  format: 123,
  'temporal-resolution': true,
  'region-id': 999,
  'spatial-aggregation': 'yes',
};

export const invalidQuery_wrong_enum = {
  format: 'XML',
  'temporal-resolution': 'WEEKLY',
};

export const invalidQuery_dynamic_keys_missing = {
  format: 'JSON',
  'temporal-resolution': 'DAILY',
  'region-dataset': 'public-eez-areas',
  'region-id': 'id-1',
  'datasets[0]': '',
  'filters[0]': '',
};

// ─── Vessels Search (GET /v1/vessels/search) ───────────────────────────────

export const validVesselSearchQuery = {
  query: 'sea hunter',
  'datasets[0]': 'public-global-vessel-identity:latest',
  'match-fields[0]': 'ALL',
  'includes[0]': 'OWNERSHIP',
  'includes[1]': 'AUTHORIZATIONS',
  'includes[2]': 'MATCH_CRITERIA',
  limit: 20,
};

export const validVesselSearchQuery_whereOnly = {
  where: "flag = 'KOR'",
  'datasets[0]': 'public-global-vessel-identity:latest',
};

export const invalidVesselSearchQuery_wrongTypes = {
  query: 123,
  limit: 'twenty',
  binary: 'not-a-boolean',
};

export const invalidVesselSearchQuery_emptyIndexedValue = {
  query: 'sea',
  'datasets[0]': '',
};

// ─── Vessels List by IDs (GET /v1/vessels) ─────────────────────────────────

export const validVesselListQuery = {
  'ids[0]': '2cb75b670-08a6-fc17-8fd9-5d9d10a0fbdf',
  'datasets[0]': 'public-global-vessel-identity:latest',
  'registries-info-data': 'ALL',
};

export const validVesselListQuery_multipleIds = {
  'ids[0]': '2cb75b670-08a6-fc17-8fd9-5d9d10a0fbdf',
  'ids[1]': '572b90c6e-e112-3674-d1f3-e84f41e61b62',
  'datasets[0]': 'public-global-vessel-identity:latest',
};

export const invalidVesselListQuery_missingIds = {
  'datasets[0]': 'public-global-vessel-identity:latest',
};

export const invalidVesselListQuery_wrongRegistryInfoData = {
  'ids[0]': '2cb75b670-08a6-fc17-8fd9-5d9d10a0fbdf',
  'registries-info-data': 'EVERYTHING',
};
