import { EFetchMethods } from '@packages/enum';
import { IEventConfigJSON } from '@packages/types';
import { searchEventsGFW } from '../src/pipeline/ingest/events';

const SEARCH_URL = 'https://gateway.api.globalfishingwatch.org/v3/events';

const buildSearchConfig = (
  a_UrlParams: IEventConfigJSON['url_params'],
  a_BodyParams: IEventConfigJSON['body_params'],
): IEventConfigJSON => ({
  url: SEARCH_URL,
  method: EFetchMethods.post,
  url_params: a_UrlParams,
  body_params: a_BodyParams,
});

describe('searchEventsGFW', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  it('requests_the_configured_url_with_the_given_query_params_url_encoded', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ entries: [] }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    await searchEventsGFW(
      buildSearchConfig(
        { limit: 5, offset: 0 },
        {
          datasets: ['public-global-encounters-events:v3.0'] as any,
        },
      ),
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];

    expect(String(url)).toBe(`${SEARCH_URL}?limit=5&offset=0`);
    expect(init.method).toBe('POST');
    expect(init.headers.Authorization).toMatch(/^Bearer /);
  });

  it('sends_the_filters_as_a_JSON_body_not_query_params', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ entries: [] }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    await searchEventsGFW(
      buildSearchConfig(
        { limit: 20, offset: 0 },
        {
          datasets: ['public-global-encounters-events:v3.0'] as any,
          startDate: '2026-01-01',
          endDate: '2026-01-31',
          confidences: ['3', '4'],
        },
      ),
    );

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).not.toContain('startDate');
    expect(String(url)).not.toContain('confidences');
    const body = JSON.parse(init.body);
    expect(body.datasets).toEqual(['public-global-encounters-events:v3.0']);
    expect(body.startDate).toBe('2026-01-01');
    expect(body.confidences).toEqual(['3', '4']);
  });

  it('omits_undefined_query_params_from_the_query_string', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ entries: [] }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    await searchEventsGFW(
      buildSearchConfig(
        { limit: 5, offset: 0, sort: undefined },
        {
          datasets: ['public-global-encounters-events:v3.0'] as any,
        },
      ),
    );

    const [url] = fetchMock.mock.calls[0];
    expect(String(url)).not.toContain('sort');
  });

  it('returns_the_parsed_json_response_on_success', async () => {
    const payload = {
      entries: [{ type: 'encounter' }],
      total: 1,
      limit: 5,
      offset: 0,
      nextOffset: null,
      metadata: {
        datasets: [],
        vessels: [],
        dateRange: { from: null, to: null },
      },
    };
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => payload,
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const result = await searchEventsGFW(
      buildSearchConfig(
        { limit: 5, offset: 0 },
        {
          datasets: ['public-global-encounters-events:v3.0'] as any,
        },
      ),
    );

    expect(result).toEqual(payload);
  });

  it('throws_a_wrapped_error_when_the_response_is_not_ok', async () => {
    // 400 is a non-retryable status in fetchWithRetry (status < 500 &&
    // status !== 429) -- fails on the first attempt, not after a real
    // multi-second retry-with-backoff loop.
    const fetchMock = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: async () => 'bad request',
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    await expect(
      searchEventsGFW(
        buildSearchConfig(
          { limit: 5, offset: 0 },
          {
            datasets: ['public-global-encounters-events:v3.0'] as any,
          },
        ),
      ),
    ).rejects.toThrow('[eventsGFW] Error:');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
