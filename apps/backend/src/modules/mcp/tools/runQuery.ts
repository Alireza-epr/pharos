import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { EFetchMethods, EGeoJSONGeometryType } from '@packages/enum';
import { config } from '../../../config/api';
import { generateToken } from '../../../helpers/utils/tokenUtils';
import { ERequestUserRole } from '../../../helpers/enum/tokenEnum';
import { log } from '../../../helpers/utils/backendUtils';
import { ELogType } from '../../../helpers/types/generalTypes';
import pilotConfig from '../../../config/pilot.json';

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

// Same small Baltic-Sea box as config/pilot.json's own default AOI -- a
// sane, bounded default so a no-argument call is a real but modest live
// query, not an accidental "the whole ocean" fetch against the provider.
const DEFAULT_BBOX = { min_lon: 14.09, min_lat: 55.08, max_lon: 14.69, max_lat: 55.27 };

const toDateOnly = (a_Date: Date): string => a_Date.toISOString().slice(0, 10);

const bboxToGeoJSON = (a_Box: {
  min_lon: number;
  min_lat: number;
  max_lon: number;
  max_lat: number;
}) => ({
  type: EGeoJSONGeometryType.Polygon,
  coordinates: [
    [
      [a_Box.min_lon, a_Box.min_lat],
      [a_Box.max_lon, a_Box.min_lat],
      [a_Box.max_lon, a_Box.max_lat],
      [a_Box.min_lon, a_Box.max_lat],
      [a_Box.min_lon, a_Box.min_lat],
    ],
  ],
});

// The NDJSON contract every /v1/report response uses (ProgressStream) --
// one line per query step, and always a final `{ type: 'result', payload }`
// line carrying the same envelope controllerResponse would have sent in one
// shot. This tool only wants that last line.
const parseResultLine = (a_Text: string): any | null => {
  for (const line of a_Text.split('\n')) {
    if (!line.trim()) continue;
    try {
      const parsed = JSON.parse(line);
      if (parsed?.type === 'result') return parsed.payload;
    } catch {
      // Not JSON (or a partial line) -- ignore, keep scanning.
    }
  }
  return null;
};

/**
 * `run_query` -- calls this same backend's real `POST /v1/report`, the exact
 * endpoint the web UI itself calls, over a real loopback HTTP request. No
 * duplicated query/scoring logic: this is a thin adapter, not a second
 * implementation of the serving path.
 *
 * Auth: `/v1/report` sits behind the user-facing JWT flow, which an AI agent
 * has no login session for. Since this call never leaves the process (same
 * host, same port), it mints its own short-lived, read-only token via the
 * same `generateToken()` the real login flow uses, rather than inventing a
 * second auth mechanism or skipping auth internally.
 */
