import config from '../../config/globalFishingWatch.json';
import { ELogLevel } from '../../enum/generlaEnum';
import { EFetchMethods } from '../../enum/gfwEnum';
import { IConfigJSON } from '../../types/eventTypes';
import {
    I4wingsReportGetURLParams,
    I4wingsReportPostBodyParams,
    I4wingsReportPostURLParams,
    IEventGetURLParams,
    IEventPostBodyParams,
    IEventPostURLParams,
    T4wingsSource,
    TEventSource,
} from '../../types/gfwTypes';
import { log, sleep } from '../../utils/generalUtils';

export const detectionPostGFW = async <T>(
    a_BaseURL: string,
    a_Source: T4wingsSource | TEventSource,
    a_URLParam: I4wingsReportPostURLParams | IEventPostURLParams,
    a_BodyParam: I4wingsReportPostBodyParams | IEventPostBodyParams,
) => {
    const metadata: IConfigJSON = {
        source: a_Source,
        base_url: a_BaseURL,
        method: EFetchMethods.post,
        url_params: a_URLParam,
        body_params: a_BodyParam,
    };
    const token = config.token;
    const searchParams = Object.entries(a_URLParam).reduce<
        Record<string, string>
    >((acc, [key, value]) => {
        acc[key] = String(value);
        return acc;
    }, {});

    const params = new URLSearchParams(searchParams);
    log('[detectionPostGFW] Metadata', metadata);
    try {
        const res = await fetchWithRetry(`${a_BaseURL}?${params.toString()}`, {
            method: metadata.method,
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: a_BodyParam ? JSON.stringify(a_BodyParam) : null,
        }, 5, 200);

        if (!res.ok) {
            throw `response not ok`;
        }

        const results: T = await res.json();
        log('[detectionPostGFW] Response', results);

        return {
            metadata,
            results,
        };
    } catch (error) {
        throw new Error(`[detectionPostGFW] Error: ${error}`);
    }

};

export const detectionGetGFW = async <T>(
    a_BaseURL: string,
    a_Source: T4wingsSource | TEventSource,
    a_URLParam: I4wingsReportGetURLParams | IEventGetURLParams,
) => {
    const metadata: IConfigJSON = {
        source: a_Source,
        base_url: a_BaseURL,
        method: EFetchMethods.get,
        url_params: a_URLParam,
        body_params: null,
    };
    const token = config.token;
    const searchParams = Object.entries(a_URLParam).reduce<
        Record<string, string>
    >((acc, [key, value]) => {
        acc[key] = String(value);
        return acc;
    }, {});

    const params = new URLSearchParams(searchParams);
    log('[detectionGetGFW] Metadata', metadata);
    try {
        const res = await fetchWithRetry(`${a_BaseURL}?${params.toString()}`, {
            method: metadata.method,
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        }, 5, 200);

        if (!res.ok) {
            throw `response not ok`;
        }

        const results: T = await res.json();
        log('[detectionGetGFW] Response', results);

        return {
            metadata,
            results,
        };
    } catch (error) {
        throw new Error(`[detectionGetGFW] Error: ${error}`);
    }
};

export const fetchWithRetry = async (
    a_URL: string | URL | Request,
    a_Init: RequestInit | undefined,
    a_Retries: number,
    a_Delay: number
): Promise<Response> => {

    let currentDelay = a_Delay;

    for (let attempt = 1; attempt <= a_Retries; attempt++) {
        try {

            const response = await fetch(a_URL, a_Init);

            if (!response.ok) {

                const txt = await response.text();

                if (response.status < 500 && response.status !== 429) {
                    throw new Error(
                        `Non-retryable error ${response.status}: ${txt}`
                    );
                }

                throw new Error(
                    `Retryable error ${response.status}: ${txt} (${attempt}/${a_Retries})`
                );
            }

            return response;

        } catch (error) {

            if (attempt === a_Retries) {
                log(`[fetchWithRetry] Giving up after ${a_Retries} attempts`, error, ELogLevel.error);
                throw error;
            }

            log(`[fetchWithRetry] Attempt ${attempt} failed`, error, ELogLevel.error);

            await sleep(currentDelay);
            currentDelay *= 2;
        }
    }

    throw new Error("[fetchWithRetry] failed unexpectedly");
};