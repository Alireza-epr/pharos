import { useAppStore } from "@/stores/appStore";
import { EBaseRoutes, ELogType, ESystemRoutes } from "@packages/enum";
import { log_frontend } from "@packages/utils";
import { useEffect } from "react";
import { getAPIConfig } from ".";

const { BASE_URL, HEALTH_POLL_MS } = getAPIConfig()

// Polls the backend health endpoint on an interval and mirrors the result into
// the app store's backendStatus. The in-flight request is aborted on unmount.
// Pass enabled=false to skip polling (e.g. before login) while keeping the hook
// call unconditional so the Rules of Hooks hold.
export const useHealth = (a_Enabled = true) => {
    const setBackendStatus = useAppStore(s => s.setBackendStatus)
    const backendStatus = useAppStore(s => s.backendStatus)
    const url = `${BASE_URL}${EBaseRoutes.system}${ESystemRoutes.health}`

    useEffect(() => {
        if (!a_Enabled) return;

        const controller = new AbortController();

        const checkBackendStatus = async () => {
            try {
                const res = await fetch(url, { signal: controller.signal });
                if (!res.ok) throw new Error("[useHealth] Backend health check failed");
                const json = await res.json();
                if (!json.success) throw new Error("[useHealth] Backend health check failed");
                setBackendStatus(true);
            } catch (err) {
                // controller.abort() rejects the in-flight fetch with an AbortError on unmount
                if ((err as Error).name === "AbortError") return;
                log_frontend(err, ELogType.error);
                setBackendStatus(false);
            }
        };

        checkBackendStatus();
        const interval = setInterval(checkBackendStatus, HEALTH_POLL_MS);

        return () => {
            clearInterval(interval);
            controller.abort();
        };
    }, [a_Enabled, url, setBackendStatus]);

    return { backendStatus };
}
