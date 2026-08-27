import { EFetchMethods } from '@packages/enum';
import {
  isValidVesselConfigJSON,
  isValidVesselSearchURLParams,
} from '../src/helpers/utils/validationUtils';

const VALID_URL_PARAMS = {
  query: 'sea hunter',
  limit: 20,
  'match-fields[0]': 'ALL',
  'includes[0]': 'OWNERSHIP',
};

const VALID_CONFIG = {
  url: 'https://gateway.api.globalfishingwatch.org/v3/vessels/search',
  method: EFetchMethods.get,
  url_params: VALID_URL_PARAMS,
};

describe('isValidVesselSearchURLParams', () => {
  it('accepts_a_well_formed_wire_format_object', () => {
    expect(isValidVesselSearchURLParams(VALID_URL_PARAMS)).toBe(true);
  });

  it('accepts_an_empty_object_since_every_field_is_optional', () => {
    expect(isValidVesselSearchURLParams({})).toBe(true);
  });

  it('rejects_null', () => {
    expect(isValidVesselSearchURLParams(null)).toBe(false);
  });

  it('rejects_a_non_string_query', () => {
    expect(
      isValidVesselSearchURLParams({ ...VALID_URL_PARAMS, query: 123 }),
    ).toBe(false);
  });

  it('rejects_a_non_number_limit', () => {
    expect(
      isValidVesselSearchURLParams({ ...VALID_URL_PARAMS, limit: '20' }),
    ).toBe(false);
  });

  it('rejects_a_non_boolean_binary', () => {
    expect(
      isValidVesselSearchURLParams({ ...VALID_URL_PARAMS, binary: 'yes' }),
    ).toBe(false);
  });
});

describe('isValidVesselConfigJSON', () => {
  it('accepts_a_well_formed_config', () => {
    expect(isValidVesselConfigJSON(VALID_CONFIG)).toBe(true);
  });

  it('rejects_null', () => {
    expect(isValidVesselConfigJSON(null)).toBe(false);
  });

  it('rejects_a_non_string_url', () => {
    expect(isValidVesselConfigJSON({ ...VALID_CONFIG, url: 123 })).toBe(
      false,
    );
  });

  it('rejects_a_method_other_than_GET', () => {
    expect(
      isValidVesselConfigJSON({ ...VALID_CONFIG, method: 'POST' }),
    ).toBe(false);
  });

  it('rejects_a_missing_method', () => {
    const { method, ...withoutMethod } = VALID_CONFIG;
    void method;
    expect(isValidVesselConfigJSON(withoutMethod)).toBe(false);
  });

  it('rejects_an_invalid_url_params', () => {
    expect(
      isValidVesselConfigJSON({
        ...VALID_CONFIG,
        url_params: { query: 123 },
      }),
    ).toBe(false);
  });
});
