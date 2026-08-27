import { fetchWithRetry } from '@packages/utils';

// fetchWithRetry is shared by the frontend (fetchWithAuth) and the backend
// (detectionGFW) — an AbortController.abort() from either side (e.g. closing
// the query progress modal, or the server reacting to a client disconnect)
// must stop it immediately instead of sleeping through the remaining retries
// against an already-cancelled signal.
describe('fetchWithRetry', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('rethrows_an_abort_error_immediately_without_retrying', async () => {
    const abortError = new DOMException(
      'The operation was aborted.',
      'AbortError',
    );
    const fetchMock = jest.fn().mockRejectedValue(abortError);
    global.fetch = fetchMock as unknown as typeof fetch;

    await expect(fetchWithRetry('https://example.com', {}, 5, 1)).rejects.toBe(
      abortError,
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('still_retries_a_retryable_5xx_response_up_to_the_given_limit', async () => {
    const response = {
      ok: false,
      status: 503,
      text: async () => 'unavailable',
    } as Response;
    const fetchMock = jest.fn().mockResolvedValue(response);
    global.fetch = fetchMock as unknown as typeof fetch;

    await expect(
      fetchWithRetry('https://example.com', {}, 3, 1),
    ).rejects.toBeDefined();
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('returns_the_response_on_the_first_success', async () => {
    const response = { ok: true } as Response;
    const fetchMock = jest.fn().mockResolvedValue(response);
    global.fetch = fetchMock as unknown as typeof fetch;

    await expect(fetchWithRetry('https://example.com', {}, 3, 1)).resolves.toBe(
      response,
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('gives_up_on_a_request_that_never_responds_once_the_timeout_elapses', async () => {
    const fetchMock = jest.fn(
      (_url: unknown, init?: RequestInit) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () =>
            reject(init.signal!.reason),
          );
        }),
    );
    global.fetch = fetchMock as unknown as typeof fetch;

    await expect(
      fetchWithRetry('https://example.com', {}, 1, 1, 10),
    ).rejects.toBeDefined();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
