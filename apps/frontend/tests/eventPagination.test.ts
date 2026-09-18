import { TGlobalEvent } from '@packages/types';
import { EEventDatasets, EEventType } from '@packages/enum';
import {
  getEventPaginationState,
  getNextOffset,
  isEventSearchReady,
} from '../src/helpers/utils/gfwEventUtils';

const page = (count: number): TGlobalEvent[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `event-${i}`,
    type: EEventType.encounter,
    start: '2026-01-01T00:00:00Z',
    end: '2026-01-01T01:00:00Z',
    position: { lat: 0, lon: 0 },
    regions: {
      mpa: [],
      eez: [],
      rfmo: [],
      fao: [],
      majorFao: [],
      eez12Nm: [],
      highSeas: [],
      mpaNoTakePartial: [],
      mpaNoTake: [],
    },
    boundingBox: [],
    distances: {
      startDistanceFromShoreKm: 0,
      endDistanceFromShoreKm: 0,
      startDistanceFromPortKm: 0,
      endDistanceFromPortKm: 0,
    },
    vessel: { id: 'v', name: 'V', ssvid: '1' },
    encounter: {
      vessel: {
        id: 'v2',
        flag: 'ESP',
        name: 'V2',
        type: 'carrier',
        ssvid: '2',
      },
      medianDistanceKilometers: 1,
      medianSpeedKnots: 1,
      type: 'FISHING-CARRIER',
      potentialRisk: false,
    },
  })) as unknown as TGlobalEvent[];

const emptyDatasets = () =>
  Object.fromEntries(
    Object.values(EEventDatasets).map((ds) => [
      ds,
      { active: false, version: 'v3.0' as const },
    ]),
  ) as Record<EEventDatasets, { active: boolean; version: 'v3.0' }>;

describe('isEventSearchReady', () => {
  it('is_ready_with_at_least_one_dataset_selected', () => {
    const datasets = emptyDatasets();
    datasets[EEventDatasets.encountersEvent].active = true;
    expect(isEventSearchReady(datasets)).toBe(true);
  });

  it('is_not_ready_with_no_datasets_selected', () => {
    expect(isEventSearchReady(emptyDatasets())).toBe(false);
  });
});

describe('getEventPaginationState', () => {
  it('has_neither_prev_nor_next_before_any_search_has_run', () => {
    const state = getEventPaginationState([], 0, null);

    expect(state.hasPrev).toBe(false);
    expect(state.hasNext).toBe(false);
    expect(state.fetchedCount).toBe(0);
  });

  it('has_no_prev_on_the_first_page', () => {
    const state = getEventPaginationState([page(2)], 0, 2);

    expect(state.hasPrev).toBe(false);
  });

  it('has_prev_once_a_second_page_has_been_visited', () => {
    const state = getEventPaginationState([page(2), page(2)], 1, 4);

    expect(state.hasPrev).toBe(true);
  });

  it('has_next_from_cache_without_needing_total', () => {
    const state = getEventPaginationState([page(2), page(2)], 0, null);

    expect(state.hasCachedNext).toBe(true);
    expect(state.hasNext).toBe(true);
  });

  it('has_no_next_when_every_event_matching_the_query_has_already_been_fetched', () => {
    const state = getEventPaginationState([page(2)], 0, 2);

    expect(state.hasMoreOnServer).toBe(false);
    expect(state.hasNext).toBe(false);
  });

  it('has_next_when_fewer_events_are_cached_than_total', () => {
    const state = getEventPaginationState([page(2)], 0, 374);

    expect(state.hasMoreOnServer).toBe(true);
    expect(state.hasNext).toBe(true);
  });

  it('sums_fetchedCount_across_every_cached_page', () => {
    const state = getEventPaginationState([page(20), page(20), page(5)], 2, 45);

    expect(state.fetchedCount).toBe(45);
    expect(state.hasMoreOnServer).toBe(false);
  });
});

describe('getNextOffset', () => {
  it('is_zero_before_any_page_has_been_fetched', () => {
    expect(getNextOffset([])).toBe(0);
  });

  it('sums_every_cached_pages_length_not_a_fixed_limit', () => {
    // A short/partial last page (e.g. the final page of results) must still
    // advance the offset by its actual length, not by `limit`.
    expect(getNextOffset([page(20), page(7)])).toBe(27);
  });
});
