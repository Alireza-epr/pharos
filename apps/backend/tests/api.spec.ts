import { EViolationError } from '@packages/enum';
import {
  validateBodyParams,
  validateQueryParams,
  validateViolation,
} from '../src/helpers/utils/validationUtils';
import {
  invalidBody_geojson,
  invalidBody_invalid_sort,
  invalidBody_partial_threshold,
  invalidBody_region,
  invalidBody_region_2,
  invalidBody_wrongTypes,
  validBodyParams,
  validBodyParams_2,
} from './fixtures/bodyParams.fixture';
import {
  HEADERS_BOTH_EXHAUSTED,
  HEADERS_DAILY_EXHAUSTED,
  HEADERS_DAILY_REMAINING_ZERO_RESET_ZERO,
  HEADERS_DAILY_RESET_HOURS_NONZERO_REMAINING_NONZERO,
  HEADERS_EMPTY_STRING_VALUES,
  HEADERS_HEALTHY,
  HEADERS_HEALTHY_NO_RESET_PENDING,
  HEADERS_MISSING_RATELIMIT_FIELDS,
  HEADERS_MONTHLY_EXHAUSTED,
  HEADERS_MONTHLY_REMAINING_ZERO_RESET_ZERO,
  HEADERS_MONTHLY_RESET_DAYS_NONZERO_REMAINING_NONZERO,
  HEADERS_NON_NUMERIC_VALUES,
} from './fixtures/gfwResponse';
import {
  invalidQuery_missing_required,
  invalidQuery_wrong_enum,
  invalidQuery_wrong_types_2,
  invalidQuery_wrongTypes,
  validQueryParams,
  validQueryParams_2,
} from './fixtures/queryParams.fixture';

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

    expect(result.errors?.some((e) => e.field.startsWith('region'))).toBe(true);
    expect(
      result_2.errors?.filter((e) => e.field.startsWith('region')).length,
    ).toBeGreaterThanOrEqual(2);
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

  it('fail_when_query_types_are_invalid', () => {
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
    expect(result_3.errors?.some((e) => e.field === 'limit')).toBe(true);
    expect(result_3.errors?.some((e) => e.field === 'offset')).toBe(true);
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

describe('validateViolation', () => {
  const errorCodes = (result: ReturnType<typeof validateViolation>) =>
    result.errors?.map((e) => e.message) ?? [];
  // ─── healthy state ────────────────────────────────────────────────────────

  it('returns_isValid_true_when_both_quotas_have_remaining_capacity', () => {
    const result = validateViolation(HEADERS_HEALTHY);

    expect(result.isValid).toBe(true);
  });

  it('returns_null_errors_when_both_quotas_have_remaining_capacity', () => {
    const result = validateViolation(HEADERS_HEALTHY);

    expect(result.errors).toBeNull();
  });

  it('returns_isValid_true_when_remaining_positive_and_reset_counters_are_zero', () => {
    const result = validateViolation(HEADERS_HEALTHY_NO_RESET_PENDING);

    expect(result.isValid).toBe(true);
    expect(result.errors).toBeNull();
  });

  // ─── daily rate limit ─────────────────────────────────────────────────────

  it('returns_isValid_false_when_daily_remaining_is_0_and_reset_hours_greater_than_0', () => {
    const result = validateViolation(HEADERS_DAILY_EXHAUSTED);

    expect(result.isValid).toBe(false);
  });

  it('adds_daily_rate_limit_exceeded_error_when_daily_quota_is_exhausted', () => {
    const result = validateViolation(HEADERS_DAILY_EXHAUSTED);

    expect(errorCodes(result)).toContain(
      EViolationError.DAILY_RATE_LIMIT_EXCEEDED,
    );
  });

  it('does_not_add_monthly_error_when_only_daily_quota_is_exhausted', () => {
    const result = validateViolation(HEADERS_DAILY_EXHAUSTED);

    expect(errorCodes(result)).not.toContain(
      EViolationError.MONTHLY_RATE_LIMIT_EXCEEDED,
    );
    expect(result.errors).toHaveLength(1);
  });

  it('daily_error_references_correct_header_field', () => {
    const result = validateViolation(HEADERS_DAILY_EXHAUSTED);

    expect(result.errors?.[0].field).toBe(
      'x-ratelimit-daily-remaining-requests',
    );
  });

  it('does_not_trigger_daily_error_when_remaining_is_0_but_reset_hours_is_also_0', () => {
    // remaining=0 AND resetHours=0 means the quota just reset — not an error state
    const result = validateViolation(HEADERS_DAILY_REMAINING_ZERO_RESET_ZERO);

    expect(errorCodes(result)).not.toContain(
      EViolationError.DAILY_RATE_LIMIT_EXCEEDED,
    );
  });

  it('does_not_trigger_daily_error_when_reset_hours_is_nonzero_but_remaining_is_also_nonzero', () => {
    // resetHours>0 alone must not be enough to fire an error
    const result = validateViolation(
      HEADERS_DAILY_RESET_HOURS_NONZERO_REMAINING_NONZERO,
    );

    expect(errorCodes(result)).not.toContain(
      EViolationError.DAILY_RATE_LIMIT_EXCEEDED,
    );
  });

  // ─── monthly rate limit ───────────────────────────────────────────────────

  it('returns_isValid_false_when_monthly_remaining_is_0_and_reset_days_greater_than_0', () => {
    const result = validateViolation(HEADERS_MONTHLY_EXHAUSTED);

    expect(result.isValid).toBe(false);
  });

  it('adds_monthly_rate_limit_exceeded_error_when_monthly_quota_is_exhausted', () => {
    const result = validateViolation(HEADERS_MONTHLY_EXHAUSTED);

    expect(errorCodes(result)).toContain(
      EViolationError.MONTHLY_RATE_LIMIT_EXCEEDED,
    );
  });

  it('does_not_add_daily_error_when_only_monthly_quota_is_exhausted', () => {
    const result = validateViolation(HEADERS_MONTHLY_EXHAUSTED);

    expect(errorCodes(result)).not.toContain(
      EViolationError.DAILY_RATE_LIMIT_EXCEEDED,
    );
    expect(result.errors).toHaveLength(1);
  });

  it('monthly_error_references_correct_header_field', () => {
    const result = validateViolation(HEADERS_MONTHLY_EXHAUSTED);

    expect(result.errors?.[0].field).toBe(
      'x-ratelimit-monthly-remaining-requests',
    );
  });

  it('does_not_trigger_monthly_error_when_remaining_is_0_but_reset_days_is_also_0', () => {
    // remaining=0 AND resetDays=0 means the quota just reset — not an error state
    const result = validateViolation(HEADERS_MONTHLY_REMAINING_ZERO_RESET_ZERO);

    expect(errorCodes(result)).not.toContain(
      EViolationError.MONTHLY_RATE_LIMIT_EXCEEDED,
    );
  });

  it('does_not_trigger_monthly_error_when_reset_days_is_nonzero_but_remaining_is_also_nonzero', () => {
    // resetDays>0 alone must not be enough to fire an error
    const result = validateViolation(
      HEADERS_MONTHLY_RESET_DAYS_NONZERO_REMAINING_NONZERO,
    );

    expect(errorCodes(result)).not.toContain(
      EViolationError.MONTHLY_RATE_LIMIT_EXCEEDED,
    );
  });

  // ─── both limits exhausted ────────────────────────────────────────────────

  it('returns_isValid_false_when_both_daily_and_monthly_quotas_are_exhausted', () => {
    const result = validateViolation(HEADERS_BOTH_EXHAUSTED);

    expect(result.isValid).toBe(false);
  });

  it('adds_both_errors_when_daily_and_monthly_quotas_are_exhausted', () => {
    const result = validateViolation(HEADERS_BOTH_EXHAUSTED);

    expect(errorCodes(result)).toContain(
      EViolationError.DAILY_RATE_LIMIT_EXCEEDED,
    );
    expect(errorCodes(result)).toContain(
      EViolationError.MONTHLY_RATE_LIMIT_EXCEEDED,
    );
  });

  it('returns_exactly_two_errors_when_both_quotas_are_exhausted', () => {
    const result = validateViolation(HEADERS_BOTH_EXHAUSTED);

    expect(result.errors).toHaveLength(2);
  });

  // ─── edge cases ───────────────────────────────────────────────────────────

  it('returns_isValid_true_when_rate_limit_headers_are_entirely_missing', () => {
    // Missing headers → Number(undefined) === NaN, neither === 0 nor > 0
    const result = validateViolation(HEADERS_MISSING_RATELIMIT_FIELDS);

    expect(result.isValid).toBe(true);
    expect(result.errors).toBeNull();
  });

  it('does_not_throw_when_headers_object_is_empty', () => {
    expect(() => validateViolation({})).not.toThrow();
  });

  it('does_not_throw_when_headers_is_null', () => {
    expect(() => validateViolation(null)).not.toThrow();
    expect(() => validateViolation(undefined)).not.toThrow();
  });

  it('empty_string_header_values_do_not_trigger_errors', () => {
    // Number('') === 0, but reset counters are also 0 (empty string),
    // so the AND condition is never satisfied
    const result = validateViolation(HEADERS_EMPTY_STRING_VALUES);

    expect(result.isValid).toBe(true);
    expect(result.errors).toBeNull();
  });

  it('non_numeric_header_values_do_not_trigger_errors', () => {
    // Number('abc') === NaN; NaN === 0 is false, NaN > 0 is false
    const result = validateViolation(HEADERS_NON_NUMERIC_VALUES);

    expect(result.isValid).toBe(true);
    expect(result.errors).toBeNull();
  });

  it('errors_field_is_null_not_empty_array_when_no_violations_found', () => {
    // Contract: errors must be null (not []) when there are no violations
    const result = validateViolation(HEADERS_HEALTHY);

    expect(result.errors).toBeNull();
    expect(Array.isArray(result.errors)).toBe(false);
  });
});
