import {
  EBaseRoutes,
  EExportsRoutes,
  EFetchMethods,
  ELogType,
} from '@packages/enum';
import {
  IConfigJSON,
  IEventSchema,
  IResponse,
  TBodyParams_export,
} from '@packages/types';
import { log_frontend } from '@packages/utils';
import { useState, useCallback } from 'react';
import { getAPIConfig } from '.';
import { fetchWithAuth } from '../helpers/utils/apiUtils';
import { IExportBlob } from '../helpers/types/generalTypes';

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
        const message = err instanceof Error ? err.message : String(err);
        log_frontend(
          `[useFetchEvents] Error: ${message}`,
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

export const useFetchExportEvents = () => {
  const url = `${BASE_URL}${EBaseRoutes.exports}${EExportsRoutes.events}`;
  const [response, setResponse] = useState<IExportBlob | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (a_Body: TBodyParams_export): Promise<IExportBlob | undefined> => {
      const options = {
        method: EFetchMethods.post,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(a_Body),
      };
      try {
        setLoading(true);
        setError(null);
        const res = await fetchWithAuth(url, options);

        // The endpoint streams a binary zip on success but returns the JSON
        // IResponse envelope on error, so branch on res.ok before parsing.
        if (!res.ok) {
          const json: IResponse<never> = await res.json();
          throw new Error(json.error?.join(', ') ?? `HTTP ${res.status}`);
        }

        // The server names the file via Content-Disposition (<exportId>.zip);
        // fall back to a generic name if the header is missing.
        const filename =
          res.headers
            .get('Content-Disposition')
            ?.match(/filename="?([^"]+)"?/)?.[1] ?? 'export.zip';

        const exportBlob: IExportBlob = {
          filename,
          blob: await res.blob(),
        };
        setResponse(exportBlob);
        return exportBlob;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        log_frontend(
          `[useFetchExportEvents] Error: ${message}`,
          ELogType.error,
          '3',
        );
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [url],
  );

  return { response, loading, error, execute };
};
