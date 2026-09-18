import { TGlobalEvent } from '@packages/types';
import { EEventDatasets, EEventType } from '@packages/enum';
import {
  buildAllDatasetsActive,
  getAllEventDatasetSources,
  getEventDateRangeLabel,
  getEventDisplayFields,
  getEventKey,
} from '../src/helpers/utils/gfwEventUtils';

const baseFields = {
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
};

const gapEvent = {
  id: 'gap-event-1',
  type: EEventType.gap,
  ...baseFields,
  vessel: { id: 'v1', name: 'DARK HORIZON', ssvid: '123456789', flag: 'PAN' },
  gap: {
    intentionalDisabling: true,
    distanceKm: '10',
    impliedSpeedKnots: '5',
  },
} as unknown as TGlobalEvent;

const noVesselEvent = {
  id: 'loitering-event-1',
  type: EEventType.loitering,
  ...baseFields,
  vessel: { id: 'v2', name: undefined, ssvid: '000000000' },
  loitering: {
    totalTimeHours: 4,
    totalDistanceKm: 1,
    averageSpeedKnots: 0.5,
    averageDistanceFromShoreKm: 12,
  },
} as unknown as TGlobalEvent;

describe('getEventDisplayFields', () => {
  it('reads_vessel_name_and_flag_from_the_common_IBaseEvent_vessel_field', () => {
    const fields = getEventDisplayFields(gapEvent);

    expect(fields.vesselName).toBe('DARK HORIZON');
    expect(fields.flag).toBe('PAN');
    expect(fields.type).toBe(EEventType.gap);
    expect(fields.start).toBe('2026-01-01T00:00:00Z');
    expect(fields.end).toBe('2026-01-01T01:00:00Z');
  });

  it('returns_undefined_vessel_name_when_the_vessel_has_none', () => {
    const fields = getEventDisplayFields(noVesselEvent);

    expect(fields.vesselName).toBeUndefined();
    expect(fields.type).toBe(EEventType.loitering);
  });
});

describe('getEventKey', () => {
  it('returns_the_events_own_id_directly', () => {
    expect(getEventKey(gapEvent)).toBe('gap-event-1');
  });

  it('gives_two_different_events_distinct_keys', () => {
    expect(getEventKey(gapEvent)).not.toBe(getEventKey(noVesselEvent));
  });
});

describe('getAllEventDatasetSources', () => {
  it('returns_one_versioned_source_per_EEventDatasets_value', () => {
    const sources = getAllEventDatasetSources();

    expect(sources).toHaveLength(Object.values(EEventDatasets).length);
    Object.values(EEventDatasets).forEach((ds) => {
      expect(sources).toContain(`${ds}:v3.0`);
    });
  });
});

describe('buildAllDatasetsActive', () => {
  it('marks_every_dataset_active_at_the_same_version_getAllEventDatasetSources_uses', () => {
    const datasets = buildAllDatasetsActive();

    Object.values(EEventDatasets).forEach((ds) => {
      expect(datasets[ds]).toEqual({ active: true, version: 'v3.0' });
    });
  });
});

describe('getEventDateRangeLabel', () => {
  it('joins_the_date_only_portion_of_start_and_end_with_a_dash', () => {
    expect(
      getEventDateRangeLabel('2026-01-04T00:00:00Z', '2026-01-06T23:59:59Z'),
    ).toBe('2026-01-04 - 2026-01-06');
  });

  it('drops_the_time_of_day_entirely', () => {
    const label = getEventDateRangeLabel(
      '2026-01-04T14:30:00Z',
      '2026-01-04T18:45:00Z',
    );

    expect(label).not.toContain(':');
  });

  it('collapses_to_a_single_date_when_start_and_end_are_the_same_day', () => {
    expect(
      getEventDateRangeLabel('2026-01-04T02:00:00Z', '2026-01-04T04:00:00Z'),
    ).toBe('2026-01-04');
  });

  it('falls_back_to_whichever_of_start_or_end_is_present', () => {
    expect(getEventDateRangeLabel('2026-01-04T00:00:00Z', undefined)).toBe(
      '2026-01-04',
    );
    expect(getEventDateRangeLabel(undefined, '2026-01-06T00:00:00Z')).toBe(
      '2026-01-06',
    );
  });

  it('returns_undefined_when_neither_is_present', () => {
    expect(getEventDateRangeLabel(undefined, undefined)).toBeUndefined();
  });
});
