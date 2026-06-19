import { useAppStore } from '@/stores/appStore';
import { EBaseRoutes, ELogType, ESystemRoutes } from '@packages/enum';
import { log_frontend } from '@packages/utils';
import { useEffect } from 'react';
import { getAPIConfig } from '.';

const { BASE_URL, HEALTH_POLL_MS } = getAPIConfig();

const HEALTH_URL = `${BASE_URL}${EBaseRoutes.system}${ESystemRoutes.health}`;

// Hits the backend health endpoint once and mirrors the result into the app
// store's backendStatus (which drives the Online/Offline chip). Returns whether
// the backend is healthy so callers can gate work on it. Pass a signal to make
// the request abortable; an AbortError is treated as "not healthy" without
// overwriting the stored status (used by the unmounting poll below).
export const checkHealth = async (a_Signal?: AbortSignal): Promise<boolean> => {
  const setBackendStatus = useAppStore.getState().setBackendStatus;
  try {
    const res = await fetch(HEALTH_URL, { signal: a_Signal ?? null });
    if (!res.ok) throw new Error('[checkHealth] Backend health check failed');
    const json = await res.json();
    if (!json.success)
      throw new Error('[checkHealth] Backend health check failed');
    setBackendStatus(true);
    return true;
  } catch (err) {
    // controller.abort() rejects the in-flight fetch with an AbortError on unmount
    if ((err as Error).name === 'AbortError') return false;
    log_frontend(err, ELogType.error);
    setBackendStatus(false);
    return false;
  }
};

// Polls the backend health endpoint on an interval and mirrors the result into
// the app store's backendStatus. The in-flight request is aborted on unmount.
// Pass enabled=false to skip polling (e.g. before login) while keeping the hook
// call unconditional so the Rules of Hooks hold.
export const useHealth = (a_Enabled = true) => {
  const backendStatus = useAppStore((s) => s.backendStatus);

  useEffect(() => {
    if (!a_Enabled) return;

    const controller = new AbortController();

    checkHealth(controller.signal);
    const interval = setInterval(
      () => checkHealth(controller.signal),
      HEALTH_POLL_MS,
    );

    return () => {
      clearInterval(interval);
      controller.abort();
    };
  }, [a_Enabled]);

  return { backendStatus };
};
