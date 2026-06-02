import { execSync } from 'child_process';
import {
  EGeoCoordinate,
  EReasonCodesStatic,
  ERejectedEventSchemaReasons,
  E4wingsDatasets,
  EConfidenceTiers,
  EHotspotStrength,
  EGeoJSONGeometryType,
} from '@packages/enum';
import { createEventSchema } from '../src/pipeline/schema/main';
import {
  isMatchedCase,
  isValidCoordinate,
} from '../src/pipeline/normalize/validation';
import {
  generateScoring,
  generateEventId,
  generateRunMetadata,
  generateSources,
  generateConfidence,
  generateGeom,
  generateConfidence_heuristic,
} from '../src/pipeline/normalize/generation';
import {
  EVENT_MISSINGNESS_KEYS,
  IConfigJSON,
  IEventSchema,
  IRejectedEventSchema,
} from '@packages/types';
import { deepSortObject } from '@packages/utils';
import {
  getEntriesFrom4wingsResponse,
  getSourceFrom4wingsResponse,
  hashString,
  hashFile,
  sortEventSchema,
  getSortValue,
} from '../src/helpers/utils/backendUtils';
import {
  api4wingsEntry_ais,
  api4wingsEntry_ais_2,
  api4wingsEntry_ais_5,
  api4wingsEntry_fishing,
  api4wingsEntry_fishing_2,
  api4wingsEntry_fishing_5,
  api4wingsEntry_matched,
  api4wingsEntry_matched_detections_2,
  api4wingsEntry_matched_detections_5,
  api4wingsEntry_noisy_high_detections,
  api4wingsEntry_unmatched,
  api4wingsEntry_unmatched_detections_2,
  api4wingsEntry_unmatched_detections_5,
  api4wingsResponse,
  api4wingsResponse_bad_coordinates,
  api4wingsResponse_bad_date,
  api4wingsResponse_bad_multi,
  api4wingsResponse_bad_vessel_type,
  api4wingsResponse_mixed_accepted_rejected,
  api4wingsResponse_multi_dataset,
  apiEventResponse_no_entry,
  apiEventResponse_with_entry,
} from '../tests/fixtures/gfwResponse';
import {
  aisConfig,
  eventConfig,
  eventConfig_diff_sorted,
  fishingConfig,
  multiDatasetConfig,
  sarConfig,
  sarConfig_diff_sorted,
} from './fixtures/gfwRequest';
import events from './fixtures/events.json';
import canonicalSchema_base from './fixtures/canonicalSchema_base.json';
import hotspots_import from './fixtures/hotspots.json';
import canonicalSchema from './fixtures/canonicalSchema.json';
import {
  enrichEventsWithHotspots,
  generateHotspots,
  generateHotspotStrength,
} from '../src/pipeline/aggregate/hotspots';
import {
  createValidationSample,
  isOnLand,
} from '../src/pipeline/validation/main';
import { EValidationLabel } from '../src/helpers/types/validationTypes';
import { readLandPolygons } from '../src/helpers/utils/datasetUtils';
import {
  eventSchema_ais_offshore,
  eventSchema_context_layers,
  eventSchema_fishing_offshore,
  eventSchema_inWater,
  eventSchema_matched_near_coast,
  eventSchema_matched_no_coord,
  eventSchema_matched_no_date,
  eventSchema_matched_noisy,
  eventSchema_matched_offshore,
  eventSchema_onLand,
  eventSchema_umatched_near_coast,
  eventSchema_umatched_offshore,
  eventSchema_with_low_confidence,
  eventSchemas_not_sorted,
} from './fixtures/eventSchema';
import { vesselZone } from '../src/pipeline/features/bathymetry';
import {
  mockEEZContext,
  mockMPAContext,
  mockBathymetryContext,
} from './setup/jest.mocks';
import {
  hotspot_high_strength_eligible_for_high,
  hotspot_low_strength,
  hotspot_medium_strength,
  hotspot_medium_strength_eligible_for_high,
  hotspot_penilized_uncertainty,
  hotspot_penilized_uncertainty_heavy,
} from './fixtures/hotspots';
import {
  getEventMissingness,
  getGeoMax,
  getGeoMin,
  getTimeRange,
} from '../src/pipeline/aggregate/stats';

describe('generateSources', () => {
  it('returns_the_source_keys_with_the_version_for_matched_case', () => {
    const expected = api4wingsEntry_matched.dataset;
    const sources = generateSources(sarConfig, api4wingsEntry_matched);
    expect(sources).toBe(expected);
  });

  it('returns_the_requested_SAR_dataset_for_unmatched_case', () => {
    const expected = (sarConfig as IConfigJSON).url_params['datasets[0]'];
    const sources = generateSources(sarConfig, api4wingsEntry_unmatched);
    expect(sources).toBe(expected);
  });

  it('returns_the_source_keys_with_the_version_for_fishing_dataset', () => {
    const expected = api4wingsEntry_fishing.dataset;
    const sources = generateSources(multiDatasetConfig, api4wingsEntry_fishing);
    expect(sources).toBe(expected);
  });

  it('returns_the_source_keys_with_the_version_for_AIS_dataset', () => {
    const expected = api4wingsEntry_ais.dataset;
    const sources = generateSources(multiDatasetConfig, api4wingsEntry_ais);
    expect(sources).toBe(expected);
  });
});

