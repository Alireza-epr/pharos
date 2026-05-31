import { validateBodyParams, validateQueryParams } from "../src/modules/events/events.validators";
import { invalidBody_geojson, invalidBody_invalid_sort, invalidBody_partial_threshold, invalidBody_region, invalidBody_region_2, invalidBody_wrongTypes, validBodyParams, validBodyParams_2 } from "./fixtures/bodyParams.fixture";
import { invalidQuery_missing_required, invalidQuery_wrong_enum, invalidQuery_wrong_types_2, invalidQuery_wrongTypes, validQueryParams, validQueryParams_2 } from "./fixtures/queryParams.fixture";

describe('validateBodyParams', () => {
  it('validate_body_params_success', () => {
    const result = validateBodyParams(validBodyParams);
    const result_2 = validateBodyParams(validBodyParams_2);

    expect(result.isValid).toBe(true);
    expect(result_2.isValid).toBe(true);
    expect(result.errors).toBeNull();
    expect(result_2.errors).toBeNull();
  });

  it('fail_when_sort_is_invalid', () => {
    const result = validateBodyParams(invalidBody_invalid_sort);

    expect(result.isValid).toBe(false);
    expect(result.errors?.some((e) => e.field === 'sort')).toBe(true);
  });

  it('fail_when_types_are_invalid', () => {
    const result = validateBodyParams(invalidBody_wrongTypes);

    expect(result.isValid).toBe(false);
    expect(result.errors?.length).toBeGreaterThan(0);

    expect(result.errors?.some((e) => e.field.includes('threshold'))).toBe(
      true,
    );
  });

  it('accepts_optional_geojson', () => {
    const result = validateBodyParams(validBodyParams);

    const geoErrors =
      result.errors?.filter((e) => e.field.includes('geojson')) || [];

    expect(geoErrors.length).toBe(0);
  });

  it('handles_partial_threshold_errors', () => {
    const result = validateBodyParams(invalidBody_partial_threshold);

    expect(result.isValid).toBe(false);

    expect(result.errors?.some((e) => e.field.includes('threshold'))).toBe(
      true,
    );
  });

  it('validates_geojson_structure', () => {
    const result = validateBodyParams(invalidBody_geojson);

    expect(result.isValid).toBe(false);

    expect(result.errors?.some((e) => e.field.startsWith('geojson'))).toBe(
      true,
    );
  });

  it('validates_region_structure', () => {
    const result = validateBodyParams(invalidBody_region);
    const result_2 = validateBodyParams(invalidBody_region_2);

    expect(result.isValid).toBe(false);
    expect(result_2.isValid).toBe(false);

    expect(result.errors?.some((e) => e.field.startsWith('region'))).toBe(
      true,
    );
    expect(result_2.errors?.filter((e) => e.field.startsWith('region')).length).toBeGreaterThanOrEqual(2)
  });

  it('allows_optional_fields_absence', () => {
    const minimal = {
      threshold: validBodyParams.threshold,
      hotspot: validBodyParams.hotspot,
      filters: validBodyParams.filters,
      sort: validBodyParams.sort,
    };

    const result = validateBodyParams(minimal);

    expect(result.isValid).toBe(true);
  });
});

describe('validateQueryParams', () => {
  it('validate_query_params_success', () => {
    const result = validateQueryParams(validQueryParams);
    const result_2 = validateQueryParams(validQueryParams_2);

    expect(result.isValid).toBe(true);
    expect(result_2.isValid).toBe(true);
    expect(result.errors).toBeNull();
    expect(result_2.errors).toBeNull();
  });

  it('fail_when_required_fields_missing', () => {
    const result = validateQueryParams(invalidQuery_missing_required);

    expect(result.isValid).toBe(false);
    expect(result.errors?.length).toBeGreaterThan(0);

    expect(result.errors?.some((e) => e.field.includes('format'))).toBe(true);
  });

  it('fail_when_types_are_invalid', () => {
    const result = validateQueryParams(invalidQuery_wrongTypes);

    expect(result.isValid).toBe(false);
    expect(result.errors?.length).toBeGreaterThan(0);

    const result_2 = validateQueryParams(invalidQuery_wrong_enum);

    expect(result_2.isValid).toBe(false);

    expect(result_2.errors?.some((e) => e.field === 'format')).toBe(true);

    expect(
      result_2.errors?.some((e) => e.field === 'temporal-resolution'),
    ).toBe(true);

    const result_3 = validateQueryParams(invalidQuery_wrong_types_2);
    expect(result_3.isValid).toBe(false);
    expect(
      result_3.errors?.some((e) => e.field === 'limit'),
    ).toBe(true);
    expect(
      result_3.errors?.some((e) => e.field === 'offset'),
    ).toBe(true);
  });

  it('accepts_dynamic_keys', () => {
    const result = validateQueryParams(validQueryParams);

    const datasetErrors =
      result.errors?.filter((e) => e.field.includes('datasets')) || [];

    const filterErrors =
      result.errors?.filter((e) => e.field.includes('filters')) || [];

    expect(datasetErrors.length).toBe(0);
    expect(filterErrors.length).toBe(0);
  });

  it('accepts_boolean_variants', () => {
    const result = validateQueryParams({
      ...validQueryParams,
      'spatial-aggregation': 'true',
    });

    expect(result.isValid).toBe(true);
  });
});
