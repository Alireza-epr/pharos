import { config } from '../../config/api';
import { ELogType } from '../../helpers/types/generalTypes';
import {
  IConfigJSON,
} from '@packages/types';
import { log } from '../../helpers/utils/backendUtils';
import { fetchWithRetry } from '@packages/utils';

const token = config.auth.gfw_token;

export const detectionGFW = async <T>(a_Config: IConfigJSON) => {
  const searchParams = Object.entries(a_Config.url_params).reduce<
    Record<string, string>
  >((acc, [key, value]) => {
    acc[key] = String(value);
    return acc;
  }, {});

  const params = new URLSearchParams(searchParams);
  // Low spatial resolution uses cells of 0.1° × 0.1° (~10 km scale) at the equator
  // High spatial resolution uses cells of 0.01° × 0.01° (~1 km scale) at the equator
  // Hourly temporal resolution > date = YYYY-MM-DD HH:00:00 > Data is grouped by:(grid cell + 1 hour bucket)
  // ENTIRE temporal resolution > date = date-range > Data is grouped by:(grid cell + full date-range)
  log(
    '[detectionGFW] Metadata ' + JSON.stringify(a_Config),
    ELogType.info,
    150,
  );
  try {
    const res = await fetchWithRetry(
      `${a_Config.URL}?${params.toString()}`,
      {
        method: a_Config.method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: a_Config.body_params
          ? JSON.stringify(a_Config.body_params)
          : null,
      },
      5,
      200,
    );

    if (!res.ok) {
      throw `response not ok`;
    }

    const results: T = await res.json();
    log(
      '[detectionGFW] Response ' + JSON.stringify(results),
      ELogType.info,
      150,
    );

    return results;
  } catch (error) {
    throw new Error(`[detectionGFW] Error: ${error}`);
  }
};
