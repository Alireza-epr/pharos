jest.mock('../src/helpers/utils/configUtils', () => ({
  isValidConfig: jest.fn(),
  importConfigWithRegionPreload: jest.fn(),
}));

import { EEventDatasets } from '@packages/enum';
import { useGfwEventSearchStore } from '../src/stores/gfwEventSearchStore';
import {
  hydrateEventSearchConfigFromURL,
  syncEventSearchConfigToURL,
} from '../src/helpers/utils/URLUtils';
import { buildEventSearchConfig } from '../src/helpers/utils/eventConfigUtils';

const DEFAULT_STATE = useGfwEventSearchStore.getState();

const activateDataset = (a_Dataset: EEventDatasets) => {
  const { datasets } = useGfwEventSearchStore.getState();
  useGfwEventSearchStore.getState().setDatasets({
    ...datasets,
    [a_Dataset]: { ...datasets[a_Dataset], active: true },
  });
};

describe('syncEventSearchConfigToURL_and_hydrateEventSearchConfigFromURL', () => {
  afterEach(() => {
    useGfwEventSearchStore.setState(DEFAULT_STATE, true);
    window.history.replaceState(null, '', '/');
  });

  it('writes_the_config_under_its_own_eventConfig_param_not_the_report_or_vessel_tabs_param', () => {
    activateDataset(EEventDatasets.encountersEvent);

    syncEventSearchConfigToURL(buildEventSearchConfig());

    const params = new URLSearchParams(window.location.search);
    expect(params.has('eventConfig')).toBe(true);
    expect(params.has('config')).toBe(false);
    expect(params.has('vesselConfig')).toBe(false);
  });

  it('round_trips_through_hydrateEventSearchConfigFromURL_onto_a_fresh_store', async () => {
    activateDataset(EEventDatasets.encountersEvent);
    useGfwEventSearchStore.getState().setSort('+start');
    useGfwEventSearchStore.getState().setLimit(35);

    syncEventSearchConfigToURL(buildEventSearchConfig());
    useGfwEventSearchStore.setState(DEFAULT_STATE, true);

    const result = await hydrateEventSearchConfigFromURL();

    expect(result).toBe('hydrated');
    const state = useGfwEventSearchStore.getState();
    expect(state.datasets[EEventDatasets.encountersEvent].active).toBe(true);
    expect(state.sort).toBe('+start');
    expect(state.limit).toBe(35);
  });

  it('returns_absent_when_no_eventConfig_param_is_present', async () => {
    expect(await hydrateEventSearchConfigFromURL()).toBe('absent');
  });

  it('returns_invalid_and_leaves_the_store_untouched_for_a_malformed_param', async () => {
    useGfwEventSearchStore.getState().setSort('untouched');
    const url = new URL(window.location.href);
    url.searchParams.set('eventConfig', '{not valid json');
    window.history.replaceState(null, '', url.toString());

    expect(await hydrateEventSearchConfigFromURL()).toBe('invalid');
    expect(useGfwEventSearchStore.getState().sort).toBe('untouched');
  });

  it('returns_invalid_for_well_formed_json_that_is_not_a_valid_IEventConfigJSON', async () => {
    const url = new URL(window.location.href);
    url.searchParams.set('eventConfig', JSON.stringify({ foo: 'bar' }));
    window.history.replaceState(null, '', url.toString());

    expect(await hydrateEventSearchConfigFromURL()).toBe('invalid');
  });
});
