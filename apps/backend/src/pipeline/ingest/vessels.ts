import { config } from '../../config/api';
import { ELogType } from '../../helpers/types/generalTypes';
import {
  IVesselConfigJSON,
  IVesselListAPIResponse,
  IVesselListConfigJSON,
  IVesselSearchAPIResponse,
} from '@packages/types';
import { EFetchMethods } from '@packages/enum';
import { log } from '../../helpers/utils/backendUtils';
import { fetchWithRetry } from '@packages/utils';

const token = config.auth.detection_token;

const fetchVesselsGFW = async <T>(
  a_URL: string,
  a_Method: EFetchMethods,
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
        method: a_Method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
      config.detection_provider_retries,
      config.detection_provider_retry_delay_ms,
      config.detection_provider_timeout_ms,
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
  a_Config: IVesselConfigJSON,
): Promise<IVesselSearchAPIResponse> =>
  fetchVesselsGFW<IVesselSearchAPIResponse>(
    a_Config.url,
    a_Config.method,
    a_Config.url_params,
  );

export const listVesselsGFW = (
  a_Config: IVesselListConfigJSON,
): Promise<IVesselListAPIResponse> =>
  fetchVesselsGFW<IVesselListAPIResponse>(
    a_Config.url,
    a_Config.method,
    a_Config.url_params,
  );
