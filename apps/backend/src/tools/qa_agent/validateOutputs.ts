import fs from 'fs';
import path from 'path';
import {
  IFileCheckResult,
  ISchemaCheckResult,
  TQAAgentMode,
} from '../../helpers/types/qaAgentTypes';

/** Files `sample.ts --main`'s success path writes via evidenceExport's fullExport selection. */
export const MAIN_MODE_FILES = [
  'canonicalSchema.json',
  'events.geojson',
  'events.parquet',
  'events.csv',
  'stats.json',
  'hotspots.geojson',
  'hotspots.parquet',
  'run_metadata.json',
];

/** Files `sample.ts --validation`'s success path writes via validationExport. */
export const VALIDATION_MODE_FILES = [
  'validation_sample.csv',
  'validation_sample.geojson',
  'validation_manifest.json',
];

export const requiredFilesFor = (a_Mode: TQAAgentMode): string[] =>
  a_Mode === 'validation' ? VALIDATION_MODE_FILES : MAIN_MODE_FILES;

export const checkFilesExist = (
  a_OutputDir: string,
  a_Required: string[],
): IFileCheckResult => {
  const present: string[] = [];
  const missing: string[] = [];

  for (const file of a_Required) {
    if (fs.existsSync(path.join(a_OutputDir, file))) {
      present.push(file);
    } else {
      missing.push(file);
    }
  }

  return { present, missing };
};

/**
 * A structural check, not a full schema validator (this repo has no
 * zod/ajv) — confirms every event in canonicalSchema.json carries every
 * top-level IEventSchema key, catching the failure mode that actually
 * matters here: a pipeline change that silently drops or renames a field.
 * Nullable fields (matched_flag, confidence_proxy, ...) are checked for
 * presence, not truthiness.
 */
const REQUIRED_EVENT_KEYS = [
  'distance_to_coast_km',
  'context_layers',
  'version',
  'event_id',
  'timestamp_utc',
  'lon',
  'lat',
  'geom',
  'matched_flag',
  'source',
  'confidence_proxy',
  'confidence_tier',
  'raw_metadata',
  'raw_event_metadata',
  'run_metadata',
  'scoring',
  'rejected',
  'hotspot',
];

export const checkCanonicalSchemaShape = (
  a_Events: Record<string, unknown>[],
): ISchemaCheckResult => {
  const issues: string[] = [];

  a_Events.forEach((event, index) => {
    const missingKeys = REQUIRED_EVENT_KEYS.filter((key) => !(key in event));
    if (missingKeys.length > 0) {
      const label =
        typeof event.event_id === 'string' ? event.event_id : `index ${index}`;
      issues.push(`event ${label} missing: ${missingKeys.join(', ')}`);
    }
  });

  return { checked: a_Events.length, issues };
};
