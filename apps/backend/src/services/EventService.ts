import { IEventConfigJSON, IEventSearchAPIResponse } from '@packages/types';
import { config } from '../config/api';
import { log } from '../helpers/utils/backendUtils';
import { ELogType } from '../helpers/types/generalTypes';
import { getEventRepository } from '../repositories/event';

/**
 * The event service: obtains behavioral-event records (encounters,
 * loitering, port visits, gaps, fishing) from a provider.
 *
 * Same spirit as {@link import('./VesselService').searchVessels} -- no
 * triage scoring, hotspot enrichment, or parquet caching here, a record is
 * returned close to as the provider sent it. The provider's endpoint syntax
 * lives behind the swappable event **repository** ({@link getEventRepository}),
 * so consumers depend on this service, not on GFW.
 */

// Provider strategy (GFW by default; selected by config in the factory).
const eventRepository = getEventRepository();

/**
 * Search behavioral events for a query.
 *
 * - With a configured `DETECTION_TOKEN` this is the live path: search via
 *   the provider repository.
 * - Without a token (local/offline dev) it returns an empty result rather
 *   than a fixture -- there's no bundled event sample the way
 *   `getDetections` has `report_response` (see DetectionService.ts).
 */
export const searchEvents = async (
  a_Config: IEventConfigJSON,
): Promise<IEventSearchAPIResponse> => {
  if (!config.auth.detection_token) {
    log('[event] DETECTION_TOKEN not set - offline serving', ELogType.warn);
    return {
      metadata: { datasets: [], vessels: [], dateRange: { from: null, to: null } },
      limit: 0,
      offset: 0,
      nextOffset: null,
      total: 0,
      entries: [],
    };
  }

  return eventRepository.search(a_Config);
};