describe('getEntriesFrom4wingsResponse', () => {
  it('returns_entries_for_valid_sources', () => {
    const entriesMap = getEntriesFrom4wingsResponse(
      multiDatasetConfig,
      api4wingsResponse_multi_dataset,
    );
    const entries = Array.from(entriesMap).flatMap(
      ([source, entries]) => entries,
    );
    expect(entries).toBeDefined();
    expect(entries!.length).toBeGreaterThan(0);
  });

  it('returns_empty_map_for_an_unknown_source', () => {
    const entries = getEntriesFrom4wingsResponse(
      {
        ...sarConfig,
        url_params: {
          ...sarConfig.url_params,
          'datasets[0]': 'unknown-source',
        },
      },
      api4wingsResponse_multi_dataset,
    );

    expect(entries.size).toBe(0);
  });

  it('returns_entries_only_for_requested_source', () => {
    const entries = getEntriesFrom4wingsResponse(
      sarConfig,
      api4wingsResponse_multi_dataset,
    );

    expect(entries.size).toBe(1);
    expect(entries.has('public-global-sar-presence:v3.0')).toBeTruthy();
  });
});

describe('generateConfidence', () => {
  it('returns_confidence_from_the_port_event', () => {
    const eventNoEntries = apiEventResponse_no_entry.entries;
    const confidence_proxy_null = generateConfidence(eventNoEntries[0]);

    const eventWithEntries = apiEventResponse_with_entry.entries;
    const confidence_proxy = generateConfidence(eventWithEntries[0]);

    expect(confidence_proxy_null).toBeNull();
    expect(confidence_proxy).toBe(4);
    expect(generateConfidence(null)).toBeNull();
  });
});

describe('generateConfidence_heuristic', () => {
  it('returns_confidence_from_the_detection', () => {
    const result = generateConfidence_heuristic(
      api4wingsEntry_matched_detections_2,
    );
    expect(result).toBe(EConfidenceTiers.medium);
    const result2 = generateConfidence_heuristic(
      api4wingsEntry_unmatched_detections_2,
    );
    expect(result2).toBe(EConfidenceTiers.medium);

    const result3 = generateConfidence_heuristic(
      api4wingsEntry_matched_detections_5,
    );
    expect(result3).toBe(EConfidenceTiers.high);
    const result4 = generateConfidence_heuristic(
      api4wingsEntry_unmatched_detections_5,
    );
    expect(result4).toBe(EConfidenceTiers.high);

    const result5 = generateConfidence_heuristic(
      api4wingsEntry_noisy_high_detections,
    );
    expect(result5).toBe(EConfidenceTiers.low);
    const result6 = generateConfidence_heuristic(api4wingsEntry_matched);
    expect(result6).toBe(EConfidenceTiers.low);
    const result7 = generateConfidence_heuristic(api4wingsEntry_unmatched);
    expect(result7).toBe(EConfidenceTiers.low);
  });
  it('returns_confidence_from_the_hours', () => {
    const result = generateConfidence_heuristic(api4wingsEntry_ais_2);
    expect(result).toBe(EConfidenceTiers.medium);
    const result2 = generateConfidence_heuristic(api4wingsEntry_fishing_2);
    expect(result2).toBe(EConfidenceTiers.medium);

    const result3 = generateConfidence_heuristic(api4wingsEntry_ais_5);
    expect(result3).toBe(EConfidenceTiers.high);
    const result4 = generateConfidence_heuristic(api4wingsEntry_fishing_5);
    expect(result4).toBe(EConfidenceTiers.high);
  });
});

describe('generateGeom', () => {
  const entriesMap = getEntriesFrom4wingsResponse(sarConfig, api4wingsResponse);
  const entries = Array.from(entriesMap).flatMap(
    ([source, entries]) => entries,
  );

  it('should_return_a_GeoJSON_Point', () => {
    if (!entries || !entries[0]) return;

    const geom = generateGeom(entries[0].lon, entries[0].lat);

    expect(geom.type).toBe('Point');
    expect(Array.isArray(geom.coordinates)).toBe(true);
    expect(geom.coordinates.length).toBe(2);
    expect(typeof geom.coordinates[0]).toBe('number');
    expect(typeof geom.coordinates[1]).toBe('number');
  });

  it('should_return_GeoJSON_coordinates_in_lonlat_order', () => {
    if (!entries || !entries[0]) return;

    const lon = entries[0].lon;
    const lat = entries[0].lat;
    const geom = generateGeom(entries[0].lon, entries[0].lat);

    expect(geom.coordinates[0]).toBe(lon);
    expect(geom.coordinates[1]).toBe(lat);
  });
});

describe('getSourceFrom4wingsResponse', () => {
  it('returns_the_correct_dataset_source_key', () => {
    const source = getSourceFrom4wingsResponse(
      api4wingsResponse,
      E4wingsDatasets.SARVesselDetections,
    );

    expect(source).toBe('public-global-sar-presence:v3.0');
  });
});

