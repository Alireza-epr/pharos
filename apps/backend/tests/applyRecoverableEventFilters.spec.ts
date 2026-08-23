import { ECountryFlag, EGearType, EVessleType } from '@packages/enum';
import { applyRecoverableEventFilters } from '../src/pipeline/normalize/filter';
import events from './fixtures/canonicalSchema.json';

/**
 * Fixture shape (canonicalSchema.json, 18 events):
 * - 17 events have `matched_flag: true` with a populated `raw_metadata`
 *   (flag/geartype/vesselType/vesselId).
 * - 1 event (`8295ccc8a648afef...`, index 12) has `matched_flag: false` and an
 *   empty `raw_metadata` (the unmatched case carries no vessel identity).
 */

const ids = (result: typeof events) => result.map((e) => e.event_id);

const UNMATCHED_EVENT_ID =
  '8295ccc8a648afefb4588b3127cc520c62001bcaa875d5735b47b758ce6a95bd';

describe('applyRecoverableEventFilters', () => {
  it('returns_all_events_when_no_filter_is_provided', () => {
    const result = applyRecoverableEventFilters(events as any, {});
    expect(result).toHaveLength(events.length);
  });

  describe('matched', () => {
    it('keeps_only_the_unmatched_event_when_matched_is_false', () => {
      const result = applyRecoverableEventFilters(events as any, {
        matched: false,
      });

      expect(ids(result as any)).toEqual([UNMATCHED_EVENT_ID]);
    });

    it('excludes_the_unmatched_event_when_matched_is_true', () => {
      const result = applyRecoverableEventFilters(events as any, {
        matched: true,
      });

      expect(result).toHaveLength(events.length - 1);
      expect(ids(result as any)).not.toContain(UNMATCHED_EVENT_ID);
    });
  });

  describe('flag', () => {
    it('keeps_only_events_whose_raw_metadata_flag_is_in_the_list', () => {
      const result = applyRecoverableEventFilters(events as any, {
        flag: [ECountryFlag.DENMARK],
      });

      result.forEach((e) => {
        expect(e.raw_metadata?.flag).toBe('DNK');
      });
      expect(result.length).toBeGreaterThan(0);
    });

    it('excludes_the_unmatched_event_since_it_has_no_flag', () => {
      const result = applyRecoverableEventFilters(events as any, {
        flag: [ECountryFlag.DENMARK],
      });

      expect(ids(result as any)).not.toContain(UNMATCHED_EVENT_ID);
    });

    it('is_OR_logic_across_multiple_flags', () => {
      const result = applyRecoverableEventFilters(events as any, {
        flag: [ECountryFlag.DENMARK, ECountryFlag.CYPRUS],
      });

      result.forEach((e) => {
        expect(['DNK', 'CYP']).toContain(e.raw_metadata?.flag);
      });
      const expected = events.filter((e) =>
        ['DNK', 'CYP'].includes(e.raw_metadata?.flag as string),
      );
      expect(result).toHaveLength(expected.length);
    });
  });

  describe('vessel_type', () => {
    it('keeps_only_events_of_the_requested_vessel_type', () => {
      const result = applyRecoverableEventFilters(events as any, {
        vessel_type: [EVessleType.Passenger],
      });

      expect(result).toHaveLength(1);
      expect(result[0].raw_metadata?.vesselType).toBe('PASSENGER');
    });
  });

  describe('geartype', () => {
    it('keeps_only_events_of_the_requested_geartype', () => {
      // The fixture's `raw_metadata.geartype` values ('CARGO', 'OTHER', ...)
      // are vessel-type-shaped, not real EGearType members — this SAR sample
      // has no genuine gear type. Cast rather than pretend it's a member.
      const result = applyRecoverableEventFilters(events as any, {
        geartype: ['CARGO' as EGearType],
      });

      result.forEach((e) => {
        expect(e.raw_metadata?.geartype).toBe('CARGO');
      });
      const expected = events.filter((e) => e.raw_metadata?.geartype === 'CARGO');
      expect(result).toHaveLength(expected.length);
    });
  });

  describe('vessel_id', () => {
    it('keeps_only_the_event_with_the_requested_vessel_id', () => {
      const target = (events as any[]).find(
        (e) => e.event_id !== UNMATCHED_EVENT_ID,
      );
      const result = applyRecoverableEventFilters(events as any, {
        vessel_id: [target.raw_metadata.vesselId],
      });

      expect(result).toHaveLength(1);
      expect(result[0].event_id).toBe(target.event_id);
    });

    it('returns_an_empty_array_for_an_unknown_vessel_id', () => {
      const result = applyRecoverableEventFilters(events as any, {
        vessel_id: ['does-not-exist'],
      });

      expect(result).toHaveLength(0);
    });
  });

  describe('combined_predicates', () => {
    it('applies_matched_and_flag_together_as_AND_logic', () => {
      const result = applyRecoverableEventFilters(events as any, {
        matched: true,
        flag: [ECountryFlag.DENMARK],
      });

      result.forEach((e) => {
        expect(e.matched_flag).toBe(true);
        expect(e.raw_metadata?.flag).toBe('DNK');
      });
      expect(result.length).toBeGreaterThan(0);
      expect(ids(result as any)).not.toContain(UNMATCHED_EVENT_ID);
    });
  });
});
