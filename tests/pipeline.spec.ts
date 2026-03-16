jest.mock('parquetjs', () => ({}));
import { execSync } from "child_process";
import { EGeoCoordinate, EReasonCodes, ERejectedEventSchemaReasons } from '../src/enum/generlaEnum';
import { E4wingsDatasets } from '../src/enum/gfwEnum';
import {
  createEventSchema,
} from '../src/pipeline/normalize/schema';
import {
  isMatchedCase,
  isValidCoordinate,
} from '../src/pipeline/normalize/validation'
import {
  generateScoring,
  generateEventId,
  generateRunMetadata,
  generateSources,
  generateConfidence,
  generateGeom,
} from '../src/pipeline/normalize/generation'
import { IConfigJSON, IRejectedEventSchema } from '../src/types/eventTypes';
import {
  deepSortObject,
  getEntriesFrom4wingsResponse,
  getSourceFrom4wingsResponse,
  hashString,
  getEventMissingness,
  getGeoMin,
  getGeoMax,
  getTimeRange,
  hashFile
} from '../src/utils/generalUtils';
import {
  api4wingsResponse,
  api4wingsResponse_bad_coordinates,
  apiEventResponse_no_entry,
  apiEventResponse_with_entry,
} from '../tests/fixtures/gfwResponse';
import {
  eventConfig,
  eventConfig_diff_sorted,
  sarConfig,
  sarConfig_diff_sorted,
} from './fixtures/gfwRequest';
import events from './fixtures/events.json'
import { EGeoJSONEventMissingness } from '../src/types/generalTypes';

describe('4wings helpers', () => {

  describe('generateSources', () => {
    it('returns the source keys with the version', () => {
      const expected = 'public-global-sar-presence:v3.0, public-global-port-visits-events:v3.0'
      const configSet = new Set<IConfigJSON>()

      configSet.add(sarConfig)
      configSet.add(eventConfig)
      const sources = generateSources(configSet);
      expect(sources).toBe(expected);

      configSet.clear()
      configSet.add(sarConfig_diff_sorted)
      configSet.add(eventConfig_diff_sorted)
      const sources_diff_sorted = generateSources(configSet);
      expect(sources_diff_sorted).toBe(expected);

    });
  });

  describe('generateConfidence', () => {
    it('returns confidence from the port event', () => {

      const eventNoEntries = apiEventResponse_no_entry.entries
      const confidence_fields_null = generateConfidence(eventNoEntries[0]);

      const eventWithEntries = apiEventResponse_with_entry.entries
      const confidence_fields = generateConfidence(eventWithEntries[0]);

      expect(confidence_fields_null).toBeNull()
      expect(confidence_fields).toBe(4)
      expect(generateConfidence(undefined)).toBeNull()

    });
  });

  describe('generateGeom', () => {
    const source = 'public-global-sar-presence:v3.0';
    const entries = getEntriesFrom4wingsResponse(api4wingsResponse, source);

    it('should return a GeoJSON Point', () => {
      if (!entries || !entries[0]) return

      const geom = generateGeom(entries[0]);

      expect(geom.type).toBe('Point');
      expect(Array.isArray(geom.coordinates)).toBe(true);
      expect(geom.coordinates.length).toBe(2);
      expect(typeof geom.coordinates[0]).toBe('number');
      expect(typeof geom.coordinates[1]).toBe('number');

    });

    it('should return GeoJSON coordinates in [lon, lat] order', () => {
      if (!entries || !entries[0]) return

      const lon = entries[0].lon
      const lat = entries[0].lat
      const geom = generateGeom(entries[0]);

      expect(geom.coordinates[0]).toBe(lon);
      expect(geom.coordinates[1]).toBe(lat);

    });

  });

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

  describe('isValidCoordinate', () => {

    it('should return true for valid coordinates', () => {
      expect(isValidCoordinate(0, 0)).toBe(true);
      expect(isValidCoordinate(45.5, 120.3)).toBe(true);
      expect(isValidCoordinate(-90, -180)).toBe(true);
      expect(isValidCoordinate(90, 180)).toBe(true);
    });

    it('should return false for invalid latitude', () => {
      expect(isValidCoordinate(-91, 0)).toBe(false);
      expect(isValidCoordinate(91, 0)).toBe(false);
      expect(isValidCoordinate(NaN, 0)).toBe(false);
      expect(isValidCoordinate("0", 0)).toBe(false);
    });

    it('should return false for invalid longitude', () => {
      expect(isValidCoordinate(0, -181)).toBe(false);
      expect(isValidCoordinate(0, 181)).toBe(false);
      expect(isValidCoordinate(0, NaN)).toBe(false);
      expect(isValidCoordinate(0, "0")).toBe(false);
    });

    it('should return false if both coordinates are invalid', () => {
      expect(isValidCoordinate(200, 200)).toBe(false);
      expect(isValidCoordinate(NaN, NaN)).toBe(false);
      expect(isValidCoordinate(undefined, undefined)).toBe(false);
      expect(isValidCoordinate("0", "0")).toBe(false);
    });

  });

  describe('createEventSchema', () => {

    it('should return rejected event schema for not valid coordinates', async () => {
      const configSet = new Set<IConfigJSON>()

      configSet.add(sarConfig)
      configSet.add(eventConfig)
      const source = 'public-global-sar-presence:v3.0';
      //@ts-ignore
      const entries = getEntriesFrom4wingsResponse(api4wingsResponse_bad_coordinates, source);

      if (!entries) return

      for (const entry of entries) {
        const eventSchema = await createEventSchema(configSet, entry)
        expect(eventSchema.rejected).toBe(true);
        expect((eventSchema as IRejectedEventSchema).reason).toEqual(ERejectedEventSchemaReasons.notValidCoordinates);
      }

    });

  });
});

