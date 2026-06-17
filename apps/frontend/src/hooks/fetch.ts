import { EBaseRoutes, EFetchMethods, ELogType } from '@packages/enum';
import {
  IConfigJSON,
  IEventSchema,
  IResponse,
  TBodyParams,
  TURLParams,
} from '@packages/types';
import { log_frontend } from '@packages/utils';
import { useState, useCallback } from 'react';
import { getAPIConfig } from '.';
import { fetchWithAuth } from '../helpers/utils/apiUtils';

const { BASE_URL } = getAPIConfig();

export const useFetchEvents = () => {
  const url = `${BASE_URL}${EBaseRoutes.events}`;
  const [response, setResponse] = useState<IResponse<IEventSchema> | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (a_Config: IConfigJSON) => {
      const { url_params, ...rest } = a_Config;
      const params = new URLSearchParams(
        Object.entries(a_Config.url_params).reduce<Record<string, string>>(
          (acc, [key, value]) => {
            if (value !== undefined && value.length !== 0)
              acc[key] = String(value);
            return acc;
          },
          {},
        ),
      );
      const options = {
        method: EFetchMethods.post,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rest),
      };
      try {
        setLoading(true);
        setError(null);
        const res = await fetchWithAuth(`${url}?${params.toString()}`, options);
        const json: IResponse<IEventSchema> = await res.json();
        setResponse(json);
        return json;
      } catch (err: any) {
        log_frontend(
          `[useFetchEvents] Error: ${JSON.stringify(err)}`,
          ELogType.error,
          '3',
        );
        setError(err);
      } finally {
        setLoading(false);
      }
    },
    [url],
  );

  return { response, loading, error, execute };
};
