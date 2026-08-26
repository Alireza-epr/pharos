import { config } from '../../config/api';
import { ELogType } from '../../helpers/types/generalTypes';
import {
  IVesselListAPIResponse,
  IVesselListURLParams,
  IVesselSearchAPIResponse,
  IVesselSearchURLParams,
} from '@packages/types';
import { EFetchMethods } from '@packages/enum';
import { log } from '../../helpers/utils/backendUtils';
import { fetchWithRetry } from '@packages/utils';

const token = config.auth.detection_token;

// Same GFW gateway/token as the 4Wings report call (detections.ts) -- Vessels
// is a different resource on the same provider, not a different credential.
// Kept local (not in a shared fixture) the same way pilot.json/detections.ts
// each hold their own copy of a provider URL rather than importing across
// the frontend/backend boundary.
const VESSELS_BASE_URL = 'https://gateway.api.globalfishingwatch.org/v3/vessels';

const fetchVesselsGFW = async <T>(
  a_URL: string,
  a_Params: object,
): Promise<T> => {
  const searchParams = Object.entries(a_Params).reduce<Record<string, string>>(
    (acc, [key, value]) => {
      if (value !== undefined) acc[key] = String(value);
      return acc;
    },
    {},
  );

  const params = new URLSearchParams(searchParams);

  log('[vesselsGFW] Metadata ' + JSON.stringify(a_Params), ELogType.info, 150);

  try {
    const res = await fetchWithRetry(
      `${a_URL}?${params.toString()}`,
      {
        method: EFetchMethods.get,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
      5,
      200,
    );

    if (!res.ok) {
      throw `response not ok`;
    }

    const results: T = await res.json();
    log('[vesselsGFW] Response ' + JSON.stringify(results), ELogType.info, 150);

    return results;
  } catch (error) {
    throw new Error(`[vesselsGFW] Error: ${error}`);
  }
};

export const searchVesselsGFW = (
  a_Params: IVesselSearchURLParams,
): Promise<IVesselSearchAPIResponse> =>
  fetchVesselsGFW<IVesselSearchAPIResponse>(
    `${VESSELS_BASE_URL}/search`,
    a_Params,
  );

// GET /vessels (list by IDs) -- given known vessel ids (e.g. a matched
// detection's raw_metadata.vesselId), returns their identity records
// directly. No query/matching involved, so no `since`/pagination concerns
// the way search has.
export const listVesselsGFW = (
  a_Params: IVesselListURLParams,
): Promise<IVesselListAPIResponse> =>
  fetchVesselsGFW<IVesselListAPIResponse>(VESSELS_BASE_URL, a_Params);
