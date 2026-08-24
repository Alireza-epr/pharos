import { ELogType, EURLParams } from '@packages/enum';
import { getURLParam, log_frontend, stripHiddenConfiguration } from '@packages/utils';
import { THydrateResult } from '../types/URLTypes';
import { importConfigWithRegionPreload, isValidConfig } from './configUtils';
import { IConfigJSON } from '@packages/types';

/**
 * Generic helpers for round-tripping a JSON-serializable value through a
 * single URL query-string parameter. Deliberately dependency-free (no
 * stores, no DOM) so it's usable -- and unit-testable -- independently of
 * *what* it's carrying; urlConfigUtils.ts is what wires this specifically
 * to IConfigJSON.
 *
 * Percent-encoding itself is left to the caller's URLSearchParams (set()
 * encodes, get() decodes automatically) -- these two only stringify/parse
 * the JSON and guard its size, so the encoding step never gets applied
 * twice.
 */

// A conservative budget for the ENTIRE url, not just this one param's value
// -- shared hosting/CDN layers commonly cap total request-line length well
// under what a browser itself would tolerate. Leaves headroom for the
// origin/path and any other params (loglevel, cache, ...) alongside it.
export const MAX_URL_LENGTH = 7500;

/**
 * JSON-stringifies a_Value, guarding against a value whose *percent-encoded*
 * form (what it'll actually occupy once placed in a URL) would push the
 * budget above MAX_URL_LENGTH. Returns null (and logs) instead of ever
 * letting a caller put something oversized on the URL -- a silently
 * truncated or host-rejected URL is worse than no URL sync at all.
 */
export const encodeJSONForURL = (a_Value: unknown): string | null => {
  const json = JSON.stringify(a_Value);
  if (encodeURIComponent(json).length > MAX_URL_LENGTH) {
    log_frontend(
      `[urlParamCodec] Encoded value would be ${encodeURIComponent(json).length} chars, over the ${MAX_URL_LENGTH}-char budget -- skipping URL sync for it.`,
      ELogType.warn,
    );
    return null;
  }
  return json;
};

/**
 * Reverses encodeJSONForURL. a_Value is the already percent-decoded string
 * (e.g. from URLSearchParams.get()). Returns null (never throws) on
 * anything that isn't valid JSON -- a hand-edited, stale, or foreign URL is
 * user input to validate, not a programming error to crash on.
 */
export const decodeJSONFromURL = (a_Value: string): unknown => {
  try {
    return JSON.parse(a_Value);
  } catch {
    return null;
  }
};

export const syncConfigToURL = (a_Config: IConfigJSON): void => {
  const [stripped] = stripHiddenConfiguration([a_Config]);
  const json = encodeJSONForURL(stripped ?? a_Config);
  if (json === null) return;

  const url = new URL(window.location.href);
  url.searchParams.set(EURLParams.config, json);
  window.history.replaceState(null, '', url.toString());
};

/**
 * Reads the `config` URL param (if any) and, when it decodes to a valid
 * IConfigJSON, applies it to every section's store via
 * importConfigWithRegionPreload() -- the same entry point the "Import
 * config" file button uses. Never throws; the caller (useURLConfigSync)
 * decides what 'invalid' means to the user.
 */
export const hydrateConfigFromURL = async (): Promise<THydrateResult> => {
  const raw = getURLParam<string>(EURLParams.config);
  if (raw === null) return 'absent';

  const decoded = decodeJSONFromURL(raw);
  if (!isValidConfig(decoded)) return 'invalid';

  await importConfigWithRegionPreload(decoded);
  return 'hydrated';
};