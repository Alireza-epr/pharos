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
  offset: 10
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
  offset: 10
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

export const invalidQuery_wrong_types_2 = {
  limit: "a",
  offset: "b"
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
