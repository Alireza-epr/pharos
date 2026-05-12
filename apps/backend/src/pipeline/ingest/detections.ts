import { config } from '../../config/api';
import { ELogType } from '../../helpers/types/generalTypes';
import { EFetchMethods } from '@packages/enum';
import {
  IConfigJSON,
  I4wingsReportGetURLParams,
  I4wingsReportPostBodyParams,
  I4wingsReportPostURLParams,
  IEventGetURLParams,
  IEventPostBodyParams,
  IEventPostURLParams,
  T4wingsSource,
  TEventSource,
} from '@packages/types';
import { log, sleep } from '../../helpers/utils/backendUtils';

const token = config.auth.gfw_token;

export const detectionPostGFW = async <T>(
  a_BaseURL: string,
  a_Source: T4wingsSource,
  a_URLParam: I4wingsReportGetURLParams,
  a_BodyParam: I4wingsReportPostBodyParams,
) => {
  const metadata: Partial<IConfigJSON> = {
    URL: a_BaseURL,
    method: EFetchMethods.post,
    url_params: a_URLParam,
    body_params: a_BodyParam,
  };
  
  const searchParams = Object.entries(a_URLParam).reduce<
    Record<string, string>
  >((acc, [key, value]) => {
    acc[key] = String(value);
    return acc;
  }, {});

  const params = new URLSearchParams(searchParams);
  log('[detectionPostGFW] Metadata ' + JSON.stringify(metadata), ELogType.info);
  try {
    const res = await fetchWithRetry(
      `${a_BaseURL}?${params.toString()}`,
      {
        method: metadata.method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: a_BodyParam ? JSON.stringify(a_BodyParam) : null,
      },
      5,
      200,
    );

    if (!res.ok) {
      throw `response not ok`;
    }

    const results: T = await res.json();
    log(
      '[detectionPostGFW] Response ' + JSON.stringify(results),
      ELogType.info,
    );

    return {
      metadata,
      results,
    };
  } catch (error) {
    throw new Error(`[detectionPostGFW] Error: ${error}`);
  }
};

export const detectionGetGFW = async <T>(
  a_BaseURL: string,
  a_Source: T4wingsSource,
  a_URLParam: I4wingsReportGetURLParams,
) => {
  const metadata: Partial<IConfigJSON> = {
    URL: a_BaseURL,
    method: EFetchMethods.get,
    url_params: a_URLParam,
  };

  const searchParams = Object.entries(a_URLParam).reduce<
    Record<string, string>
  >((acc, [key, value]) => {
    acc[key] = String(value);
    return acc;
  }, {});

  const params = new URLSearchParams(searchParams);
  log('[detectionGetGFW] Metadata ' + JSON.stringify(metadata), ELogType.info);
  try {
    const res = await fetchWithRetry(
      `${a_BaseURL}?${params.toString()}`,
      {
        method: metadata.method,
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
    log('[detectionGetGFW] Response ' + JSON.stringify(results), ELogType.info);

    return {
      metadata,
      results,
    };
  } catch (error) {
    throw new Error(`[detectionGetGFW] Error: ${error}`);
  }
};

export const fetchWithRetry = async (
  a_URL: string | URL | Request,
  a_Init: RequestInit | undefined,
  a_Retries: number,
  a_Delay: number,
): Promise<Response> => {
  let currentDelay = a_Delay;

  for (let attempt = 1; attempt <= a_Retries; attempt++) {
    try {
      const response = await fetch(a_URL, a_Init);

      if (!response.ok) {
        const txt = await response.text();

        if (response.status < 500 && response.status !== 429) {
          throw new Error(`Non-retryable error ${response.status}: ${txt}`);
        }

        throw new Error(
          `Retryable error ${response.status}: ${txt} (${attempt}/${a_Retries})`,
        );
      }

      return response;
    } catch (error) {
      if ((error as Error).message.includes("Non-retryable error")) {
        log(
          `${error}`,
          ELogType.error,
        );
        throw error;
      }

      if (attempt === a_Retries) {
        log(
          `[fetchWithRetry] Giving up after ${a_Retries} attempts ${error})}`,
          ELogType.error,
        );
        throw error;
      }

      log(
        `[fetchWithRetry] Attempt ${attempt} failed ${JSON.stringify(error)}`,
        ELogType.error,
      );

      await sleep(currentDelay);
      currentDelay *= 2;
    }
  }

  throw new Error('[fetchWithRetry] failed unexpectedly');
};

export const detectionGFW = async <T>(
  a_Config: IConfigJSON
) => {
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
  log('[detectionGFW] Metadata ' + JSON.stringify(a_Config), ELogType.info, 150);
  try {
    const res = await fetchWithRetry(
      `${a_Config.URL}?${params.toString()}`,
      {
        method: a_Config.method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: a_Config.body_params ? JSON.stringify(a_Config.body_params) : null,
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
      150
    );

    return results;
  } catch (error) {
    throw new Error(`[detectionGFW] Error: ${error}`);
  }

}
