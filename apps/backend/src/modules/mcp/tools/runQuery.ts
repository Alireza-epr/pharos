import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import {
  EContextLayers,
  EFetchMethods,
  EGeoJSONGeometryType,
  ERegionDatasets,
} from '@packages/enum';
import { config } from '../../../config/api';
import { generateToken } from '../../../helpers/utils/tokenUtils';
import { ERequestUserRole } from '../../../helpers/enum/tokenEnum';
import { log } from '../../../helpers/utils/backendUtils';
import { ELogType } from '../../../helpers/types/generalTypes';
import pilotConfig from '../../../config/pilot.json';

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

type TRegionType = 'eez' | 'mpa';

// /v1/regions (the name lookup) keys its `dataset` query param off
// EContextLayers ("EEZ"/"MPA"); /v1/report's body_params.region keys its own
// `dataset` off the differently-valued ERegionDatasets
// ("public-eez-areas"/"public-mpa-all"). Two real enums for the same two
// concepts -- this tool's `region_type` is the one string an agent supplies,
// mapped to whichever of the two the call in question actually needs.
const CONTEXT_LAYER_BY_REGION_TYPE: Record<TRegionType, EContextLayers> = {
  eez: EContextLayers.eez,
  mpa: EContextLayers.mpa,
};
const REGION_DATASET_BY_REGION_TYPE: Record<TRegionType, ERegionDatasets> = {
  eez: ERegionDatasets.eez,
  mpa: ERegionDatasets.mpa,
};

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

type TResolveRegionResult =
  | { ok: true; id: string; title: string }
  | { ok: false; message: string };

