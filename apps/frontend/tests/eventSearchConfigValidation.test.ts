import { EFetchMethods } from '@packages/enum';
import {
  isValidEventConfigJSON,
  isValidEventSearchURLParams,
} from '../src/helpers/utils/validationUtils';

const VALID_URL_PARAMS = {
  limit: 20,
  offset: 0,
  sort: '+start',
};

const VALID_BODY_PARAMS = {
  datasets: ['public-global-encounters-events:v3.0'],
};

const VALID_CONFIG = {
  url: 'https://gateway.api.globalfishingwatch.org/v3/events',
  method: EFetchMethods.post,
  url_params: VALID_URL_PARAMS,
  body_params: VALID_BODY_PARAMS,
};

describe('isValidEventSearchURLParams', () => {
  it('accepts_a_well_formed_wire_format_object', () => {
    expect(isValidEventSearchURLParams(VALID_URL_PARAMS)).toBe(true);
  });

  it('accepts_an_empty_object_since_every_field_is_optional', () => {
    expect(isValidEventSearchURLParams({})).toBe(true);
  });

  it('rejects_null', () => {
    expect(isValidEventSearchURLParams(null)).toBe(false);
  });

  it('rejects_a_non_number_limit', () => {
    expect(
      isValidEventSearchURLParams({ ...VALID_URL_PARAMS, limit: '20' }),
    ).toBe(false);
  });

  it('rejects_a_non_string_sort', () => {
    expect(
      isValidEventSearchURLParams({ ...VALID_URL_PARAMS, sort: 123 }),
    ).toBe(false);
  });
});

describe('isValidEventConfigJSON', () => {
  it('accepts_a_well_formed_config', () => {
    expect(isValidEventConfigJSON(VALID_CONFIG)).toBe(true);
  });

  it('rejects_null', () => {
    expect(isValidEventConfigJSON(null)).toBe(false);
  });

  it('rejects_a_non_string_url', () => {
    expect(isValidEventConfigJSON({ ...VALID_CONFIG, url: 123 })).toBe(false);
  });

  it('rejects_a_method_other_than_POST', () => {
    expect(isValidEventConfigJSON({ ...VALID_CONFIG, method: 'GET' })).toBe(
      false,
    );
  });

  it('rejects_a_missing_method', () => {
    const { method, ...withoutMethod } = VALID_CONFIG;
    void method;
    expect(isValidEventConfigJSON(withoutMethod)).toBe(false);
  });

  it('rejects_an_invalid_url_params', () => {
    expect(
      isValidEventConfigJSON({
        ...VALID_CONFIG,
        url_params: { limit: '20' },
      }),
    ).toBe(false);
  });

  it('rejects_a_missing_datasets_in_body_params', () => {
    expect(
      isValidEventConfigJSON({
        ...VALID_CONFIG,
        body_params: {},
      }),
    ).toBe(false);
  });

  it('rejects_an_empty_datasets_array_in_body_params', () => {
    expect(
      isValidEventConfigJSON({
        ...VALID_CONFIG,
        body_params: { datasets: [] },
      }),
    ).toBe(false);
  });
});
