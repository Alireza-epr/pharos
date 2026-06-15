import { useLoginStore } from "@/stores/loginStore";
import { EAuthRoutes, EBaseRoutes, EFetchMethods, ELogType } from "@packages/enum";
import { fetchWithRetry, log_frontend } from "@packages/utils";
import { useCallback, useState } from "react";
import { getAPIConfig } from ".";

const {BASE_URL, RETRIES, RETRY_DELAY} = getAPIConfig()

export const useLogin = () => {
    const url = `${BASE_URL}${EBaseRoutes.auth}${EAuthRoutes.login}`
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const setAccessToken = useLoginStore(s => s.setAccessToken)
    const setRefreshToken = useLoginStore(s => s.setRefreshToken)

    const execute = useCallback(async (a_Username: string, a_Password: string) => {
        const options = {
            method: EFetchMethods.post,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username: a_Username, password: a_Password }),
        }
        try {
            setLoading(true);
            setError(null);
            const res = await fetchWithRetry(url, options, RETRIES, RETRY_DELAY);
            const json = await res.json();
            setAccessToken(json.accessToken ?? "");
            setRefreshToken(json.refreshToken ?? "");
            setData(json);
            return json;
        } catch (err: any) {
            log_frontend(`[useLogin] Error: ${JSON.stringify(err)}`, ELogType.error, "3")
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [url, setAccessToken, setRefreshToken]);

    return { data, loading, error, execute };
}
