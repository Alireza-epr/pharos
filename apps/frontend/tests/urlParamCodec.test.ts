// URLUtils.ts also re-exports config-orchestration helpers that transitively
// pull in the store graph (areaOfInterestStore -> @turf/turf,
// hooks/fetch -> hooks/index's import.meta.env) -- neither parses under this
// repo's current Jest/ts-jest setup (no ESM transform configured for either,
// a pre-existing gap, not something this test needs to fix). This file only
// exercises the pure codec functions below, which never call into
// configUtils, so stub it out at the module boundary rather than letting
// Jest try to evaluate its real (unrelated) dependency chain.
jest.mock('../src/helpers/utils/configUtils', () => ({
  isValidConfig: jest.fn(),
  importConfigWithRegionPreload: jest.fn(),
}));

import {
  MAX_URL_LENGTH,
  decodeJSONFromURL,
  encodeJSONForURL,
} from '../src/helpers/utils/URLUtils';

describe('encodeJSONForURL', () => {
  it('round_trips_through_decodeJSONFromURL', () => {
    const value = { a: 1, b: ['x', 'y'], c: { nested: true } };
    const encoded = encodeJSONForURL(value);
    expect(encoded).not.toBeNull();
    expect(decodeJSONFromURL(encoded as string)).toEqual(value);
  });

  it('returns_null_when_the_encoded_form_would_exceed_the_url_budget', () => {
    // A single JSON string long enough that its percent-encoded form alone
    // clears MAX_URL_LENGTH.
    const huge = 'x'.repeat(MAX_URL_LENGTH + 1);
    expect(encodeJSONForURL(huge)).toBeNull();
  });

  it('stays_under_the_budget_for_a_small_value', () => {
    const encoded = encodeJSONForURL({ small: true });
    expect(encoded).not.toBeNull();
    expect((encoded as string).length).toBeLessThan(MAX_URL_LENGTH);
  });
});

describe('decodeJSONFromURL', () => {
  it('returns_null_for_malformed_json', () => {
    expect(decodeJSONFromURL('{not valid json')).toBeNull();
  });

  it('returns_null_for_an_empty_string', () => {
    expect(decodeJSONFromURL('')).toBeNull();
  });

  it('parses_a_plain_json_string_without_percent_decoding_it_again', () => {
    // URLSearchParams.get() already percent-decodes -- callers pass the raw
    // JSON string here, not a percent-encoded one.
    const json = JSON.stringify({ percent: '100%', braces: '{}' });
    expect(decodeJSONFromURL(json)).toEqual({ percent: '100%', braces: '{}' });
  });
});
