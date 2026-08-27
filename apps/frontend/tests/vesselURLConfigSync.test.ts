jest.mock('../src/helpers/utils/configUtils', () => ({
  isValidConfig: jest.fn(),
  importConfigWithRegionPreload: jest.fn(),
}));

import { EVesselMatchField } from '@packages/enum';
import { useVesselSearchStore } from '../src/stores/vesselSearchStore';
import {
  hydrateVesselSearchConfigFromURL,
  syncVesselSearchConfigToURL,
} from '../src/helpers/utils/URLUtils';
import { buildVesselSearchConfig } from '../src/helpers/utils/vesselConfigUtils';

const DEFAULT_STATE = useVesselSearchStore.getState();

describe('syncVesselSearchConfigToURL_and_hydrateVesselSearchConfigFromURL', () => {
  afterEach(() => {
    useVesselSearchStore.setState(DEFAULT_STATE, true);
    window.history.replaceState(null, '', '/');
  });

  it('writes_the_config_under_its_own_vesselConfig_param_not_the_report_tabs_config_param', () => {
    useVesselSearchStore.getState().setQuery('sea hunter');

    syncVesselSearchConfigToURL(buildVesselSearchConfig());

    const params = new URLSearchParams(window.location.search);
    expect(params.has('vesselConfig')).toBe(true);
    expect(params.has('config')).toBe(false);
  });

  it('round_trips_through_hydrateVesselSearchConfigFromURL_onto_a_fresh_store', () => {
    useVesselSearchStore.getState().setQuery('sea hunter');
    useVesselSearchStore.getState().setMatchFields([EVesselMatchField.ALL]);
    useVesselSearchStore.getState().setLimit(35);

    syncVesselSearchConfigToURL(buildVesselSearchConfig());
    useVesselSearchStore.setState(DEFAULT_STATE, true);

    const result = hydrateVesselSearchConfigFromURL();

    expect(result).toBe('hydrated');
    const state = useVesselSearchStore.getState();
    expect(state.query).toBe('sea hunter');
    expect(state.matchFields).toEqual([EVesselMatchField.ALL]);
    expect(state.limit).toBe(35);
  });

  it('returns_absent_when_no_vesselConfig_param_is_present', () => {
    expect(hydrateVesselSearchConfigFromURL()).toBe('absent');
  });

  it('returns_invalid_and_leaves_the_store_untouched_for_a_malformed_param', () => {
    useVesselSearchStore.getState().setQuery('untouched');
    const url = new URL(window.location.href);
    url.searchParams.set('vesselConfig', '{not valid json');
    window.history.replaceState(null, '', url.toString());

    expect(hydrateVesselSearchConfigFromURL()).toBe('invalid');
    expect(useVesselSearchStore.getState().query).toBe('untouched');
  });

  it('returns_invalid_for_well_formed_json_that_is_not_a_valid_IVesselConfigJSON', () => {
    const url = new URL(window.location.href);
    url.searchParams.set('vesselConfig', JSON.stringify({ foo: 'bar' }));
    window.history.replaceState(null, '', url.toString());

    expect(hydrateVesselSearchConfigFromURL()).toBe('invalid');
  });
});
