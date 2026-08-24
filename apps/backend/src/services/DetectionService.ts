import {
  IConfigJSON,
  IEventDetection,
  IEventSchema,
  IRejectedEventSchema,
} from '@packages/types';
import { config } from '../config/api';
import { createSortedEventSchemas } from '../pipeline/schema/main';
import { getEntriesFrom4wingsResponse, log } from '../helpers/utils/backendUtils';
import { ELogType } from '../helpers/types/generalTypes';
import { readBathymetryTiles } from '../helpers/utils/datasetUtils';
import { report_response } from '../helpers/fixtures/samples';
import { getDetectionRepository } from '../repositories/detection';
import { groupByRejection } from '@packages/utils';

/**
 * The detection service: obtains canonical SAR detections from a provider.
 *
 * It owns the business logic — normalise the raw provider response and run the
 * enrichment pipeline into `IEventSchema` — while the provider's endpoint syntax
 * lives behind the swappable detection **repository** ({@link getDetectionRepository}).
 * Consumers (e.g. `ServingService` on a cache miss) depend on this service, not
 * on GFW.
 */

// Provider strategy (GFW by default; selected by config in the factory).
const detectionRepository = getDetectionRepository();

let bathymetryLoaded = false;

/** Load bathymetry rasters into memory once (other datasets load on import). */
const ensureDatasetsLoaded = async (): Promise<void> => {
  if (bathymetryLoaded) return;
  await readBathymetryTiles();
  bathymetryLoaded = true;
};

/**
 * Fetch detections for a query and return them as fully enriched canonical
 * events, split into `valid`/`rejected` (an entry that failed schema
 * enrichment) so callers can report both -- see `IEventDetection`.
 *
 * - With a configured `DETECTION_TOKEN` this is the live path: fetch via the provider
 *   repository, normalise the 4Wings response, and run enrichment.
 * - Without a token (local/offline dev, as the repo runs today) it serves the
 *   bundled sample, which is already enriched. This keeps the serving cache path
 *   exercisable offline; production deployments set the token.
 */
export const getDetections = async (
  a_Config: IConfigJSON,
): Promise<IEventDetection> => {
  if (!config.auth.detection_token) {
    log(
      '[detection] DETECTION_TOKEN not set - offline serving',
      ELogType.warn,
    );
    return groupByRejection(
      report_response.data as (IEventSchema | IRejectedEventSchema)[],
    );
  }

  await ensureDatasetsLoaded();

  const response = await detectionRepository.fetch(a_Config);
  const entriesMap = getEntriesFrom4wingsResponse(a_Config, response);
  const entries = Array.from(entriesMap).flatMap(([, list]) => list);

  if (entries.length === 0) return { valid: [], rejected: [] };

  const events = await createSortedEventSchemas(a_Config, entries);
  return groupByRejection(events);
};
