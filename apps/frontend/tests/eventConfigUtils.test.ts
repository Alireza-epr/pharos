import { EFetchMethods } from '@packages/enum';
import { useGfwEventSearchStore } from '../src/stores/gfwEventSearchStore';
import { useAOIStore } from '../src/stores/areaOfInterestStore';
import { useTimeRangeStore } from '../src/stores/timeRangeStore';
import {
  buildEventSearchConfig,
  importEventAOIAndTimeRange,
} from '../src/helpers/utils/eventConfigUtils';

const DEFAULT_STATE = useGfwEventSearchStore.getState();
const DEFAULT_AOI_STATE = useAOIStore.getState();
const DEFAULT_TIME_RANGE_STATE = useTimeRangeStore.getState();

describe('buildEventSearchConfig', () => {
  afterEach(() => {
    useGfwEventSearchStore.setState(DEFAULT_STATE, true);
  });

  it('always_sends_the_GFW_events_url_and_POST_method', () => {
    const config = buildEventSearchConfig();

    expect(config.url).toBe(
      'https://gateway.api.globalfishingwatch.org/v3/events',
    );
    expect(config.method).toBe(EFetchMethods.post);
  });

  it('builds_body_params_from_the_live_gfwEventSearchStore_state', () => {
    useGfwEventSearchStore.getState().setSort('+start');

    const config = buildEventSearchConfig();

    expect(config.url_params.sort).toBe('+start');
    expect(config.body_params.datasets).toEqual([]);
  });

  it('sends_a_fresh_search_at_offset_zero', () => {
    const config = buildEventSearchConfig();

    expect(config.url_params.offset).toBe(0);
  });

  it('uses_the_given_params_instead_of_the_store_when_provided', () => {
    useGfwEventSearchStore.getState().setSort('+start');

    // Same shape EventTab.tsx's Next button builds -- a paging session's
    // frozen params with `offset` merged in, deliberately independent of
    // whatever's currently live in the search form.
    const config = buildEventSearchConfig({
      url_params: { limit: 20, offset: 40, sort: '-start' },
      body_params: {
        datasets: ['public-global-encounters-events:v3.0'] as any,
      },
    });

    expect(config.url_params).toEqual({
      limit: 20,
      offset: 40,
      sort: '-start',
    });
    expect(config.body_params.datasets).toEqual([
      'public-global-encounters-events:v3.0',
    ]);
  });

  it('sends_startDate_and_endDate_as_full_UTC_timestamps_not_bare_dates', () => {
    useTimeRangeStore.getState().setDateFrom('2025-12-04T00:00:00');
    useTimeRangeStore.getState().setDateTo('2025-12-06T23:59:59');

    const config = buildEventSearchConfig();

    expect(config.body_params.startDate).toBe('2025-12-04T00:00:00Z');
    expect(config.body_params.endDate).toBe('2025-12-06T23:59:59Z');

    useTimeRangeStore.setState(DEFAULT_TIME_RANGE_STATE, true);
  });
});

describe('importEventAOIAndTimeRange', () => {
  afterEach(() => {
    useGfwEventSearchStore.setState(DEFAULT_STATE, true);
    useAOIStore.setState(DEFAULT_AOI_STATE, true);
    useTimeRangeStore.setState(DEFAULT_TIME_RANGE_STATE, true);
  });

  it('round_trips_startDate_and_endDate_through_useTimeRangeStore', async () => {
    await importEventAOIAndTimeRange({
      datasets: [],
      startDate: '2025-12-04T00:00:00Z',
      endDate: '2025-12-06T23:59:59Z',
    });

    expect(useTimeRangeStore.getState().dateFrom).toBe('2025-12-04T00:00:00');
    expect(useTimeRangeStore.getState().dateTo).toBe('2025-12-06T23:59:59');
  });

  it('checks_useReportAOI_when_the_imported_config_has_a_geometry', async () => {
    useGfwEventSearchStore.getState().setUseReportAOI(false);

    await importEventAOIAndTimeRange({
      datasets: [],
      geometry: { type: 'Polygon', coordinates: [] } as any,
    });

    expect(useGfwEventSearchStore.getState().useReportAOI).toBe(true);
  });

  it('checks_useReportAOI_when_the_imported_config_has_a_region', async () => {
    useGfwEventSearchStore.getState().setUseReportAOI(false);

    await importEventAOIAndTimeRange({
      datasets: [],
      region: { dataset: 'public-eez-areas', id: '5690' },
    });

    expect(useGfwEventSearchStore.getState().useReportAOI).toBe(true);
  });

  it('unchecks_useReportAOI_and_clears_the_AOI_when_the_imported_config_has_neither', async () => {
    useGfwEventSearchStore.getState().setUseReportAOI(true);

    await importEventAOIAndTimeRange({ datasets: [] });

    expect(useGfwEventSearchStore.getState().useReportAOI).toBe(false);
    expect(useAOIStore.getState().feature).toBeNull();
    expect(useAOIStore.getState().eezActive).toBeUndefined();
  });
});
