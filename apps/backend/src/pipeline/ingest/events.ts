import { config } from '../../config/api';
import { ELogType } from '../../helpers/types/generalTypes';
import { IEventConfigJSON, IEventSearchAPIResponse } from '@packages/types';
import { log } from '../../helpers/utils/backendUtils';
import { fetchWithRetry } from '@packages/utils';

const token = config.auth.detection_token;

/**
 * Fetches GFW's Events API (POST /v3/events) -- confirmed against GFW's own
 * maintained Python client that "get all events" has no GET variant, unlike
 * Vessels Search. `limit`/`offset`/`sort` ride in the query string;
 * everything else (datasets, vessels, date range, confidences, geometry,
 * region, ...) is the JSON body. Same retry/bearer-auth shape as
 * {@link import('./vessels').searchVesselsGFW} otherwise.
 */
export const searchEventsGFW = async (
  a_Config: IEventConfigJSON,
): Promise<IEventSearchAPIResponse> => {
  const searchParams = Object.entries(a_Config.url_params).reduce<
    Record<string, string>
  >((acc, [key, value]) => {
    if (value !== undefined) acc[key] = String(value);
    return acc;
  }, {});

  const params = new URLSearchParams(searchParams);

  log('[eventsGFW] Metadata ' + JSON.stringify(a_Config), ELogType.info, 150);

  try {
    const res = await fetchWithRetry(
      `${a_Config.url}?${params.toString()}`,
      {
        method: a_Config.method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(a_Config.body_params),
      },
      5,
      200,
    );

    if (!res.ok) {
      throw `response not ok`;
    }

    const results: IEventSearchAPIResponse = await res.json();
    log('[eventsGFW] Response ' + JSON.stringify(results), ELogType.info, 150);

    return results;
  } catch (error) {
    throw new Error(`[eventsGFW] Error: ${error}`);
  }
};
