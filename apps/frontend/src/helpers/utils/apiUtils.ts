import { useLoginStore } from '../../stores/loginStore';
import { useAppStore } from '../../stores/appStore';
import { useMessageStore } from '../../stores/messageStore';
import { getAPIConfig } from '../../hooks';
import { checkHealth } from '../../hooks/system';
import {
  EAuthRoutes,
  EBaseRoutes,
  EFetchMethods,
  ELogType,
  EResponseError,
} from '@packages/enum';
import { fetchWithRetry, log_frontend } from '@packages/utils';

const { BASE_URL, RETRIES, RETRY_DELAY } = getAPIConfig();

// A single refresh can be shared across concurrent (in-flight) requests so a
// burst of 401s triggers only one /auth/refresh call.
let refreshInFlight: Promise<string | null> | null = null;

const requestRefresh = async (): Promise<string | null> => {
  const { refreshToken, setAccessToken, logout } = useLoginStore.getState();
  const { setError } = useMessageStore.getState();
  if (!refreshToken) return null;
  try {
    const res = await fetch(
      `${BASE_URL}${EBaseRoutes.auth}${EAuthRoutes.refresh}`,
      {
        method: EFetchMethods.post,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      },
    );
    if (!res.ok) {
      // Surface WHY the refresh failed so the login screen can tell an expired
      // session ("please log in again") apart from a generic failure.
      const body = (await res.json().catch(() => null)) as {
        error?: string[];
      } | null;
      const expired = !!body?.error?.includes(EResponseError.RefreshTokenExpired);
      setError(
        expired ? EResponseError.RefreshTokenExpired : EResponseError.Failed,
      );
      logout();
      return null;
    }
    const json = await res.json();
    setAccessToken(json.accessToken ?? '');
    return json.accessToken ?? null;
  } catch (err) {
    log_frontend(
      `[requestRefresh] Error: ${JSON.stringify(err)}`,
      ELogType.error,
      '3',
    );
    // Network/parse failure (not a token-expiry case) -> clear the session so
    // the app routes back to login and show a generic error.
    setError(EResponseError.Failed);
    logout();
    return null;
  }
};

const refreshAccessToken = (): Promise<string | null> => {
  if (!refreshInFlight) {
    refreshInFlight = requestRefresh().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
};

// General authed-fetch wrapper: injects the current access token at call-time
// (no stale closures), retries transient errors with backoff via fetchWithRetry,
// and transparently refreshes the access token once on a 401.
export const fetchWithAuth = async (
  a_URL: string,
  a_Init: RequestInit,
): Promise<Response> => {
  // Gate every authed request on backend health. Read the cached status once;
  // if it's down, re-verify against the health endpoint (which also re-syncs the
  // Online/Offline chip, since health is polled over HTTP rather than the
  // websocket) and reject the request when the backend is still unreachable.
  const online = useAppStore.getState().backendStatus || (await checkHealth());
  if (!online) throw new Error('[fetchWithAuth] Backend unavailable');

  const withAuth = (a_Token: string): RequestInit => ({
    ...a_Init,
    headers: {
      ...(a_Init.headers as Record<string, string> | undefined),
      Authorization: `Bearer ${a_Token}`,
    },
  });

  const token = useLoginStore.getState().accessToken;
  try {
    return await fetchWithRetry(a_URL, withAuth(token), RETRIES, RETRY_DELAY);
  } catch (err) {
    if (String(err).includes('401')) {
      const newToken = await refreshAccessToken();
      if (newToken)
        return fetchWithRetry(a_URL, withAuth(newToken), RETRIES, RETRY_DELAY);
    }
    throw err;
  }
};
