import {
  IVesselConfigJSON,
  IVesselListAPIResponse,
  IVesselListConfigJSON,
  IVesselSearchAPIResponse,
} from '@packages/types';
import { config } from '../config/api';
import { log } from '../helpers/utils/backendUtils';
import { ELogType } from '../helpers/types/generalTypes';
import { getVesselRepository } from '../repositories/vessel';

/**
 * The vessel service: obtains vessel identity records from a provider.
 *
 * Unlike {@link import('./DetectionService').getDetections}, there is no
 * triage scoring, hotspot enrichment, or parquet caching here -- a vessel
 * identity record is returned close to as the provider sent it. The
 * provider's endpoint syntax still lives behind the swappable vessel
 * **repository** ({@link getVesselRepository}), so consumers depend on this
 * service, not on GFW.
 */

// Provider strategy (GFW by default; selected by config in the factory).
const vesselRepository = getVesselRepository();

/**
 * Search vessel identities for a query.
 *
 * - With a configured `DETECTION_TOKEN` this is the live path: search via
 *   the provider repository.
 * - Without a token (local/offline dev) it returns an empty result rather
 *   than a fixture -- there's no bundled vessel-identity sample the way
 *   `getDetections` has `report_response` (see DetectionService.ts).
 */
export const searchVessels = async (
  a_Config: IVesselConfigJSON,
): Promise<IVesselSearchAPIResponse> => {
  if (!config.auth.detection_token) {
    log('[vessel] DETECTION_TOKEN not set - offline serving', ELogType.warn);
    return { entries: [] };
  }

  return vesselRepository.search(a_Config);
};

/**
 * Fetch vessel identity records for a known set of vessel ids (e.g. a
 * matched detection's `raw_metadata.vesselId`). Same offline-serving
 * fallback as `searchVessels`.
 */
export const getVesselsByIds = async (
  a_Config: IVesselListConfigJSON,
): Promise<IVesselListAPIResponse> => {
  if (!config.auth.detection_token) {
    log('[vessel] DETECTION_TOKEN not set - offline serving', ELogType.warn);
    return { entries: [] };
  }

  return vesselRepository.list(a_Config);
};
