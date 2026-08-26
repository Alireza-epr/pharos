import {
  listVesselsGFW,
  searchVesselsGFW,
} from '../src/pipeline/ingest/vessels';

// searchVesselsGFW/listVesselsGFW are the two Vessels API pass-through calls
// (GET /vessels/search, GET /vessels -- list by ids) -- same fetchWithRetry
// + URLSearchParams shape as detectionGFW's own 4Wings call, just against a
// different GFW path per verb. Mocked at global.fetch, same as
// fetchWithRetry.spec.ts, rather than mocking fetchWithRetry itself, so a
// real (small) retry/error-wrapping path is still exercised.
describe('searchVesselsGFW', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  it('requests_the_vessels_search_path_with_the_given_params_url_encoded', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ entries: [] }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    await searchVesselsGFW({
      query: 'sea hunter',
      limit: 5,
      'datasets[0]': 'public-global-vessel-identity:latest' as any,
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];

    expect(String(url)).toBe(
      'https://gateway.api.globalfishingwatch.org/v3/vessels/search?query=sea+hunter&limit=5&datasets%5B0%5D=public-global-vessel-identity%3Alatest',
    );
    expect(init.method).toBe('GET');
    expect(init.headers.Authorization).toMatch(/^Bearer /);
  });

  it('omits_undefined_params_from_the_query_string', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ entries: [] }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    await searchVesselsGFW({
      query: 'sea',
      where: undefined,
      since: undefined,
    } as any);

    const [url] = fetchMock.mock.calls[0];
    expect(String(url)).not.toContain('where');
    expect(String(url)).not.toContain('since');
  });

  it('returns_the_parsed_json_response_on_success', async () => {
    const payload = { entries: [{ dataset: 'public-global-vessel-identity:v4.0' }] };
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => payload,
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const result = await searchVesselsGFW({ query: 'sea' } as any);

    expect(result).toEqual(payload);
  });

  it('throws_a_wrapped_error_when_the_response_is_not_ok', async () => {
    // 400 is a non-retryable status in fetchWithRetry (status < 500 &&
    // status !== 429) -- fails on the first attempt, not after a real
    // multi-second retry-with-backoff loop (5 retries at 200ms+ each,
    // hardcoded inside fetchVesselsGFW, would otherwise make this slow).
    const fetchMock = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: async () => 'bad request',
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    await expect(searchVesselsGFW({ query: 'sea' } as any)).rejects.toThrow(
      '[vesselsGFW] Error:',
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe('listVesselsGFW', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  it('requests_the_vessels_root_path_not_the_search_path', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ entries: [] }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    await listVesselsGFW({
      'ids[0]': '2cb75b670-08a6-fc17-8fd9-5d9d10a0fbdf',
      'datasets[0]': 'public-global-vessel-identity:latest',
    } as any);

    const [url] = fetchMock.mock.calls[0];
    expect(String(url)).toContain(
      'https://gateway.api.globalfishingwatch.org/v3/vessels?',
    );
    expect(String(url)).not.toContain('/vessels/search');
    expect(String(url)).toContain('ids%5B0%5D=2cb75b670');
  });

  it('returns_the_parsed_json_response_on_success', async () => {
    const payload = {
      entries: [{ dataset: 'public-global-vessel-identity:v4.0' }],
      metadata: { idsFound: ['x'], idsNotFound: [] },
    };
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => payload,
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const result = await listVesselsGFW({ 'ids[0]': 'x' } as any);

    expect(result).toEqual(payload);
  });

  it('throws_a_wrapped_error_when_the_response_is_not_ok', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: async () => 'bad request',
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    await expect(listVesselsGFW({ 'ids[0]': 'x' } as any)).rejects.toThrow(
      '[vesselsGFW] Error:',
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