// Resolves a *name* to a real region id by actually searching /v1/regions --
// never trusts an agent-supplied id, since an LLM has no legitimate way to
// know Pharos's internal EEZ/MPA ids (arbitrary database keys, not public
// knowledge) and would otherwise have to invent a plausible-looking one.
const resolveRegionId = async (
  a_RegionType: TRegionType,
  a_RegionName: string,
  a_Token: string,
): Promise<TResolveRegionResult> => {
  const dataset = CONTEXT_LAYER_BY_REGION_TYPE[a_RegionType];
  const label = a_RegionType.toUpperCase();

  let payload: any;
  try {
    const res = await fetch(
      `http://127.0.0.1:${config.port}/v1/regions?dataset=${dataset}`,
      { headers: { Authorization: `Bearer ${a_Token}` } },
    );
    payload = await res.json();
  } catch (err) {
    return {
      ok: false,
      message: `Could not load the ${label} region list: ${String(err)}`,
    };
  }

  if (!payload?.success) {
    return {
      ok: false,
      message: `Could not load the ${label} region list: ${JSON.stringify(payload?.error ?? 'unknown error')}`,
    };
  }

  const needle = a_RegionName.trim().toLowerCase();
  const matches = (payload.entries ?? []).filter((a_Entry: any) =>
    String(a_Entry?.properties?.title ?? '')
      .toLowerCase()
      .includes(needle),
  );

  if (matches.length === 0) {
    return {
      ok: false,
      message: `No ${label} region matched "${a_RegionName}". Try a shorter or differently-worded name (e.g. the country name alone).`,
    };
  }
  if (matches.length > 1) {
    const names = matches.slice(0, 10).map((a_M: any) => a_M.properties.title);
    return {
      ok: false,
      message:
        `"${a_RegionName}" matched ${matches.length} ${label} regions - be more ` +
        `specific. Candidates: ${names.join(', ')}${matches.length > 10 ? ', ...' : ''}`,
    };
  }

  return {
    ok: true,
    id: matches[0].properties.id,
    title: matches[0].properties.title,
  };
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
 *
 * AOI: an agent can express the area two ways -- a raw bounding box (for a
 * landmark/strait/canal with no formal boundary; the agent estimates it),
 * or a named EEZ/MPA (for "a country's waters" / "a named protected area").
 * The *name* is all the agent ever supplies for the second case -- the real
 * id is resolved server-side against /v1/regions, never trusted from the
 * agent, since an LLM has no way to actually know Pharos's internal ids.
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
        aoi: z
          .union([
            z
              .object({
                type: z.literal('bbox'),
                min_lon: z.number().describe('West edge (degrees).'),
                min_lat: z.number().describe('South edge (degrees).'),
                max_lon: z.number().describe('East edge (degrees).'),
                max_lat: z.number().describe('North edge (degrees).'),
              })
              .describe(
                'A raw bounding box. Use this for a place with no formal ' +
                  'EEZ/MPA boundary - a strait, canal, or other landmark ' +
                  '(e.g. the Strait of Hormuz, the Suez Canal) - estimating ' +
                  'reasonable coordinates yourself.',
              ),
            z
              .object({
                type: z.literal('region'),
                region_type: z
                  .enum(['eez', 'mpa'])
                  .describe(
                    '"eez" for a country\'s waters, "mpa" for a named Marine Protected Area.',
                  ),
                region_name: z
                  .string()
                  .describe(
                    'The region\'s name, or a close match (e.g. "Iran" for the ' +
                      "Islamic Republic of Iran's EEZ) - a name, never a " +
                      'database id. It is looked up against the real dataset ' +
                      'by name; an ambiguous or unmatched name is reported back ' +
                      'as an error rather than guessed.',
                  ),
              })
              .describe(
                'A named Exclusive Economic Zone or Marine Protected Area. ' +
                  "Use this when the request names a country's waters or a " +
                  'specific protected area, rather than a landmark with no ' +
                  'formal boundary.',
              ),
          ])
          .describe(
            'The area to query - either a bounding box or a named EEZ/MPA region.',
          ),
        date_from: z
          .string()
          .optional()
          .describe('Start date, YYYY-MM-DD. Defaults to 7 days ago.'),
        date_to: z
          .string()
          .optional()
          .describe('End date, YYYY-MM-DD. Defaults to today.'),
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
          .describe(
            `Max detections to return (default ${DEFAULT_LIMIT}, max ${MAX_LIMIT}).`,
          ),
      },
    },
    async (args) => {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const dateFrom = args.date_from ?? toDateOnly(weekAgo);
      const dateTo = args.date_to ?? toDateOnly(now);
      const limit = args.limit ?? DEFAULT_LIMIT;

      // Read-only, short-lived, minted for this one internal call -- not a
      // real login session (no AI agent has one). See doc comment above.
      // Reused for both the /v1/regions lookup (region AOI only) and the
      // /v1/report call below.
      const token = generateToken({
        username: 'mcp-agent',
        role: ERequestUserRole.readOnly,
      });

      let bodyParams: {
        geojson?: unknown;
        region?: { dataset: ERegionDatasets; id: string };
      };
      let resolvedRegionTitle: string | undefined;

      if (args.aoi.type === 'region') {
        const resolved = await resolveRegionId(
          args.aoi.region_type,
          args.aoi.region_name,
          token,
        );
        if (!resolved.ok) {
          return {
            content: [{ type: 'text', text: resolved.message }],
            isError: true,
          };
        }
        bodyParams = {
          region: {
            dataset: REGION_DATASET_BY_REGION_TYPE[args.aoi.region_type],
            id: resolved.id,
          },
        };
        resolvedRegionTitle = resolved.title;
      } else {
        bodyParams = { geojson: bboxToGeoJSON(args.aoi) };
      }

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
        body_params: bodyParams,
        pagination: { limit, offset: 0 },
        cache: 'enabled',
      };

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
            content: [
              {
                type: 'text',
                text: `Query failed: ${JSON.stringify(message)}`,
              },
            ],
            isError: true,
          };
        }

        const summary = {
          note:
            '"unmatched" = not matched to the public AIS data the provider ' +
            'used - a triage signal only, not a claim of illegal activity.',
          ...(resolvedRegionTitle && { region: resolvedRegionTitle }),
          total: payload.pagination?.total ?? payload.entries?.length ?? 0,
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
