export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const fetchWithRetry = async (
  a_URL: string | URL | Request,
  a_Init: RequestInit | undefined,
  a_Retries: number,
  a_Delay: number,
  a_TimeoutMs?: number,
): Promise<Response> => {
  let currentDelay = a_Delay;

  for (let attempt = 1; attempt <= a_Retries; attempt++) {
    try {
      const timeoutSignal = a_TimeoutMs
        ? AbortSignal.timeout(a_TimeoutMs)
        : undefined;
      const signal =
        timeoutSignal && a_Init?.signal
          ? AbortSignal.any([a_Init.signal, timeoutSignal])
          : (timeoutSignal ?? a_Init?.signal);
      const response = await fetch(a_URL, { ...a_Init, signal });

      if (!response.ok) {
        const txt = await response.text();

        if (response.status < 500 && response.status !== 429) {
          throw new Error(`Non-retryable error ${response.status}: ${txt}`);
        }

        throw new Error(
          `Retryable error ${response.status}: ${txt} (${attempt}/${a_Retries})`,
        );
      }

      return response;
    } catch (error) {
      // An aborted request (AbortController.abort(), e.g. the caller gave up
      // waiting) is never worth retrying — rethrow immediately instead of
      // sleeping and trying again on an already-cancelled signal.
      if ((error as Error).name === "AbortError") {
        throw error;
      }

      if ((error as Error).message.includes("Non-retryable error")) {
        throw `[fetchWithRetry] Error: ${error}`;
      }

      if (attempt === a_Retries) {
        throw `[fetchWithRetry] Giving up after ${a_Retries} attempts ${error})}`;
      }

      await sleep(currentDelay);
      currentDelay *= 2;
    }
  }

  throw new Error("[fetchWithRetry] failed unexpectedly");
};
