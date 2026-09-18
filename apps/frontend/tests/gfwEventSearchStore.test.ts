import { ECountryFlag, EEventDatasets, EEventVesselType } from '@packages/enum';
import { useGfwEventSearchStore } from '../src/stores/gfwEventSearchStore';

const DEFAULT_STATE = useGfwEventSearchStore.getState();

const activateDataset = (a_Dataset: EEventDatasets) => {
  const { datasets } = useGfwEventSearchStore.getState();
  useGfwEventSearchStore.getState().setDatasets({
    ...datasets,
    [a_Dataset]: { ...datasets[a_Dataset], active: true },
  });
};

describe('getEventBodyParams', () => {
  afterEach(() => {
    useGfwEventSearchStore.setState(DEFAULT_STATE, true);
  });

  it('sends_an_empty_datasets_array_when_nothing_is_selected', () => {
    const body = useGfwEventSearchStore.getState().getEventBodyParams();

    expect(body.datasets).toEqual([]);
    expect(body.vessels).toBeUndefined();
  });

  it('builds_versioned_dataset_ids_for_active_datasets_only', () => {
    activateDataset(EEventDatasets.encountersEvent);
    activateDataset(EEventDatasets.AISOffEvent);

    const body = useGfwEventSearchStore.getState().getEventBodyParams();

    expect(body.datasets).toEqual([
      'public-global-encounters-events:v3.0',
      'public-global-gaps-events:v3.0',
    ]);
  });

  it('splits_the_comma_separated_vessels_field_into_an_array_trimmed', () => {
    useGfwEventSearchStore
      .getState()
      .setVessels(' vessel-a, vessel-b ,,vessel-c ');

    const body = useGfwEventSearchStore.getState().getEventBodyParams();

    expect(body.vessels).toEqual(['vessel-a', 'vessel-b', 'vessel-c']);
  });

  it('splits_the_comma_separated_vessel_groups_field_into_an_array_trimmed', () => {
    useGfwEventSearchStore.getState().setVesselGroups(' group-a, group-b ');

    const body = useGfwEventSearchStore.getState().getEventBodyParams();

    expect(body.vesselGroups).toEqual(['group-a', 'group-b']);
  });

  it('includes_confidences_when_set', () => {
    useGfwEventSearchStore.getState().setConfidences(['3', '4']);

    const body = useGfwEventSearchStore.getState().getEventBodyParams();

    expect(body.confidences).toEqual(['3', '4']);
  });

  it('includes_encounter_types_when_set', () => {
    useGfwEventSearchStore.getState().setEncounterTypes(['FISHING-CARRIER']);

    const body = useGfwEventSearchStore.getState().getEventBodyParams();

    expect(body.encounterTypes).toEqual(['FISHING-CARRIER']);
  });

  it('includes_vessel_types_when_set', () => {
    useGfwEventSearchStore
      .getState()
      .setVesselTypes([EEventVesselType.Carrier]);

    const body = useGfwEventSearchStore.getState().getEventBodyParams();

    expect(body.vesselTypes).toEqual([EEventVesselType.Carrier]);
  });

  it('includes_flags_when_set', () => {
    useGfwEventSearchStore.getState().setFlags([ECountryFlag.PANAMA]);

    const body = useGfwEventSearchStore.getState().getEventBodyParams();

    expect(body.flags).toEqual([ECountryFlag.PANAMA]);
  });

  it('omits_duration_when_zero', () => {
    const body = useGfwEventSearchStore.getState().getEventBodyParams();

    expect(body.duration).toBeUndefined();
  });

  it('includes_duration_when_positive', () => {
    useGfwEventSearchStore.getState().setDuration(30);

    const body = useGfwEventSearchStore.getState().getEventBodyParams();

    expect(body.duration).toBe(30);
  });

  it('reflects_a_custom_limit', () => {
    useGfwEventSearchStore.getState().setLimit(50);

    expect(useGfwEventSearchStore.getState().limit).toBe(50);
  });

  it('defaults_useReportAOI_to_false', () => {
    expect(useGfwEventSearchStore.getState().useReportAOI).toBe(false);
  });

  it('toggles_useReportAOI', () => {
    useGfwEventSearchStore.getState().setUseReportAOI(true);

    expect(useGfwEventSearchStore.getState().useReportAOI).toBe(true);
  });
});

describe('importEventSearchParams', () => {
  afterEach(() => {
    useGfwEventSearchStore.setState(DEFAULT_STATE, true);
  });

  it('parses_versioned_dataset_ids_back_into_active_flags', () => {
    useGfwEventSearchStore.getState().importEventSearchParams({
      datasets: ['public-global-encounters-events:v3.0'] as any,
    });

    const { datasets } = useGfwEventSearchStore.getState();
    expect(datasets[EEventDatasets.encountersEvent].active).toBe(true);
    expect(datasets[EEventDatasets.fishingEvent].active).toBe(false);
  });

  it('parses_vessels_and_vessel_groups_back_into_comma_joined_strings', () => {
    useGfwEventSearchStore.getState().importEventSearchParams({
      datasets: [] as any,
      vessels: ['vessel-a', 'vessel-b'],
      vesselGroups: ['group-a'],
    });

    const state = useGfwEventSearchStore.getState();
    expect(state.vessels).toBe('vessel-a, vessel-b');
    expect(state.vesselGroups).toBe('group-a');
  });

  it('defaults_fields_when_absent_from_the_imported_params', () => {
    activateDataset(EEventDatasets.encountersEvent);
    useGfwEventSearchStore.getState().setDuration(30);

    useGfwEventSearchStore.getState().importEventSearchParams({
      datasets: [] as any,
    });

    const state = useGfwEventSearchStore.getState();
    expect(state.confidences).toEqual([]);
    expect(state.duration).toBe(0);
    expect(state.datasets[EEventDatasets.encountersEvent].active).toBe(false);
  });

  it('round_trips_through_getEventBodyParams', () => {
    activateDataset(EEventDatasets.encountersEvent);
    useGfwEventSearchStore.getState().setConfidences(['3']);
    const body = useGfwEventSearchStore.getState().getEventBodyParams();

    useGfwEventSearchStore.setState(DEFAULT_STATE, true);
    useGfwEventSearchStore.getState().importEventSearchParams(body);

    const state = useGfwEventSearchStore.getState();
    expect(state.datasets[EEventDatasets.encountersEvent].active).toBe(true);
    expect(state.confidences).toEqual(['3']);
  });
});