describe('isMatchedCase', () => {
  it('returns_true_when_dataset_is_present_and_detections_is_available', () => {
    expect(isMatchedCase(api4wingsEntry_matched)).toBe(true);
    expect(isMatchedCase(api4wingsEntry_matched_detections_2)).toBe(true);
  });

  it('returns_false_when_dataset_is_empty_and_detections_is_available', () => {
    expect(isMatchedCase(api4wingsEntry_unmatched)).toBe(false);
    expect(isMatchedCase(api4wingsEntry_unmatched_detections_2)).toBe(false);
  });

  it('returns_undefined_when_detections_is_not_available', () => {
    expect(isMatchedCase(api4wingsEntry_fishing)).toBeUndefined();
    expect(isMatchedCase(api4wingsEntry_ais)).toBeUndefined();
  });
});

describe('generateScoring', () => {
  it('returns_valid_triage_score_between_0_and_1', () => {
    const scoring = generateScoring(eventSchema_umatched_near_coast, sarConfig);

    expect(scoring.triage_score).toBeGreaterThanOrEqual(0);
    expect(scoring.triage_score).toBeLessThanOrEqual(1);
  });

  it('match_state_logic_produces_correct_match_reason_code', () => {
    const scoring = generateScoring(eventSchema_matched_near_coast, sarConfig);
    expect(scoring.reason_codes).toContain(
      EReasonCodesStatic.matched_to_public_ais,
    );
    expect(scoring.reason_codes).toContain(EReasonCodesStatic.near_coast);

    const scoring_2 = generateScoring(eventSchema_matched_offshore, sarConfig);
    expect(scoring_2.reason_codes).toContain(
      EReasonCodesStatic.matched_to_public_ais,
    );
  });

  it('uncertainty_increases_for_missing_fields', () => {
    const scoring = generateScoring(eventSchema_matched_no_date, sarConfig);

    expect(scoring.reason_codes).toContain('missing_required_field:date');
    expect(scoring.uncertainty_score).toBeGreaterThan(0);
  });

  it('uncertainty_increases_for_noisy_vessel', () => {
    const scoring = generateScoring(eventSchema_matched_noisy, sarConfig);

    expect(scoring.reason_codes).toContain(EReasonCodesStatic.noisy_vessel);
    expect(scoring.uncertainty_score).toBeGreaterThan(0.1);
  });

  it('adds_near-coast-EEZ-MPA_reason_codes_correctly', () => {
    const scoring = generateScoring(eventSchema_context_layers, sarConfig);

    expect(scoring.reason_codes).toEqual(
      expect.arrayContaining([
        EReasonCodesStatic.near_coast,
        EReasonCodesStatic.inside_eez,
        EReasonCodesStatic.inside_mpa,
      ]),
    );
  });

  it('adds_low_detection_confidence_reason', () => {
    const scoring = generateScoring(eventSchema_with_low_confidence, sarConfig);

    expect(scoring.reason_codes).toContain(
      EReasonCodesStatic.low_confidence_proxy,
    );
  });

  it('detects_all_missing_required_fields', () => {
    const scoring = generateScoring(eventSchema_matched_no_coord, sarConfig);

    expect(scoring.reason_codes).toContain('missing_required_field:lat');
    expect(scoring.reason_codes).toContain('missing_required_field:lon');
  });

  it('triage_score_increases_when_importance_increases', () => {
    const a = generateScoring(eventSchema_umatched_offshore, sarConfig);
    const b = generateScoring(eventSchema_umatched_near_coast, sarConfig);

    expect(b.triage_score).toBeGreaterThanOrEqual(a.triage_score!);
  });

  it('importance_is_higher_in_MPA_than_offshore', () => {
    const offshore = generateScoring(eventSchema_umatched_offshore, sarConfig);
    const mpa = generateScoring(eventSchema_context_layers, sarConfig);

    expect(mpa.triage_score).toBeGreaterThan(offshore.triage_score!);
  });

  it('ignore_SAR_score_check_logic_for_undefined_matched_flag', () => {
    const ais = generateScoring(eventSchema_ais_offshore, sarConfig);
    const fishing = generateScoring(eventSchema_fishing_offshore, sarConfig);

    expect(ais.reason_codes).toEqual(
      expect.not.arrayContaining([
        EReasonCodesStatic.noisy_vessel,
        EReasonCodesStatic.matched_to_public_ais,
        EReasonCodesStatic.unmatched_to_public_ais,
      ]),
    );

    expect(fishing.reason_codes).toEqual(
      expect.not.arrayContaining([
        EReasonCodesStatic.noisy_vessel,
        EReasonCodesStatic.matched_to_public_ais,
        EReasonCodesStatic.unmatched_to_public_ais,
      ]),
    );
  });
});

