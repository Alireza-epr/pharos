import { EFetchMethods } from '@packages/enum';
import { useVesselSearchStore } from '../src/stores/vesselSearchStore';
import {
  buildVesselListConfig,
  buildVesselSearchConfig,
} from '../src/helpers/utils/vesselConfigUtils';

const DEFAULT_STATE = useVesselSearchStore.getState();

describe('buildVesselSearchConfig', () => {
  afterEach(() => {
    useVesselSearchStore.setState(DEFAULT_STATE, true);
  });

  it('always_sends_the_GFW_vessel_search_url_and_GET_method', () => {
    const config = buildVesselSearchConfig();

    expect(config.url).toBe(
      'https://gateway.api.globalfishingwatch.org/v3/vessels/search',
    );
    expect(config.method).toBe(EFetchMethods.get);
  });

  it('defaults_url_params_to_the_live_vesselSearchStore_state', () => {
    useVesselSearchStore.getState().setQuery('sea hunter');

    const config = buildVesselSearchConfig();

    expect(config.url_params.query).toBe('sea hunter');
  });

  it('uses_the_given_url_params_instead_of_the_store_when_provided', () => {
    useVesselSearchStore.getState().setQuery('sea hunter');

    // Same shape VesselTab.tsx's Next button builds -- a scroll session's
    // frozen params with `since` merged in, deliberately independent of
    // whatever's currently live in the search form.
    const config = buildVesselSearchConfig({
      query: 'frozen query',
      limit: 20,
      since: 'scroll-token',
    });

    expect(config.url_params).toEqual({
      query: 'frozen query',
      limit: 20,
      since: 'scroll-token',
    });
  });
});

describe('buildVesselListConfig', () => {
  it('always_sends_the_GFW_vessel_list_url_and_GET_method', () => {
    const config = buildVesselListConfig({ 'ids[0]': 'vessel-a' });

    expect(config.url).toBe(
      'https://gateway.api.globalfishingwatch.org/v3/vessels',
    );
    expect(config.method).toBe(EFetchMethods.get);
  });

  it('carries_the_given_url_params_through_unchanged', () => {
    const params = {
      'ids[0]': 'vessel-a',
      'datasets[0]': 'public-global-vessel-identity:latest',
    };

    const config = buildVesselListConfig(params);

    expect(config.url_params).toEqual(params);
  });
});
