import { EVesselDataset, EVesselMatchField, EVesselSearchInclude } from '@packages/enum';
import { useVesselSearchStore } from '../src/stores/vesselSearchStore';

const DEFAULT_STATE = useVesselSearchStore.getState();

describe('getVesselSearchParams', () => {
  afterEach(() => {
    useVesselSearchStore.setState(DEFAULT_STATE, true);
  });

  it('always_sends_limit_and_the_fixed_dataset_even_with_nothing_else_set', () => {
    const params = useVesselSearchStore.getState().getVesselSearchParams();

    expect(params.limit).toBe(20);
    expect(params['datasets[0]']).toBe(EVesselDataset.vesselIdentity);
    expect(params.query).toBeUndefined();
    expect(params.where).toBeUndefined();
  });

  it('trims_and_includes_a_non_empty_query', () => {
    useVesselSearchStore.getState().setQuery('  sea hunter  ');

    const params = useVesselSearchStore.getState().getVesselSearchParams();

    expect(params.query).toBe('sea hunter');
  });

  it('omits_query_when_it_is_only_whitespace', () => {
    useVesselSearchStore.getState().setQuery('   ');

    const params = useVesselSearchStore.getState().getVesselSearchParams();

    expect(params.query).toBeUndefined();
  });

  it('trims_and_includes_a_non_empty_where_expression', () => {
    useVesselSearchStore.getState().setWhere("  flag = 'KOR'  ");

    const params = useVesselSearchStore.getState().getVesselSearchParams();

    expect(params.where).toBe("flag = 'KOR'");
  });

  it('builds_indexed_match_fields_keys_in_array_order', () => {
    useVesselSearchStore
      .getState()
      .setMatchFields([EVesselMatchField.ALL, EVesselMatchField.NO_MATCH]);

    const params = useVesselSearchStore.getState().getVesselSearchParams();

    expect(params['match-fields[0]']).toBe(EVesselMatchField.ALL);
    expect(params['match-fields[1]']).toBe(EVesselMatchField.NO_MATCH);
  });

  it('defaults_includes_to_all_three_GFW_search_include_values', () => {
    const params = useVesselSearchStore.getState().getVesselSearchParams();

    expect(params['includes[0]']).toBe(EVesselSearchInclude.OWNERSHIP);
    expect(params['includes[1]']).toBe(EVesselSearchInclude.AUTHORIZATIONS);
    expect(params['includes[2]']).toBe(EVesselSearchInclude.MATCH_CRITERIA);
  });

  it('omits_indexed_keys_entirely_for_an_empty_array_field', () => {
    // matchFields defaults to [] (no confidence filter applied).
    const params = useVesselSearchStore.getState().getVesselSearchParams();

    expect(params['match-fields[0]']).toBeUndefined();
  });

  it('reflects_a_custom_limit', () => {
    useVesselSearchStore.getState().setLimit(50);

    const params = useVesselSearchStore.getState().getVesselSearchParams();

    expect(params.limit).toBe(50);
  });

  it('clears_where_when_a_non_empty_query_is_written', () => {
    useVesselSearchStore.getState().setWhere("flag = 'KOR'");

    useVesselSearchStore.getState().setQuery('sea hunter');

    expect(useVesselSearchStore.getState().where).toBe('');
    expect(useVesselSearchStore.getState().query).toBe('sea hunter');
  });

  it('clears_query_and_match_fields_when_a_non_empty_where_is_written', () => {
    useVesselSearchStore.getState().setQuery('sea hunter');
    useVesselSearchStore.getState().setMatchFields([EVesselMatchField.ALL]);

    useVesselSearchStore.getState().setWhere("flag = 'KOR'");

    expect(useVesselSearchStore.getState().query).toBe('');
    expect(useVesselSearchStore.getState().matchFields).toEqual([]);
    expect(useVesselSearchStore.getState().where).toBe("flag = 'KOR'");
  });

  it('does_not_clear_query_when_where_is_set_back_to_empty', () => {
    useVesselSearchStore.getState().setWhere("flag = 'KOR'");
    useVesselSearchStore.getState().setQuery('sea hunter');

    useVesselSearchStore.getState().setWhere('');

    expect(useVesselSearchStore.getState().query).toBe('sea hunter');
  });
});

describe('importVesselSearchParams', () => {
  afterEach(() => {
    useVesselSearchStore.setState(DEFAULT_STATE, true);
  });

  it('parses_indexed_match_fields_and_includes_keys_back_into_arrays', () => {
    useVesselSearchStore.getState().importVesselSearchParams({
      query: '',
      where: "flag = 'KOR'",
      limit: 10,
      'match-fields[0]': EVesselMatchField.ALL,
      'match-fields[1]': EVesselMatchField.NO_MATCH,
      'includes[0]': EVesselSearchInclude.OWNERSHIP,
    });

    const state = useVesselSearchStore.getState();

    expect(state.where).toBe("flag = 'KOR'");
    expect(state.query).toBe('');
    expect(state.matchFields).toEqual([
      EVesselMatchField.ALL,
      EVesselMatchField.NO_MATCH,
    ]);
    expect(state.includes).toEqual([EVesselSearchInclude.OWNERSHIP]);
    expect(state.limit).toBe(10);
  });

  it('never_touches_the_fixed_datasets_field', () => {
    useVesselSearchStore.getState().importVesselSearchParams({
      'datasets[0]': 'something-else' as any,
    });

    expect(useVesselSearchStore.getState().datasets).toEqual([
      EVesselDataset.vesselIdentity,
    ]);
  });

  it('defaults_query_where_and_limit_when_absent_from_the_imported_params', () => {
    useVesselSearchStore.getState().setQuery('sea hunter');
    useVesselSearchStore.getState().setLimit(50);

    useVesselSearchStore.getState().importVesselSearchParams({});

    const state = useVesselSearchStore.getState();
    expect(state.query).toBe('');
    expect(state.where).toBe('');
    expect(state.limit).toBe(20);
    expect(state.matchFields).toEqual([]);
    expect(state.includes).toEqual([]);
  });

  it('round_trips_through_getVesselSearchParams', () => {
    useVesselSearchStore.getState().setQuery('sea hunter');
    useVesselSearchStore.getState().setMatchFields([EVesselMatchField.ALL]);
    useVesselSearchStore.getState().setLimit(35);
    const params = useVesselSearchStore.getState().getVesselSearchParams();

    useVesselSearchStore.setState(DEFAULT_STATE, true);
    useVesselSearchStore.getState().importVesselSearchParams(params);

    const state = useVesselSearchStore.getState();
    expect(state.query).toBe('sea hunter');
    expect(state.matchFields).toEqual([EVesselMatchField.ALL]);
    expect(state.limit).toBe(35);
  });
});