describe('generateEventId', () => {
  it('generates_a_deterministic_SHA-256_hash_from_canonical_input', async () => {
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

  it('changes_hash_when_any_input_value_changes', async () => {
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

  it('matches_the_expected_hash_for_known_canonical_input', async () => {
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
  it('generates_deterministic_metadata_for_a_set_of_configs', async () => {
    const configSet = [sarConfig, eventConfig];

    const metadata = await generateRunMetadata(configSet);

    expect(metadata).toEqual(
      expect.objectContaining({
        code_version: 'N/A',
        config_json: deepSortObject(Array.from(configSet)),
        config_hash: expect.any(String),
      }),
    );
  });

  it('produces_the_same_config_hash_regardless_of_Set_order', async () => {
    const setA = [sarConfig, eventConfig];
    const setB = [sarConfig_diff_sorted, eventConfig_diff_sorted];

    const metaA = await generateRunMetadata(setA);
    const metaB = await generateRunMetadata(setB);

    expect(metaA.config_hash).toBe(metaB.config_hash);
  });

  it('changes_config_hash_when_config_content_changes', async () => {
    const modifiedSarConfig = {
      ...sarConfig,
      url_params: {
        ...sarConfig.url_params,
        'spatial-resolution': 'LOW',
      },
    } as IConfigJSON;

    const original = [sarConfig, eventConfig];
    const modified = [modifiedSarConfig, eventConfig];

    const metaOriginal = await generateRunMetadata(original);
    const metaModified = await generateRunMetadata(modified as any);

    expect(metaOriginal.config_hash).not.toBe(metaModified.config_hash);
  });
});

describe('isValidCoordinate', () => {
  it('should_return_true_for_valid_coordinates', () => {
    expect(isValidCoordinate(0, 0)).toBe(true);
    expect(isValidCoordinate(45.5, 120.3)).toBe(true);
    expect(isValidCoordinate(-90, -180)).toBe(true);
    expect(isValidCoordinate(90, 180)).toBe(true);
  });

  it('should_return_false_for_invalid_latitude', () => {
    expect(isValidCoordinate(-91, 0)).toBe(false);
    expect(isValidCoordinate(91, 0)).toBe(false);
    expect(isValidCoordinate(NaN, 0)).toBe(false);
    expect(isValidCoordinate('0', 0)).toBe(false);
  });

  it('should_return_false_for_invalid_longitude', () => {
    expect(isValidCoordinate(0, -181)).toBe(false);
    expect(isValidCoordinate(0, 181)).toBe(false);
    expect(isValidCoordinate(0, NaN)).toBe(false);
    expect(isValidCoordinate(0, '0')).toBe(false);
  });

  it('should_return_false_if_both_coordinates_are_invalid', () => {
    expect(isValidCoordinate(200, 200)).toBe(false);
    expect(isValidCoordinate(NaN, NaN)).toBe(false);
    expect(isValidCoordinate(undefined, undefined)).toBe(false);
    expect(isValidCoordinate('0', '0')).toBe(false);
  });
});

describe('createEventSchema', () => {
  beforeAll(() => {
    mockEEZContext();
    mockMPAContext();
    mockBathymetryContext();
  });

  it('should_return_rejected_event_schema_for_not_valid_date', async () => {
    const entriesMap = getEntriesFrom4wingsResponse(
      sarConfig,
      api4wingsResponse_bad_date,
    );
    const entries = Array.from(entriesMap).flatMap(
      ([source, entries]) => entries,
    );
    if (!entries) return;

    for (const entry of entries) {
      const eventSchema = await createEventSchema(sarConfig, entry);
      expect(eventSchema.rejected).toBe(true);
      expect((eventSchema as IRejectedEventSchema).reasons).toContain(
        ERejectedEventSchemaReasons.notValidTimestamp,
      );
    }
  });

  it('should_return_rejected_event_schema_for_not_valid_vessel_type', async () => {
    const entriesMap = getEntriesFrom4wingsResponse(
      sarConfig,
      api4wingsResponse_bad_vessel_type,
    );
    const entries = Array.from(entriesMap).flatMap(
      ([source, entries]) => entries,
    );
    if (!entries) return;

    for (const entry of entries) {
      const eventSchema = await createEventSchema(sarConfig, entry);
      expect(eventSchema.rejected).toBe(true);
      expect((eventSchema as IRejectedEventSchema).reasons).toContain(
        ERejectedEventSchemaReasons.notValidVesselType,
      );
    }
  });

  it('should_return_rejected_event_schema_for_not_valid_coordinates', async () => {
    const entriesMap = getEntriesFrom4wingsResponse(
      sarConfig,
      api4wingsResponse_bad_coordinates,
    );
    const entries = Array.from(entriesMap).flatMap(
      ([source, entries]) => entries,
    );
    if (!entries) return;

    for (const entry of entries) {
      const eventSchema = await createEventSchema(sarConfig, entry);
      expect(eventSchema.rejected).toBe(true);
      expect((eventSchema as IRejectedEventSchema).reasons).toContain(
        ERejectedEventSchemaReasons.notValidCoordinates,
      );
    }
  });

  it('should_return_multi_rejected_reasons', async () => {
    const entriesMap = getEntriesFrom4wingsResponse(
      sarConfig,
      api4wingsResponse_bad_multi,
    );
    const entries = Array.from(entriesMap).flatMap(
      ([source, entries]) => entries,
    );
    if (!entries) return;

    for (const entry of entries) {
      const eventSchema = await createEventSchema(sarConfig, entry);
      expect(eventSchema.rejected).toBe(true);
      expect(
        (eventSchema as IRejectedEventSchema).reasons.length,
      ).toBeGreaterThan(1);
      expect((eventSchema as IRejectedEventSchema).reasons).toContain(
        ERejectedEventSchemaReasons.notValidCoordinates,
      );
      expect((eventSchema as IRejectedEventSchema).reasons).toContain(
        ERejectedEventSchemaReasons.notValidTimestamp,
      );
      expect((eventSchema as IRejectedEventSchema).reasons).toContain(
        ERejectedEventSchemaReasons.notValidVesselType,
      );
    }
  });

  it('should_return_event_schema_without_matched_flag_for_fishing_dataset', async () => {
    const entriesMap = getEntriesFrom4wingsResponse(
      fishingConfig,
      api4wingsResponse_multi_dataset,
    );
    const entries = Array.from(entriesMap).flatMap(
      ([source, entries]) => entries,
    );
    if (!entries) return;

    for (const entry of entries) {
      const eventSchema = (await createEventSchema(
        fishingConfig,
        entry,
      )) as IEventSchema;
      expect(eventSchema.rejected).toBe(false);
      expect(eventSchema.matched_flag).toBeUndefined();
    }
  });

  it('should_return_event_schema_without_matched_flag_for_AIS_dataset', async () => {
    const entriesMap = getEntriesFrom4wingsResponse(
      aisConfig,
      api4wingsResponse_multi_dataset,
    );
    const entries = Array.from(entriesMap).flatMap(
      ([source, entries]) => entries,
    );
    if (!entries) return;

    for (const entry of entries) {
      const eventSchema = (await createEventSchema(
        aisConfig,
        entry,
      )) as IEventSchema;
      expect(eventSchema.rejected).toBe(false);
      expect(eventSchema.matched_flag).toBeUndefined();
    }
  });
});

describe('sortEventSchema', () => {
  beforeAll(() => {
    mockEEZContext();
    mockMPAContext();
    mockBathymetryContext();
  });

  it('should_sort_mixed_entries_correctly', async () => {
    const entriesMap = getEntriesFrom4wingsResponse(
      sarConfig,
      api4wingsResponse_mixed_accepted_rejected,
    );
    const entries = Array.from(entriesMap).flatMap(
      ([source, entries]) => entries,
    );
    if (!entries) return;
    let events = [];
    for (const entry of entries) {
      const eventSchema = await createEventSchema(sarConfig, entry);
      events.push(eventSchema);
    }
    const sorted = sortEventSchema(events);
    expect(sorted).toHaveLength(7);

    const firstRejectedIndex = sorted.findIndex((e) => e.rejected === true);

    expect(firstRejectedIndex).toBeGreaterThan(-1);

    for (let i = 0; i < firstRejectedIndex; i++) {
      expect(sorted[i].rejected).toBe(false);
    }

    for (let i = firstRejectedIndex; i < sorted.length; i++) {
      expect(sorted[i].rejected).toBe(true);
    }

    const accepted = sorted.filter((e) => !e.rejected);
    const rejected = sorted.filter((e) => e.rejected);

    expect(accepted).toHaveLength(3);
    expect(rejected).toHaveLength(4);

    expect(sorted.every((e) => e.version === '1.0.0')).toBe(true);
    expect(sorted.every((e) => e.raw_metadata)).toBe(true);
    expect(sorted.every((e) => e.run_metadata)).toBe(true);

    expect(sorted.map((e) => e.rejected)).toEqual([
      false,
      false,
      false,
      true,
      true,
      true,
      true,
    ]);
  });

  it('should_sort_by_timestamp_utc_ascending', async () => {
    const result = sortEventSchema(eventSchemas_not_sorted, [
      {
        sortBy: 'timestamp_utc',
        direction: 'asc',
      },
    ]);
    if (result[0].rejected || result[1].rejected) return;

    expect(result[0].timestamp_utc <= result[1].timestamp_utc).toBe(true);
  });

  it('should_sort_by_timestamp_utc_descending', () => {
    const result = sortEventSchema(eventSchemas_not_sorted, [
      {
        sortBy: 'timestamp_utc',
        direction: 'desc',
      },
    ]);
    if (result[0].rejected || result[1].rejected) return;

    expect(result[0].timestamp_utc >= result[1].timestamp_utc).toBe(true);
  });

  it('should_sort_by_nested_field', () => {
    const result = sortEventSchema(eventSchemas_not_sorted, [
      {
        sortBy: 'scoring.triage_score',
        direction: 'desc',
      },
    ]);
    if (result[0].rejected || result[1].rejected) return;

    const score1 = result[0].scoring.triage_score;
    const score2 = result[1].scoring.triage_score;

    if (score1 === null || score2 === null) return;

    expect(score1).toBeGreaterThanOrEqual(score2);
  });

  it('should_sort_by_array_nested_field', () => {
    const result = sortEventSchema(eventSchemas_not_sorted, [
      {
        sortBy: 'context_layers.Bathymetry.enrichments[0].value',
        direction: 'asc',
      },
    ]);

    const first = Number(
      getSortValue(result[0], 'context_layers.Bathymetry.enrichments[0].value'),
    );

    const second = Number(
      getSortValue(result[1], 'context_layers.Bathymetry.enrichments[0].value'),
    );

    expect(first).toBeLessThanOrEqual(second);
  });

  it('should_throw_error_for_invalid_sort_direction', () => {
    expect(() =>
      sortEventSchema(eventSchemas_not_sorted, [
        {
          sortBy: 'timestamp_utc',
          direction: 'ascending' as any,
        },
      ]),
    ).toThrow(
      '[sortEventSchema] Invalid direction "ascending" for sortBy "timestamp_utc". Allowed values are "asc" or "desc".',
    );
  });

  it('should_throw_error_for_invalid_sort_field', () => {
    expect(() =>
      sortEventSchema(eventSchemas_not_sorted, [
        {
          sortBy: 'invalid.field.path',
          direction: 'asc',
        },
      ]),
    ).toThrow('[sortEventSchema] Invalid sortBy field: "invalid.field.path"');
  });

  it('should_return_empty_array_when_input_is_empty', () => {
    const result = sortEventSchema([]);

    expect(result).toEqual([]);
  });

  it('should_not_throw_when_optional_nested_field_exists_only_in_some_events', () => {
    expect(() =>
      sortEventSchema(eventSchemas_not_sorted, [
        {
          sortBy: 'confidence_proxy',
          direction: 'asc',
        },
      ]),
    ).not.toThrow();
  });

  it('should_sort_by_multiple_fields', () => {
    const result = sortEventSchema(eventSchemas_not_sorted, [
      {
        sortBy: 'confidence_tier',
        direction: 'asc',
      },
      {
        sortBy: 'scoring.triage_score',
        direction: 'asc',
      },
    ]);
    if (result[0].rejected || result[1].rejected) return;
    const score1 = result[0].scoring.triage_score;
    const score2 = result[1].scoring.triage_score;

    if (score1 === null || score2 === null) return;

    expect(result.length).toBe(eventSchemas_not_sorted.length);
    expect(result[0].confidence_tier).toEqual(result[1].confidence_tier);
    expect(score2).toBeGreaterThanOrEqual(score1);
  });
});

describe('Event_statistics_utilities', () => {
  const validEvents = eventSchemas_not_sorted as any;

  const invalidEvents = [
    {
      event_id: null,
      timestamp_utc: null,
      lat: null,
      lon: null,
      confidence_proxy: null,
      distance_to_coast_km: null,
    },
    {
      event_id:
        '8c07b71ef69301c62f7a94e367c7b627292329d5d4c9633195c064fc8d4e0081',
      timestamp_utc: '2025-12-06T05:00:00Z',
      lat: 50,
      lon: null,
      confidence_proxy: 2,
      distance_to_coast_km: null,
    },
  ];

  const mixedEvents = [...validEvents, ...invalidEvents];

  it('getEventMissingness_calculates_missing_rates', () => {
    const result = getEventMissingness(mixedEvents);

    expect(result).toHaveProperty(EVENT_MISSINGNESS_KEYS.event_id);
    expect(result).toHaveProperty(EVENT_MISSINGNESS_KEYS.timestamp_utc);
    expect(result).toHaveProperty(EVENT_MISSINGNESS_KEYS.lat);
    expect(result).toHaveProperty(EVENT_MISSINGNESS_KEYS.lon);

    expect(result.confidence_proxy).toBe('95.00%');
    expect(typeof result['event_id']).toBe('string');
  });

  it('getGeoMin_returns_correct_minimum_latitude', () => {
    const minLat = getGeoMin(EGeoCoordinate.latitude, mixedEvents);

    expect(typeof minLat).toBe('number');
    expect(minLat).toBeLessThanOrEqual(
      getGeoMin(EGeoCoordinate.latitude, validEvents),
    );
  });

  it('getGeoMax_returns_correct_maximum_latitude', () => {
    const maxLat = getGeoMax(EGeoCoordinate.latitude, mixedEvents);

    expect(typeof maxLat).toBe('number');
    expect(maxLat).toBeGreaterThanOrEqual(
      getGeoMax(EGeoCoordinate.latitude, validEvents),
    );
  });

  it('getGeoMin_returns_correct_minimum_longitude', () => {
    const minLon = getGeoMin(EGeoCoordinate.longitude, mixedEvents);

    expect(typeof minLon).toBe('number');
    expect(minLon).toBeLessThanOrEqual(
      getGeoMin(EGeoCoordinate.longitude, validEvents),
    );
  });

  it('getGeoMax_returns_correct_maximum_longitude', () => {
    const maxLon = getGeoMax(EGeoCoordinate.longitude, mixedEvents);

    expect(typeof maxLon).toBe('number');
    expect(maxLon).toBeGreaterThanOrEqual(
      getGeoMax(EGeoCoordinate.longitude, validEvents),
    );
  });

  it('getTimeRange_returns_correct_start_and_end_timestamps', () => {
    const range = getTimeRange(validEvents);

    expect(range).toHaveProperty('start');
    expect(range).toHaveProperty('end');

    const start = new Date(range.start).getTime();
    const end = new Date(range.end).getTime();

    expect(start).toBeLessThanOrEqual(end);
  });

  it('getTimeRange_handles_invalid_timestamps_safely', () => {
    const range = getTimeRange(mixedEvents);

    expect(range.start).toBeDefined();
    expect(range.end).toBeDefined();
  });
});

describe('Pipeline_determinism', () => {
  it('should_produce_identical_output_when_run_twice', async () => {
    const OUTPUT_FILE = 'data/out/events.geojson';
    // run pipeline first time
    execSync('npm run pipeline:sample', { stdio: 'inherit' });
    const hash1 = await hashFile(OUTPUT_FILE);

    // run pipeline second time
    execSync('npm run pipeline:sample', { stdio: 'inherit' });
    const hash2 = await hashFile(OUTPUT_FILE);

    expect(hash1).toBe(hash2);
  });
});

describe('Hotspot_generation', () => {
  it('should_create_hotspots_using_canonical_events', async () => {
    const hotspots_reso_3 = generateHotspots(
      {
        ...sarConfig,
        hotspot: { ...sarConfig.hotspot, resolution: 3 },
      } as IConfigJSON,
      canonicalSchema as any,
    );
    expect(hotspots_reso_3.length).toBe(3);
    expect(hotspots_reso_3[0]?.cell_id).toEqual(hotspots_reso_3[1]?.cell_id);
    expect(hotspots_reso_3[0]?.time_bin).not.toEqual(
      hotspots_reso_3[1]?.time_bin,
    );

    const hotspots_reso_5 = generateHotspots(
      {
        ...sarConfig,
        hotspot: { ...sarConfig.hotspot, resolution: 5 },
      } as IConfigJSON,
      canonicalSchema as any,
    );
    expect(hotspots_reso_5.length).toBe(9);
  });

  it('should_return_error_for_not_valid_time_bin', async () => {
    expect(() =>
      generateHotspots(
        {
          ...sarConfig,
          hotspot: { ...sarConfig.hotspot, timeBin: 'YEARLY' },
        } as IConfigJSON,
        canonicalSchema as any,
      ),
    ).toThrow('[generateHotspots] hotspotTimeBin must be DAILY or HOURLY');
  });
});

describe('Hotspot_Strength', () => {
  it('should_return_LOW_for_weak_hotspot', () => {
    const result = generateHotspotStrength(hotspot_low_strength);
    expect(result).toBe(EHotspotStrength.low);
  });

  it('should_increase_score_for_recurrence_>=_7_and_time_persistence_>=_3', () => {
    const result = generateHotspotStrength(hotspot_medium_strength);
    expect(result).toBe(EHotspotStrength.medium);
  });

  it('should_reach_HIGH_eligibility_gate_but_still_fail_due_to_score', () => {
    const result = generateHotspotStrength(
      hotspot_medium_strength_eligible_for_high,
    );
    expect(result).toBe(EHotspotStrength.medium);
  });

  it('should_return_HIGH_when_all_conditions_are_met', () => {
    const result = generateHotspotStrength(
      hotspot_high_strength_eligible_for_high,
    );
    expect(result).toBe(EHotspotStrength.high);
  });

  it('should_penalize_high_uncertainty', () => {
    const result = generateHotspotStrength(hotspot_penilized_uncertainty);
    expect(result).toBe(EHotspotStrength.medium);
  });

  it('should_clamp_score_at_0', () => {
    const result = generateHotspotStrength(hotspot_penilized_uncertainty_heavy);
    expect(result).toBe(EHotspotStrength.low);
  });
});

describe('enrichEventsWithHotspots', () => {
  it('should_return_null_when_hotspot_map_is_empty', () => {
    const enrichedEvents = enrichEventsWithHotspots(
      canonicalSchema_base as any,
      hotspots_import.features as any,
    );
    expect(enrichedEvents.every((e) => e.hotspot === null)).toBeTruthy();
  });
  it('should_enrich_events_with_hotspot_signals', () => {
    const hotspots = generateHotspots(sarConfig, canonicalSchema_base as any);
    const enrichedEvents = enrichEventsWithHotspots(
      canonicalSchema_base as any,
      hotspots as any,
    );
    expect(
      enrichedEvents.every((e) => e.hotspot && e.hotspot.signals),
    ).toBeTruthy();
  });
  it('should_return_null_when_event_is_not_in_any_hotspot', () => {
    const event_in_no_hotspot = {
      eventSchema_matched_near_coast,
      event_id: 'notMatching',
    };
    const hotspots = generateHotspots(sarConfig, canonicalSchema_base as any);
    const enrichedEvents = enrichEventsWithHotspots(
      [...canonicalSchema_base, event_in_no_hotspot] as any,
      hotspots as any,
    );
    expect(enrichedEvents.find((e) => e.hotspot === null)?.event_id).toBe(
      'notMatching',
    );
    expect(
      enrichedEvents
        .filter((e) => e.event_id !== 'notMatching')
        .every((h) => h.hotspot !== null),
    ).toBeTruthy();
  });
  it('should_enrich_events_with_hotspot_signals', () => {
    const hotspots = generateHotspots(sarConfig, canonicalSchema_base as any);
    const enrichedEvents = enrichEventsWithHotspots(
      canonicalSchema_base as any,
      hotspots as any,
    );
    expect(
      enrichedEvents.every((e) => e.hotspot && e.hotspot.signals),
    ).toBeTruthy();
  });
});

describe('Validation', () => {
  const landPolygons = readLandPolygons();

  it('should_return_true_for_land_points', () => {
    const landPoints: [number, number][] = [
      [13.405, 52.52], // Berlin, Germany
      [121.4437, 31.1948], // Shanghai, China
      [-74.006, 40.7128], // New York City, USA
      [151.2093, -33.8688], // Sydney, Australia
      [2.3522, 48.8566], // Paris, France
      [-58.3816, -34.6037], // Buenos Aires, Argentina
      [37.6173, 55.7558], // Moscow, Russia
      [-0.1276, 51.5074], // London, UK
      [139.6917, 35.6895], // Tokyo, Japan
      [18.4241, -33.9249], // Cape Town, South Africa
    ];
    landPoints.forEach(([lon, lat]) => {
      expect(isOnLand(landPolygons, lon, lat)).toBe(true);
    });
  });

  it('should_return_false_for_water_points', () => {
    const waterPoints: [number, number][] = [
      [-30.0, 0.0], // Atlantic Ocean
      [-124.5001, -8.801], // Pacific Ocean
      [0.0, -45.0], // Southern Ocean
      [-150.0, 30.0], // Pacific Ocean
      [50.0, -10.0], // Indian Ocean
      [-161.8162, 32.7295], // North Pacific
      [170.0, -40.0], // South Pacific
      [-28.6741, -14.6506], // Atlantic Ocean
      [10.0, -60.0], // Southern Ocean
      [56.462, 26.6222], // Hormoz Strait
    ];
    waterPoints.forEach(([lon, lat]) => {
      expect(isOnLand(landPolygons, lon, lat)).toBe(false);
    });
  });

  it('should_label_currectly', () => {
    const validationSample = createValidationSample(eventSchema_onLand);
    expect(validationSample.label).toBe(EValidationLabel.FP);

    const validationSample2 = createValidationSample(eventSchema_inWater);
    expect(validationSample2.label).toBe(EValidationLabel.TP);
  });
});

describe('Context_layers', () => {
  // --- Shallow Water (depth > -50) ---
  it('should_return_isShallowWater=true_for_depth_above_shallow_threshold_0', () => {
    const result = vesselZone('0');
    expect(result).toEqual({
      isShallowWater: true,
      isFishingZone: false,
      isDeepWater: false,
    });
  });

  it('should_return_isShallowWater=true_for_depth_above_shallow_threshold_-10', () => {
    const result = vesselZone('-10');
    expect(result).toEqual({
      isShallowWater: true,
      isFishingZone: false,
      isDeepWater: false,
    });
  });

  it('should_return_isShallowWater=true_for_positive_depth_10', () => {
    const result = vesselZone('10');
    expect(result).toEqual({
      isShallowWater: true,
      isFishingZone: false,
      isDeepWater: false,
    });
  });

  // --- Fishing Zone (-200 < depth <= -50) ---
  it('should_return_isFishingZone=true_exactly_at_shallow_threshold_-50', () => {
    const result = vesselZone('-50');
    expect(result).toEqual({
      isShallowWater: false,
      isFishingZone: true,
      isDeepWater: false,
    });
  });

  it('should_return_isFishingZone=true_for_depth_in_fishing_range_-100', () => {
    const result = vesselZone('-100');
    expect(result).toEqual({
      isShallowWater: false,
      isFishingZone: true,
      isDeepWater: false,
    });
  });

  it('should_return_isFishingZone=true_just_above_deep_threshold_-199', () => {
    const result = vesselZone('-199');
    expect(result).toEqual({
      isShallowWater: false,
      isFishingZone: true,
      isDeepWater: false,
    });
  });

  // --- Deep Water (depth <= -200) ---
  it('should_return_isDeepWater=true_exactly_at_deep_threshold_-200', () => {
    const result = vesselZone('-200');
    expect(result).toEqual({
      isShallowWater: false,
      isFishingZone: false,
      isDeepWater: true,
    });
  });

  it('should_return_isDeepWater=true_for_depth_below_deep_threshold_-500', () => {
    const result = vesselZone('-500');
    expect(result).toEqual({
      isShallowWater: false,
      isFishingZone: false,
      isDeepWater: true,
    });
  });

  // --- Undefined / Edge cases ---
  it('should_return_all_false_when_bathymetry_is_undefined', () => {
    const result = vesselZone(undefined);
    expect(result).toEqual({
      isShallowWater: false,
      isFishingZone: false,
      isDeepWater: false,
    });
  });
});

