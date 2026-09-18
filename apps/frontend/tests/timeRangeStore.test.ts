import { useTimeRangeStore } from '../src/stores/timeRangeStore';

const DEFAULT_STATE = useTimeRangeStore.getState();

describe('setDateFrom_and_setDateTo', () => {
  afterEach(() => {
    useTimeRangeStore.setState(DEFAULT_STATE, true);
  });

  // Regression: native <input type="datetime-local"> commonly reports its
  // value without seconds once a user actually edits it via the picker
  // widget (confirmed live -- this exact shape caused the Report tab's
  // query to be rejected with a 422, "date-range ... not valid", since
  // getTimeRange() blindly appended 'Z' assuming HH:mm:ss precision).
  it('pads_a_seconds_less_value_with_00_seconds', () => {
    useTimeRangeStore.getState().setDateFrom('2025-12-01T00:00');
    useTimeRangeStore.getState().setDateTo('2025-12-06T23:59');

    expect(useTimeRangeStore.getState().dateFrom).toBe('2025-12-01T00:00:00');
    expect(useTimeRangeStore.getState().dateTo).toBe('2025-12-06T23:59:00');
  });

  it('leaves_a_value_that_already_has_seconds_untouched', () => {
    useTimeRangeStore.getState().setDateFrom('2025-12-01T00:00:17');

    expect(useTimeRangeStore.getState().dateFrom).toBe('2025-12-01T00:00:17');
  });

  it('supports_the_updater_function_form', () => {
    useTimeRangeStore.getState().setDateFrom('2025-12-01T00:00');
    useTimeRangeStore
      .getState()
      .setDateFrom((prev) => prev.replace('2025', '2026'));

    expect(useTimeRangeStore.getState().dateFrom).toBe('2026-12-01T00:00:00');
  });
});

describe('getTimeRange', () => {
  afterEach(() => {
    useTimeRangeStore.setState(DEFAULT_STATE, true);
  });

  it('always_produces_a_date_range_with_seconds_even_after_a_seconds_less_edit', () => {
    useTimeRangeStore.getState().setDateFrom('2025-12-01T00:00');
    useTimeRangeStore.getState().setDateTo('2025-12-06T23:59');

    const { 'date-range': dateRange } = useTimeRangeStore
      .getState()
      .getTimeRange();

    expect(dateRange).toBe('2025-12-01T00:00:00Z,2025-12-06T23:59:00Z');
  });
});

describe('importTimeRange', () => {
  afterEach(() => {
    useTimeRangeStore.setState(DEFAULT_STATE, true);
  });

  it('round_trips_through_getTimeRange', () => {
    useTimeRangeStore.getState().setDateFrom('2025-12-01T00:00:00');
    useTimeRangeStore.getState().setDateTo('2025-12-06T23:59:59');
    const query = useTimeRangeStore.getState().getTimeRange();

    useTimeRangeStore.setState(DEFAULT_STATE, true);
    useTimeRangeStore.getState().importTimeRange(query);

    expect(useTimeRangeStore.getState().dateFrom).toBe('2025-12-01T00:00:00');
    expect(useTimeRangeStore.getState().dateTo).toBe('2025-12-06T23:59:59');
  });

  it('normalizes_a_hand_edited_seconds_less_import', () => {
    useTimeRangeStore
      .getState()
      .importTimeRange({ 'date-range': '2025-12-01T00:00Z,2025-12-06T23:59Z' });

    expect(useTimeRangeStore.getState().dateFrom).toBe('2025-12-01T00:00:00');
    expect(useTimeRangeStore.getState().dateTo).toBe('2025-12-06T23:59:00');
  });
});
