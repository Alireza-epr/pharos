export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const fetchWithRetry = async (
  a_URL: string | URL | Request,
  a_Init: RequestInit | undefined,
  a_Retries: number,
  a_Delay: number,
): Promise<Response> => {
  let currentDelay = a_Delay;

  for (let attempt = 1; attempt <= a_Retries; attempt++) {
    try {
      const response = await fetch(a_URL, a_Init);

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
