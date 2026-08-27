export const getAPIConfig = () => {
  const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_VERSION}`;
  // env vars are always strings -> coerce the numeric ones (with safe defaults)
  const RETRIES = Number(import.meta.env.VITE_API_RETRIES ?? 3);
  const RETRY_DELAY = Number(import.meta.env.VITE_API_RETRY_DELAY ?? 500);
  const HEALTH_POLL_MS = Number(
    import.meta.env.VITE_API_HEALTH_POLL_MS ?? 30000,
  );
   const REQUEST_TIMEOUT_MS = Number(
    import.meta.env.VITE_API_REQUEST_TIMEOUT_MS ?? 30000,
  );

  return {
    BASE_URL,
    RETRIES,
    RETRY_DELAY,
    HEALTH_POLL_MS,
    REQUEST_TIMEOUT_MS,
  };
};
