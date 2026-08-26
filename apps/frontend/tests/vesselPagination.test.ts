import { IVesselIdentity } from '@packages/types';
import {
  getVesselPaginationState,
  isVesselSearchReady,
  MIN_VESSEL_QUERY_LENGTH,
} from '../src/helpers/utils/vesselUtils';

const page = (count: number): IVesselIdentity[] =>
  Array.from({ length: count }, () => ({
    dataset: 'public-global-vessel-identity:v4.0',
  }));

describe('isVesselSearchReady', () => {
  it('is_ready_when_query_meets_the_minimum_length', () => {
    expect(isVesselSearchReady('sea', '')).toBe(true);
    expect('sea'.length).toBe(MIN_VESSEL_QUERY_LENGTH);
  });

  it('is_not_ready_when_query_is_shorter_than_the_minimum_and_where_is_empty', () => {
    expect(isVesselSearchReady('se', '')).toBe(false);
  });

  it('is_ready_with_only_a_where_expression_regardless_of_query_length', () => {
    expect(isVesselSearchReady('', "flag = 'KOR'")).toBe(true);
  });

  it('trims_whitespace_before_measuring_query_length', () => {
    expect(isVesselSearchReady('  se  ', '')).toBe(false);
    expect(isVesselSearchReady('  sea  ', '')).toBe(true);
  });

  it('trims_whitespace_before_checking_where_is_non_empty', () => {
    expect(isVesselSearchReady('', '   ')).toBe(false);
  });

  it('is_not_ready_when_both_query_and_where_are_empty', () => {
    expect(isVesselSearchReady('', '')).toBe(false);
  });
});

describe('getVesselPaginationState', () => {
  it('has_neither_prev_nor_next_before_any_search_has_run', () => {
    const state = getVesselPaginationState([], 0, null, null);

    expect(state.hasPrev).toBe(false);
    expect(state.hasNext).toBe(false);
    expect(state.fetchedCount).toBe(0);
  });

  it('has_no_prev_on_the_first_page', () => {
    const state = getVesselPaginationState([page(2)], 0, 'cursor', 2);

    expect(state.hasPrev).toBe(false);
  });

  it('has_prev_once_a_second_page_has_been_visited', () => {
    const state = getVesselPaginationState([page(2), page(2)], 1, 'cursor', 4);

    expect(state.hasPrev).toBe(true);
  });

  it('has_next_from_cache_without_needing_since_or_total', () => {
    // Already fetched page 2 earlier this session -- stepping back to page 1
    // and then forward again must not depend on since/total at all.
    const state = getVesselPaginationState([page(2), page(2)], 0, null, null);

    expect(state.hasCachedNext).toBe(true);
    expect(state.hasNext).toBe(true);
  });

  it('has_no_next_when_every_vessel_matching_the_query_has_already_been_fetched', () => {
    // total: 2, and the one cached page already has both.
    const state = getVesselPaginationState([page(2)], 0, 'cursor', 2);

    expect(state.hasMoreOnServer).toBe(false);
    expect(state.hasNext).toBe(false);
  });

  it('has_next_when_fewer_vessels_are_cached_than_total_and_a_cursor_exists', () => {
    const state = getVesselPaginationState([page(2)], 0, 'cursor', 374);

    expect(state.hasMoreOnServer).toBe(true);
    expect(state.hasNext).toBe(true);
  });

  it('has_no_next_without_a_since_cursor_even_if_total_implies_more_exist', () => {
    // Defensive: GFW always returns *some* since in practice, but the
    // absence of one must not be treated as "infinite next".
    const state = getVesselPaginationState([page(2)], 0, null, 374);

    expect(state.hasMoreOnServer).toBe(false);
    expect(state.hasNext).toBe(false);
  });

  it('sums_fetchedCount_across_every_cached_page', () => {
    const state = getVesselPaginationState(
      [page(20), page(20), page(5)],
      2,
      'cursor',
      45,
    );

    expect(state.fetchedCount).toBe(45);
    expect(state.hasMoreOnServer).toBe(false);
  });
});
