import { EBaseRoutes, EFetchMethods, ELogType, TURLParams } from "@packages/enum";
import { TBodyParams } from "@packages/types";
import { log_frontend } from "@packages/utils";
import { useState, useCallback } from "react";
import { getAPIConfig } from ".";
import { fetchWithAuth } from "../helpers/utils/apiUtils";

const { BASE_URL } = getAPIConfig()

export const useFetchEvents = () => {
    const url = `${BASE_URL}${EBaseRoutes.events}`
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const execute = useCallback(async (a_Method: EFetchMethods, a_URLParams: TURLParams, a_Body: TBodyParams) => {
        const params = new URLSearchParams(a_URLParams)
        const options = {
            method: a_Method,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(a_Body),
        }
        try {
            setLoading(true);
            setError(null);
            const res = await fetchWithAuth(`${url}?${params.toString()}`, options);
            const json = await res.json();
            setData(json);
            return json;
        } catch (err: any) {
            log_frontend(`[useFetchEvents] Error: ${JSON.stringify(err)}`, ELogType.error, "3")
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [url]);

    return { data, loading, error, execute };
}