export const registerRunQueryTool = (a_Server: McpServer) => {
  a_Server.registerTool(
    'run_query',
    {
      title: 'Run a Pharos detection query',
      description:
        'Runs a real SAR-detection query against the live Pharos backend ' +
        '(the same POST /v1/report endpoint the web UI calls -- a real ' +
        'provider fetch on a cache miss, so this can take several seconds). ' +
        'Returns detections with their AIS match status and triage/' +
        'uncertainty scores. IMPORTANT: "unmatched" means not matched to ' +
        'the public AIS data used by the detection provider -- it is a ' +
        'triage signal only, never a claim of illegal activity or a ' +
        'confirmed "dark vessel". Scores exist to prioritize review, not as ' +
        'risk indicators.',
      inputSchema: {
        min_lon: z.number().optional().describe('Bounding box west edge (degrees). Defaults to the pilot AOI (Baltic Sea) if any bbox field is omitted.'),
        min_lat: z.number().optional().describe('Bounding box south edge (degrees).'),
        max_lon: z.number().optional().describe('Bounding box east edge (degrees).'),
        max_lat: z.number().optional().describe('Bounding box north edge (degrees).'),
        date_from: z.string().optional().describe('Start date, YYYY-MM-DD. Defaults to 7 days ago.'),
        date_to: z.string().optional().describe('End date, YYYY-MM-DD. Defaults to today.'),
        matched: z
          .boolean()
          .optional()
          .describe(
            'true = only AIS-matched detections, false = only AIS-unmatched (the triage-relevant ones), omit = both.',
          ),
        limit: z
          .number()
          .int()
          .min(1)
          .max(MAX_LIMIT)
          .optional()
          .describe(`Max detections to return (default ${DEFAULT_LIMIT}, max ${MAX_LIMIT}).`),
      },
    },
    async (args) => {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const dateFrom = args.date_from ?? toDateOnly(weekAgo);
      const dateTo = args.date_to ?? toDateOnly(now);
      const hasCustomBbox =
        args.min_lon !== undefined ||
        args.min_lat !== undefined ||
        args.max_lon !== undefined ||
        args.max_lat !== undefined;
      const bbox = hasCustomBbox
        ? {
            min_lon: args.min_lon ?? DEFAULT_BBOX.min_lon,
            min_lat: args.min_lat ?? DEFAULT_BBOX.min_lat,
            max_lon: args.max_lon ?? DEFAULT_BBOX.max_lon,
            max_lat: args.max_lat ?? DEFAULT_BBOX.max_lat,
          }
        : DEFAULT_BBOX;
      const limit = args.limit ?? DEFAULT_LIMIT;

      const urlParams = new URLSearchParams({
        format: 'JSON',
        'temporal-resolution': 'HOURLY',
        'spatial-resolution': 'HIGH',
        'group-by': 'VESSEL_ID',
        'datasets[0]': 'public-global-sar-presence:v3.0',
        'date-range': `${dateFrom}T00:00:00Z,${dateTo}T23:59:59Z`,
      });
      if (args.matched !== undefined) {
        // The recoverable-filter expression language is an IN-clause, not
        // key="value" equality -- see `parseInClauseValues` in
        // servingUtils.ts (`\bmatched\b in \(([^)]*)\)`). Got this wrong on
        // the first pass (matched="..." silently matched nothing, no error).
        urlParams.set('filters[0]', `matched in ('${args.matched}')`);
      }

      // A deliberately partial config -- eventsController falls back to
      // config/pilot.json for threshold/sort/hotspot/filter when they're
      // absent (validateBodyParams treats all of them as optional), so this
      // only needs to supply what actually changes per call. URL is the one
      // exception: unlike those, the controller does NOT default it from
      // pilot.json, so it must be passed explicitly or the provider fetch
      // fails with "Failed to parse URL from undefined".
      const body = {
        URL: pilotConfig.URL,
        method: EFetchMethods.post,
        body_params: { geojson: bboxToGeoJSON(bbox) },
        pagination: { limit, offset: 0 },
        cache: 'enabled',
      };

      // Read-only, short-lived, minted for this one internal call -- not a
      // real login session (no AI agent has one). See doc comment above.
      const token = generateToken({
        username: 'mcp-agent',
        role: ERequestUserRole.readOnly,
      });

      try {
        const res = await fetch(
          `http://127.0.0.1:${config.port}/v1/report?${urlParams.toString()}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body),
          },
        );

        const text = await res.text();
        const payload = parseResultLine(text);

        if (!payload || payload.success !== true) {
          const message = payload?.error ?? `HTTP ${res.status}`;
          return {
            content: [{ type: 'text', text: `Query failed: ${JSON.stringify(message)}` }],
            isError: true,
          };
        }

        const summary = {
          note:
            '"unmatched" = not matched to the public AIS data the provider ' +
            'used - a triage signal only, not a claim of illegal activity.',
          total: payload.pagination?.total ?? (payload.entries?.length ?? 0),
          returned: payload.entries?.length ?? 0,
          cache: payload.metadata?.cache,
          detections: (payload.entries ?? []).map((a_Event: any) => ({
            event_id: a_Event.event_id,
            lon: a_Event.lon,
            lat: a_Event.lat,
            timestamp_utc: a_Event.timestamp_utc,
            matched: a_Event.matched_flag,
            triage_score: a_Event.scoring?.triage_score,
            uncertainty_score: a_Event.scoring?.uncertainty_score,
          })),
        };

        return {
          content: [{ type: 'text', text: JSON.stringify(summary, null, 2) }],
        };
      } catch (err) {
        log(`[MCP] run_query internal call failed: ${err}`, ELogType.error);
        return {
          content: [{ type: 'text', text: `Query failed: ${String(err)}` }],
          isError: true,
        };
      }
    },
  );
};
