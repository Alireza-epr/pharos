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
});
