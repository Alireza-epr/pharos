jest.mock('parquetjs', () => ({}));
import { EReasonCodes } from '../src/enum/generlaEnum';
import { E4wingsDatasets } from '../src/enum/gfwEnum';
import {
  getSourceFrom4wingsResponse,
  getEntriesFrom4wingsResponse,
  isMatchedCase,
  generateScoring,
  generateEventId,
  generateRunMetadata,
} from '../src/pipeline/normalize';
import { IConfigJSON } from '../src/types/eventTypes';
import { deepSortObject, hashString } from '../src/utils/generalUtils';
import {
  api4wingsResponse,
  apiEventResponse_no_entry,
  apiEventResponse_with_entry,
} from '../tests/fixtures/gfwResponse';
import {
  eventConfig,
  eventConfig_diff_sorted,
  sarConfig,
  sarConfig_diff_sorted,
} from './fixtures/gfwRequest';

describe('4wings helpers', () => {
  describe('getSourceFrom4wingsResponse', () => {
    it('returns the correct dataset source key', () => {
      const source = getSourceFrom4wingsResponse(
        api4wingsResponse,
        E4wingsDatasets.SARVesselDetections,
      );

      expect(source).toBe('public-global-sar-presence:v3.0');
    });
  });

  describe('getEntriesFrom4wingsResponse', () => {
    it('returns entries for a valid source', () => {
      const source = 'public-global-sar-presence:v3.0';
      const entries = getEntriesFrom4wingsResponse(api4wingsResponse, source);

      expect(entries).toBeDefined();
      expect(entries!.length).toBeGreaterThan(0);
    });

    it('returns undefined for an unknown source', () => {
      const entries = getEntriesFrom4wingsResponse(
        api4wingsResponse,
        'unknown-source' as any,
      );

      expect(entries).toBeUndefined();
    });
  });

  describe('isMatchedCase', () => {
    it('returns true when dataset is present', () => {
      if (api4wingsResponse.entries[0]) {
        const entry =
          api4wingsResponse.entries[0]['public-global-sar-presence:v3.0'];
        if (entry && entry[0] && entry[8]) {
          expect(isMatchedCase(entry[0])).toBe(true);
          expect(isMatchedCase(entry[8])).toBe(false);
        }
      }
    });

    it('returns false when dataset is empty', () => {
      if (!api4wingsResponse.entries[0]) return;
      if (!api4wingsResponse.entries[0]['public-global-sar-presence:v3.0'])
        return;
      const emptyEntry = api4wingsResponse.entries[0][
        'public-global-sar-presence:v3.0'
      ].find((e) => e.dataset === '');

      expect(isMatchedCase(emptyEntry!)).toBe(false);
    });
  });

  describe('generateScoring', () => {
    it('handles unmatched case with no event', () => {
      const scoring = generateScoring(false, undefined);

      expect(scoring.triage_score).toBe(1);
      expect(scoring.reason_codes).toContain(EReasonCodes.unmatched_detection);
      expect(scoring.uncertainty_score).toBeCloseTo(0.2);
    });

    it('adds port visit confidence as triage score', () => {
      const event = apiEventResponse_with_entry.entries[0];
      if (!event) return;
      const scoring = generateScoring(true, event);

      expect(scoring.triage_score).toBe(event.port_visit.confidence);
    });

    it('adds near coast and inside EEZ/MPA reasons', () => {
      const event = apiEventResponse_with_entry.entries[0];

      const scoring = generateScoring(true, event);

      expect(scoring.reason_codes).toEqual(
        expect.arrayContaining([
          EReasonCodes.near_coast,
          EReasonCodes.inside_eez,
          EReasonCodes.inside_mpa,
        ]),
      );
    });

    it('adds low detection confidence when threshold is met', () => {
      if (!apiEventResponse_with_entry.entries[0]) return;
      const event = {
        ...apiEventResponse_with_entry.entries[0],
        port_visit: {
          ...apiEventResponse_with_entry.entries[0].port_visit,
          confidence: 1,
        },
      };
      if (event) return;
      const scoring = generateScoring(true, event);

      expect(scoring.reason_codes).toContain(
        EReasonCodes.low_detection_confidence,
      );
    });
  });

  describe('generateEventId', () => {
    it('generates a deterministic SHA-256 hash from canonical input', async () => {
      const timestamp = '2025-12-04T16:53:26Z';
      const lon = 14.2;
      const lat = 55.1;
      const source = 'test-source';

      const id1 = await generateEventId(timestamp, lon, lat, source);
      const id2 = await generateEventId(timestamp, lon, lat, source);

      // Deterministic
      expect(id1).toBe(id2);

      // Valid SHA-256 hex string
      expect(id1).toMatch(/^[a-f0-9]{64}$/);
    });

    it('changes hash when any input value changes', async () => {
      const base = await generateEventId(
        '2025-12-04T16:53:26Z',
        14.2,
        55.1,
        'test-source',
      );

      const changed = await generateEventId(
        '2025-12-04T16:53:27Z', // timestamp changed
        14.2,
        55.1,
        'test-source',
      );

      expect(base).not.toBe(changed);
    });

    it('matches the expected hash for known canonical input', async () => {
      const canonical = JSON.stringify({
        timestamp: '2025-12-04T16:53:26Z',
        lon: 14.2,
        lat: 55.1,
        source: 'test-source',
      });

      const expected = await hashString(canonical);
      const result = await generateEventId(
        '2025-12-04T16:53:26Z',
        14.2,
        55.1,
        'test-source',
      );

      expect(result).toBe(expected);
    });
  });

  describe('generateRunMetadata', () => {
    it('generates deterministic metadata for a set of configs', async () => {
      const configSet = new Set<IConfigJSON>([sarConfig, eventConfig]);

      const metadata = await generateRunMetadata(configSet);

      expect(metadata).toEqual(
        expect.objectContaining({
          code_version: 'N/A',
          config_json: deepSortObject(Array.from(configSet)),
          config_hash: expect.any(String),
        }),
      );
    });

    it('produces the same config_hash regardless of Set order', async () => {
      const setA = new Set<IConfigJSON>([sarConfig, eventConfig]);
      const setB = new Set<IConfigJSON>([
        sarConfig_diff_sorted,
        eventConfig_diff_sorted,
      ]);

      const metaA = await generateRunMetadata(setA);
      const metaB = await generateRunMetadata(setB);

      expect(metaA.config_hash).toBe(metaB.config_hash);
    });

    it('changes config_hash when config content changes', async () => {
      const modifiedSarConfig = {
        ...sarConfig,
        url_params: {
          ...sarConfig.url_params,
          'spatial-resolution': 'LOW',
        },
      } as IConfigJSON;

      const original = new Set<IConfigJSON>([sarConfig, eventConfig]);
      const modified = new Set<IConfigJSON>([modifiedSarConfig, eventConfig]);

      const metaOriginal = await generateRunMetadata(original);
      const metaModified = await generateRunMetadata(modified);

      expect(metaOriginal.config_hash).not.toBe(metaModified.config_hash);
    });
  });
});