describe('Event statistics utilities', () => {

  const validEvents = events.features as any

  const invalidEvents = [
    {
      type: "Feature",
      properties: {
        event_id: null,
        timestamp_utc: null,
        lat: null,
        lon: null,
        confidence_fields: null,
        distance_to_coast_km: null
      },
      geometry: {
        type: "Point",
        coordinates: [null, null]
      }
    },
    {
      type: "Feature",
      properties: {
        event_id: "bad1",
        timestamp_utc: "invalid-date",
        lat: 200,
        lon: -500,
        confidence_fields: null,
        distance_to_coast_km: null
      },
      geometry: {
        type: "Point",
        coordinates: [-500, 200]
      }
    }
  ] as any

  const mixedEvents = [...validEvents, ...invalidEvents]

  test('getEventMissingness calculates missing rates', () => {

    const result = getEventMissingness(mixedEvents)

    expect(result).toHaveProperty(EGeoJSONEventMissingness.event_id)
    expect(result).toHaveProperty(EGeoJSONEventMissingness.timestamp_utc)
    expect(result).toHaveProperty(EGeoJSONEventMissingness.lat)
    expect(result).toHaveProperty(EGeoJSONEventMissingness.lon)

    expect(typeof result[EGeoJSONEventMissingness.event_id]).toBe("string")
  })


  test('getGeoMin returns correct minimum latitude', () => {

    const minLat = getGeoMin(EGeoCoordinate.latitude, mixedEvents)

    expect(typeof minLat).toBe("number")
    expect(minLat).toBeLessThanOrEqual(
      getGeoMin(EGeoCoordinate.latitude, validEvents)
    )
  })


  test('getGeoMax returns correct maximum latitude', () => {

    const maxLat = getGeoMax(EGeoCoordinate.latitude, mixedEvents)

    expect(typeof maxLat).toBe("number")
    expect(maxLat).toBeGreaterThanOrEqual(
      getGeoMax(EGeoCoordinate.latitude, validEvents)
    )
  })


  test('getGeoMin returns correct minimum longitude', () => {

    const minLon = getGeoMin(EGeoCoordinate.longitude, mixedEvents)

    expect(typeof minLon).toBe("number")
    expect(minLon).toBeLessThanOrEqual(
      getGeoMin(EGeoCoordinate.longitude, validEvents)
    )
  })


  test('getGeoMax returns correct maximum longitude', () => {

    const maxLon = getGeoMax(EGeoCoordinate.longitude, mixedEvents)

    expect(typeof maxLon).toBe("number")
    expect(maxLon).toBeGreaterThanOrEqual(
      getGeoMax(EGeoCoordinate.longitude, validEvents)
    )
  })


  test('getTimeRange returns correct start and end timestamps', () => {

    const range = getTimeRange(validEvents)

    expect(range).toHaveProperty("start")
    expect(range).toHaveProperty("end")

    const start = new Date(range.start).getTime()
    const end = new Date(range.end).getTime()

    expect(start).toBeLessThanOrEqual(end)
  })


  test('getTimeRange handles invalid timestamps safely', () => {

    const range = getTimeRange(mixedEvents)

    expect(range.start).toBeDefined()
    expect(range.end).toBeDefined()

  })

})

describe("Pipeline determinism", () => {
  it("should produce identical output when run twice", async () => {
    const OUTPUT_FILE = "data/out/events.geojson";
    // run pipeline first time
    execSync("npm run pipeline:sample", { stdio: "inherit" });
    const hash1 = await hashFile(OUTPUT_FILE);

    // run pipeline second time
    execSync("npm run pipeline:sample", { stdio: "inherit" });
    const hash2 = await hashFile(OUTPUT_FILE);

    expect(hash1).toBe(hash2);

  });
});