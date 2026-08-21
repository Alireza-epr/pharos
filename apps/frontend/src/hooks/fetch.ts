import {
  EBaseRoutes,
  EContextLayers,
  EExportsRoutes,
  EFetchMethods,
  ELogType,
} from '@packages/enum';
import {
  IConfigJSON,
  IEventSchema,
  IResponse,
  TBodyParams_export,
  TQueryProgressMessage,
  TRegionOption,
} from '@packages/types';
import { log_frontend } from '@packages/utils';
import { useState, useCallback } from 'react';
import { getAPIConfig } from '.';
import { fetchWithAuth } from '../helpers/utils/apiUtils';
import { IExportBlob } from '../helpers/types/generalTypes';
import { useQueryProgressStore } from '../stores/queryProgressStore';

const { BASE_URL } = getAPIConfig();

// POST /v1/events streams its progress as NDJSON (see docs/api/query-contract.md):
// one `{ type: "step", ... }` line per checklist step, then one
// `{ type: "result", payload }` line carrying the same envelope this endpoint
// used to send in a single response. Reads chunks as they arrive and
// dispatches `step` lines into the progress store as they land; a line can
// straddle two chunks, so partial trailing text is buffered until its
// newline shows up.
const readProgressStream = async (
  a_Res: globalThis.Response,
  a_ApplyStep: ReturnType<typeof useQueryProgressStore.getState>['applyStep'],
): Promise<IResponse<IEventSchema> | undefined> => {
  const reader = a_Res.body?.getReader();
  // No streaming body available (e.g. a test double) — fall back to a single parse.
  if (!reader) return (await a_Res.json()) as IResponse<IEventSchema>;

  const decoder = new TextDecoder();
  let buffer = '';
  let result: IResponse<IEventSchema> | undefined;

  const handleLine = (a_Line: string) => {
    const message: TQueryProgressMessage<IEventSchema> = JSON.parse(a_Line);
    if (message.type === 'step') {
      // The backend only ever sends a short, generic message here (see
      // events.controllers.ts) — full detail stays server-side, on purpose.
      // Still worth a console trace for anyone debugging with ?loglevel=3.
      if (message.status === 'error') {
        log_frontend(
          `[useFetchEvents] Step "${message.id}" failed: ${message.error}`,
          ELogType.error,
          '3',
        );
      }
      a_ApplyStep(message);
    } else {
      result = message.payload;
    }
  };

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let newlineIndex: number;
    while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
      const line = buffer.slice(0, newlineIndex).trim();
      buffer = buffer.slice(newlineIndex + 1);
      if (line) handleLine(line);
    }
  }
  const trailing = buffer.trim();
  if (trailing) handleLine(trailing);

  return result;
};

export const useFetchEvents = () => {
  const url = `${BASE_URL}${EBaseRoutes.events}`;
  const [response, setResponse] = useState<IResponse<IEventSchema> | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const startProgress = useQueryProgressStore((s) => s.start);
  const applyStep = useQueryProgressStore((s) => s.applyStep);
  const failProgress = useQueryProgressStore((s) => s.fail);
  const finishProgress = useQueryProgressStore((s) => s.finish);

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
        startProgress();
        const res = await fetchWithAuth(`${url}?${params.toString()}`, options);
        const json = await readProgressStream(res, applyStep);
        setResponse(json ?? null);
        return json;
      } catch (err: any) {
        const message = err instanceof Error ? err.message : String(err);
        log_frontend(`[useFetchEvents] Error: ${message}`, ELogType.error, '3');
        setError(err);
        // A failure here can happen before the server ever wrote a `step`
        // line (network error, backend unreachable) — flag it on the
        // checklist too, or the modal would sit stuck at "pending" forever.
        failProgress(message);
      } finally {
        setLoading(false);
        // The request has settled one way or another — let ReportTab's Run
        // Query button return to normal instead of staying in its "a run is
        // in flight" state. Deliberately independent of whether the progress
        // modal is currently open or closed (see queryProgressStore).
        finishProgress();
      }
    },
    [url, startProgress, applyStep, failProgress, finishProgress],
  );

  return { response, loading, error, execute };
};

export const useFetchRegions = () => {
  const url = `${BASE_URL}${EBaseRoutes.regions}`;
  const [response, setResponse] = useState<IResponse<TRegionOption> | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (a_Dataset: EContextLayers) => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetchWithAuth(`${url}?dataset=${a_Dataset}`, {
          method: EFetchMethods.get,
        });
        const json: IResponse<TRegionOption> = await res.json();
        setResponse(json);
        return json;
      } catch (err: any) {
        const message = err instanceof Error ? err.message : String(err);
        log_frontend(`[useFetchRegions] Error: ${message}`, ELogType.error, '3');
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
