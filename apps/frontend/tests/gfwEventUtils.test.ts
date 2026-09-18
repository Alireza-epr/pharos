import { TGlobalEvent } from '@packages/types';
import { EEventType } from '@packages/enum';
import {
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
