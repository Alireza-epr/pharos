// UI smoke test: load the app, run the default query (AOI satisfied by picking
// the first EEZ so the Run Query button activates), render the detections list,
// open an event, and confirm its details render.
//
// The backend is fully stubbed via page.route so the test is deterministic and
// needs no running API: only the calls the happy path makes are mocked.
import { test, expect, type Page } from 'playwright/test';
import { readFileSync } from 'node:fs';
import {
  EQueryStepId,
  EQueryStepStatus,
  EQuerySkipReason,
} from '@packages/enum';

// A fixed detections payload (real canonical events sliced from the backend
// fixtures) returned for the "Run Query" call.
const eventsResponse = JSON.parse(
  readFileSync(
    new URL('./fixtures/eventsResponse.json', import.meta.url),
    'utf-8',
  ),
) as { entries: { event_id: string }[] };

// POST /v1/events streams its progress as NDJSON (see docs/api/query-contract.md):
// one `step` line per checklist entry, then one `result` line carrying the
// same envelope this endpoint used to return in a single response. This
// mocks a `cache: disabled` run — cache-check/write-cache/read-cache are
// skipped — so the fixture also exercises the `skipped` step state.
const eventsProgressBody = (): string => {
  const count = eventsResponse.entries.length;
  const lines: Record<string, unknown>[] = [
    {
      type: 'step',
      id: EQueryStepId.validate,
      status: EQueryStepStatus.running,
    },
    {
      type: 'step',
      id: EQueryStepId.validate,
      status: EQueryStepStatus.success,
    },
    {
      type: 'step',
      id: EQueryStepId.cacheCheck,
      status: EQueryStepStatus.skipped,
      reason: EQuerySkipReason.cacheDisabled,
    },
    {
      type: 'step',
      id: EQueryStepId.fetchProvider,
      status: EQueryStepStatus.running,
    },
    {
      type: 'step',
      id: EQueryStepId.fetchProvider,
      status: EQueryStepStatus.success,
      meta: { count, rejected: 0 },
    },
    {
      type: 'step',
      id: EQueryStepId.writeCache,
      status: EQueryStepStatus.skipped,
      reason: EQuerySkipReason.cacheDisabled,
    },
    {
      type: 'step',
      id: EQueryStepId.readCache,
      status: EQueryStepStatus.skipped,
      reason: EQuerySkipReason.cacheDisabled,
    },
    {
      type: 'step',
      id: EQueryStepId.filterScope,
      status: EQueryStepStatus.running,
    },
    {
      type: 'step',
      id: EQueryStepId.filterScope,
      status: EQueryStepStatus.success,
      meta: { valid: count, total: count },
    },
    {
      type: 'step',
      id: EQueryStepId.filterPredicates,
      status: EQueryStepStatus.running,
    },
    {
      type: 'step',
      id: EQueryStepId.filterPredicates,
      status: EQueryStepStatus.success,
      meta: { matched: count, total: count },
    },
    {
      type: 'step',
      id: EQueryStepId.hotspots,
      status: EQueryStepStatus.running,
    },
    {
      type: 'step',
      id: EQueryStepId.hotspots,
      status: EQueryStepStatus.success,
      meta: { count: 0 },
    },
    {
      type: 'step',
      id: EQueryStepId.paginate,
      status: EQueryStepStatus.running,
    },
    {
      type: 'step',
      id: EQueryStepId.paginate,
      status: EQueryStepStatus.success,
      meta: { pageSize: count, total: count, currentPage: 1, totalPages: 1 },
    },
    { type: 'result', payload: eventsResponse },
  ];
  return lines.map((line) => JSON.stringify(line)).join('\n') + '\n';
};

// fetchWithAuth gates every authed request on backend health, so health must
// report success or the events request is never sent.
const healthResponse = { success: true };

// The EEZ/MPA dropdowns populate from GET /v1/regions?dataset=EEZ|MPA (see
// useFetchRegions / AreaOfInterest.tsx) rather than a static fixture, so the
// happy path needs at least one option per dataset to pick from.
const regionsResponse = (a_Dataset: 'EEZ' | 'MPA') => ({
  success: true,
  entries: [
    {
      type: 'Feature',
      properties: {
        id: `${a_Dataset.toLowerCase()}-1`,
        title: `Test ${a_Dataset} Region`,
      },
      bbox: [14.0, 55.0, 15.0, 56.0],
      geometry: { type: 'Point', coordinates: [14.5, 55.5] },
    },
  ],
});

// A persisted access token short-circuits the auth gate in App.tsx so the smoke
// test lands directly on the main UI. Matches zustand's persist envelope
// ({ state, version }) under the loginStore's "login" key.
const seedAuthToken = () => {
  window.localStorage.setItem(
    'login',
    JSON.stringify({
      state: {
        accessToken: 'e2e-test-token',
        refreshToken: 'e2e-refresh-token',
      },
      version: 0,
    }),
  );
};

// GET /v1/regions/geometry?dataset=...&id=... -- a *different*, more
// specific endpoint from the regions list above (see ERegionsRoutes.geometry),
// requested whenever a region's boundary needs drawing (map overlays,
// Detail-panel context layers). Without its own stub, this request falls
// through Playwright's routing to the real network: harmless against a
// clean environment (silently connection-refused, boundary just doesn't
// draw) but a real, reachable local backend on the same host/port -- e.g.
// from unrelated manual testing -- answers it for real, 401s on the smoke
// test's fake token, and cascades into a genuine auto-logout that has
// nothing to do with whatever the test was actually checking. Stubbing
// this closes that gap regardless of what else happens to be running.
const regionGeometryResponse = {
  success: true,
  entries: [
    {
      type: 'Feature',
      properties: {},
      geometry: { type: 'MultiPolygon', coordinates: [] },
    },
  ],
};

// POST /v1/vessels -- same base path for both the Vessel tab's own search
// and useVesselIdentity's on-demand lookup (differing by body/params, not
// sub-path). A matched detection's detail panel fires the identity lookup
// automatically on mount (VesselIdentityContext.tsx) -- without this stub
// it falls through to the real network exactly like the regions/geometry
// gap above, and a reachable local backend answers it for real, 401s, and
// cascades into the same auto-logout.
const vesselIdentityResponse = { success: true, entries: [] };

// POST /v1/events/search -- same auto-fires-on-mount reasoning as the
// vessels stub above, but for useVesselRelevantEvents.ts (DetailEvents.tsx)
// instead of vessel identity. A default empty response here; tests that
// care about actual relevant-events content register their own more
// specific page.route() for this same pattern afterward, which Playwright
// matches first (most-recently-registered route wins).
const emptyEventsSearchResponse = {
  success: true,
  limit: 5,
  offset: 0,
  nextOffset: null,
  total: 0,
  metadata: { datasets: [], vessels: [], dateRange: { from: null, to: null } },
  entries: [],
};

const stubBackend = async (page: Page) => {
  await page.route('**/system/health*', (route) =>
    route.fulfill({ json: healthResponse }),
  );
  await page.route('**/report*', (route) =>
    route.fulfill({
      body: eventsProgressBody(),
      contentType: 'application/x-ndjson',
    }),
  );
  await page.route('**/regions/geometry*', (route) =>
    route.fulfill({ json: regionGeometryResponse }),
  );
  await page.route('**/regions*', (route) => {
    const dataset = new URL(route.request().url()).searchParams.get('dataset');
    route.fulfill({ json: regionsResponse(dataset === 'MPA' ? 'MPA' : 'EEZ') });
  });
  await page.route('**/vessels*', (route) =>
    route.fulfill({ json: vesselIdentityResponse }),
  );
  await page.route('**/events/search*', (route) =>
    route.fulfill({ json: emptyEventsSearchResponse }),
  );
};

// Loads the app and satisfies the AOI requirement (picking the first EEZ) so
// the Run Query button is enabled — shared setup for every test below.
const openReadyToQuery = async (page: Page) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  // 1) UI loads on the Report tab with the query controls present.
  const runQuery = page.getByTestId('run-query-button');
  await expect(runQuery).toBeVisible();
  // AOI is required: the button stays disabled until an area is chosen.
  await expect(runQuery).toBeDisabled();

  // 2) Expand the Area of Interest section: it is collapsed by default, so
  // its controls (including the EEZ dropdown) are hidden until opened.
  await page.getByTestId('aoi-section-header').click();

  // 3) Satisfy the AOI requirement by picking the first EEZ from the
  // dropdown. It's a searchable combobox (see DropdownInput's
  // SearchableSelect), not a native <select>: focusing it opens a listbox
  // of options, and clicking one commits it.
  const eezInput = page.getByTestId('eez-select');
  await eezInput.click();
  const firstEezOption = page.getByRole('option').first();
  await expect(firstEezOption).toBeVisible();
  const firstEezLabel = await firstEezOption.textContent();
  await firstEezOption.click();
  expect(firstEezLabel).toBeTruthy();
  await expect(eezInput).toHaveValue(firstEezLabel!);

  // The button activates once an AOI is set.
  await expect(runQuery).toBeEnabled();

  return runQuery;
};

test.describe('UI_smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(seedAuthToken); // bypass login before app scripts run
    await stubBackend(page);
  });

  test('load_UI_run_default_query_render_list_open_event_details', async ({
    page,
  }) => {
    const runQuery = await openReadyToQuery(page);

    // 4) Run the query and wait for the (mocked) events response.
    const eventsCall = page.waitForResponse('**/report*');
    await runQuery.click();
    await eventsCall;

    // 4b) The step-by-step progress modal walks through the checklist —
    // including a couple of steps skipped because caching was off for this
    // run — and stays open until the user dismisses it.
    await expect(
      page.getByTestId('query-progress-step-paginate'),
    ).toHaveAttribute('data-status', 'success');
    await expect(
      page.getByTestId('query-progress-step-cache-check'),
    ).toHaveAttribute('data-status', 'skipped');
    await page.screenshot({
      path: './test-artifacts/query-progress-modal.png',
      fullPage: true,
    });
    await page.getByTestId('modal-close-button').click();
    await expect(page.getByTestId('modal-close-button')).toBeHidden();

    // 5) The detections list renders one row per returned event.
    const rows = page.getByTestId('detection-row');
    await expect(rows).toHaveCount(eventsResponse.entries.length);
    await expect(page.getByTestId('detections-title')).toContainText(
      `(${eventsResponse.entries.length})`,
    );

    // 6) Open the first row's details. The list is sorted client-side, so verify
    // the panel against the row we actually clicked (not the fixture order):
    // capture the row's truncated event id (shortenText(id, 10) -> "<10 chars>...").
    const firstRow = rows.first();
    const rowIdPrefix = (
      await firstRow.getByTestId('detection-row-id').innerText()
    )
      .trim()
      .replace(/\.\.\.$/, '');
    expect(rowIdPrefix.length).toBeGreaterThan(0);

    await firstRow.getByTestId('event-details-button').click();

    // The detail panel shows the selected event's Event ID field
    // (shortenText(id, 30)), which starts with the same prefix as the row.
    await expect(page.getByTestId('detail-event-id')).toHaveValue(
      new RegExp('^' + rowIdPrefix),
    );

    // 7) Clear empties the results list (and the map, which reads the same
    // eventStore.events) without touching the search form.
    const clearButton = page.getByTestId('clear-results-button');
    await expect(clearButton).toBeEnabled();
    await clearButton.click();
    await expect(rows).toHaveCount(0);
    await expect(clearButton).toBeDisabled();

    // Capture a screenshot of the final state as evidence of the happy path.
    await page.screenshot({
      path: './test-artifacts/ui-smoke.png',
      fullPage: true,
    });
  });

  test('close_progress_modal_before_it_finishes_reopens_without_starting_a_second_request', async ({
    page,
  }) => {
    // Stall the events response until the test releases it, so the request
    // is still in flight when the modal is closed. The detection provider
    // allows only one concurrent report per token and doesn't reliably stop
    // a report already accepted just because our connection dropped, so the
    // regression to guard here is a second request firing at all — not
    // whether the first one can be cancelled.
    let releaseResponse: () => void = () => {};
    const responseGate = new Promise<void>((resolve) => {
      releaseResponse = resolve;
    });
    let callCount = 0;
    await page.route('**/report*', async (route) => {
      callCount++;
      await responseGate;
      await route.fulfill({
        body: eventsProgressBody(),
        contentType: 'application/x-ndjson',
      });
    });

    const runQuery = await openReadyToQuery(page);
    await runQuery.click();

    // The request is in flight: the button shows its own loading state and
    // the progress modal is open.
    await expect(runQuery).toBeDisabled();
    await expect(page.getByTestId('modal-close-button')).toBeVisible();

    // Close before the query finishes — the run keeps going in the
    // background. The button must neither stay stuck loading/disabled nor
    // fall back to a plain, re-clickable "Run Query": it switches to a
    // distinct "view progress" label that stays enabled.
    await page.getByTestId('modal-close-button').click();
    await expect(page.getByTestId('modal-close-button')).toBeHidden();
    await expect(runQuery).toBeEnabled();
    await expect(runQuery).toHaveText('View Progress');

    // Clicking it again must reopen the same run, not fire a second request.
    await runQuery.click();
    await expect(page.getByTestId('modal-close-button')).toBeVisible();
    expect(callCount).toBe(1);

    // Let the stalled response resolve — once the run actually finishes, the
    // button returns to a normal, re-clickable "Run Query".
    releaseResponse();
    await expect(
      page.getByTestId('query-progress-step-paginate'),
    ).toHaveAttribute('data-status', 'success');
    await expect(runQuery).toHaveText('Run Query');
    await expect(runQuery).toBeEnabled();
  });

  test('keyboard_only_walkthrough_reaches_and_operates_the_core_controls', async ({
    page,
  }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // 1) The AOI section starts collapsed. Its header is a real disclosure
    // widget (Section.tsx): focusable, and Enter toggles it via aria-expanded
    // -- not just a mouse target.
    const aoiHeader = page.getByTestId('aoi-section-header');
    await aoiHeader.focus();
    await expect(aoiHeader).toBeFocused();
    await expect(aoiHeader).toHaveAttribute('aria-expanded', 'false');
    await page.keyboard.press('Enter');
    await expect(aoiHeader).toHaveAttribute('aria-expanded', 'true');

    // 2) The EEZ combobox (DropdownInput's SearchableSelect) is keyboard-
    // operable end to end: focusing it already opens it (onFocus triggers
    // openWithFreshQuery -- no key needed to open), then Enter commits the
    // highlighted (first, by default) option.
    const eezInput = page.getByTestId('eez-select');
    await eezInput.focus();
    await expect(page.getByRole('option').first()).toBeVisible();
    await page.keyboard.press('Enter');
    await expect(eezInput).not.toHaveValue('');

    // 3) Run the query without ever touching the mouse.
    const runQuery = page.getByTestId('run-query-button');
    await runQuery.focus();
    await expect(runQuery).toBeEnabled();
    const eventsCall = page.waitForResponse('**/report*');
    await page.keyboard.press('Enter');
    await eventsCall;

    // 4) Opening the progress modal must move focus into it (Modal.tsx) --
    // a keyboard user must never be left focused on a now-hidden trigger --
    // and Escape must close it and hand focus back to that trigger.
    const modalClose = page.getByTestId('modal-close-button');
    await expect(modalClose).toBeVisible();
    await expect(page.locator('[role="dialog"]')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(modalClose).toBeHidden();
    await expect(runQuery).toBeFocused();

    // 5) The detections list rendered. A sortable column header is
    // keyboard-operable (BottomPanel.tsx): Enter toggles aria-sort exactly
    // like clicking it would.
    const rows = page.getByTestId('detection-row');
    await expect(rows).toHaveCount(eventsResponse.entries.length);

    const idHeader = page.getByRole('columnheader', {
      name: /Event ID/i,
    });
    await idHeader.focus();
    await expect(idHeader).not.toHaveAttribute('aria-sort');
    await page.keyboard.press('Enter');
    await expect(idHeader).toHaveAttribute('aria-sort', 'ascending');

    // 6) A detection row is keyboard-focusable and Enter selects it, exactly
    // like the mouse-driven smoke test's click does — this is the "results
    // list" step of the plan's required sidebar -> results -> details chain.
    const firstRow = rows.first();
    const rowIdPrefix = (
      await firstRow.getByTestId('detection-row-id').innerText()
    )
      .trim()
      .replace(/\.\.\.$/, '');
    expect(rowIdPrefix.length).toBeGreaterThan(0);

    await firstRow.focus();
    await expect(firstRow).toBeFocused();
    await page.keyboard.press('Enter');

    await expect(page.getByTestId('detail-event-id')).toHaveValue(
      new RegExp('^' + rowIdPrefix),
    );
  });

  test('event_tab_search_renders_results_with_no_console_errors', async ({
    page,
  }) => {
    // POST /v1/events/search -- a plain JSON response (no NDJSON progress
    // stream, unlike the Report tab's /v1/report), matching TEventSearchResponse.
    await page.route('**/events/search*', (route) =>
      route.fulfill({
        json: {
          success: true,
          limit: 20,
          offset: 0,
          nextOffset: null,
          total: 1,
          metadata: {
            datasets: ['public-global-encounters-events:v3.0'],
            vessels: [],
            dateRange: { from: null, to: null },
          },
          entries: [
            {
              id: 'event-1',
              type: 'encounter',
              start: '2026-01-01T14:30:00Z',
              end: '2026-01-03T18:45:00Z',
              position: { lat: 55.26, lon: 14.11 },
              vessel: { id: 'v1', name: 'SEA HUNTER', ssvid: '503707100' },
              encounter: {
                vessel: {
                  id: 'v2',
                  name: 'COLD CARRIER',
                  flag: 'PAN',
                  type: 'carrier',
                  ssvid: '412345678',
                },
                medianDistanceKilometers: 0.4,
                medianSpeedKnots: 1.1,
                type: 'FISHING-CARRIER',
              },
            },
          ],
        },
      }),
    );

    // Regression guard: this is exactly the kind of bug a real browser
    // catches that typecheck/lint/unit tests don't -- e.g. the duplicate
    // React key warning from two dropdown options sharing value: ''.
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });

    await page.getByTestId('sidebar-tab-event').click();

    const runQuery = page.getByTestId('event-search-button');
    await expect(runQuery).toBeVisible();
    // Datasets is required: the button stays disabled until one is checked.
    await expect(runQuery).toBeDisabled();

    // Event Search starts collapsed, same as the Report tab's AOI section --
    // expand it, then its own nested "Datasets" field (same collapsed-by-
    // default SectionItem shape as Filter.tsx's own Datasets block, which
    // this mirrors), before the checkboxes inside are interactable.
    await page.getByTestId('event-search-section-header').click();
    await page.getByRole('button', { name: 'Datasets' }).click();

    // CheckboxInput visually hides the real <input> off-canvas behind a
    // custom styled box (a standard accessible-checkbox pattern) -- click
    // the enclosing <label> instead, same as a real user clicking the
    // visible box (native label/input association forwards the click).
    await page.locator('label', { hasText: 'Encounters' }).click();
    await expect(runQuery).toBeEnabled();

    const clearButton = page.getByTestId('event-clear-button');
    await expect(clearButton).toBeDisabled();

    const eventsSearchCall = page.waitForResponse('**/events/search*');
    await runQuery.click();
    await eventsSearchCall;

    await expect(page.getByTestId('event-result-row')).toHaveCount(1);
    await expect(page.getByTestId('event-result-row')).toContainText(
      'SEA HUNTER',
    );

    // The subtitle shows the date-only start - end range, not the raw
    // timestamps -- no time of day (no ':') even though start/end differ.
    await expect(page.getByTestId('event-result-row')).toContainText(
      '2026-01-01 - 2026-01-03',
    );

    // Every result is drawn on the map as soon as the search returns -- no
    // separate "pin" step -- adding an "Event" swatch to the same legend box
    // that already explains Matched/Unmatched/Clustered, etc.
    await expect(page.getByTestId('event-markers-legend')).toContainText(
      'Event',
    );

    // Selecting the row (list -> map half of the selection sync) rings its
    // marker -- useGfwEventMarkers.ts's L_SELECTED layer, which shares the
    // same legend row (and --color-primary-purple6 style) the SAR-detection
    // selection ring already uses.
    await expect(page.getByTestId('event-markers-legend')).not.toContainText(
      'Selected',
    );
    await page.getByTestId('event-result-row').click();
    await expect(page.getByTestId('event-result-row')).toHaveAttribute(
      'data-active',
      'true',
    );
    await expect(page.getByTestId('event-markers-legend')).toContainText(
      'Selected',
    );

    // Re-clicking the active row deselects it, same as re-clicking an
    // active marker on the map.
    await page.getByTestId('event-result-row').click();
    await expect(page.getByTestId('event-markers-legend')).not.toContainText(
      'Selected',
    );

    // "Go to" (next to the export "+") always selects -- unlike the row's
    // own click, it never toggles off -- and pans the map to the event.
    await page.getByTestId('event-result-go-to').click();
    await expect(page.getByTestId('event-result-row')).toHaveAttribute(
      'data-active',
      'true',
    );
    await expect(page.getByTestId('event-markers-legend')).toContainText(
      'Selected',
    );
    await page.getByTestId('event-result-go-to').click();
    await expect(page.getByTestId('event-result-row')).toHaveAttribute(
      'data-active',
      'true',
    );

    // Clear empties the list and the map together -- both read the same
    // gfwEventStore.events.
    await expect(clearButton).toBeEnabled();
    await clearButton.click();
    await expect(page.getByTestId('event-result-row')).toHaveCount(0);
    await expect(page.getByTestId('event-markers-legend')).not.toBeVisible();
    await expect(clearButton).toBeDisabled();

    expect(consoleErrors).toEqual([]);
  });

  test('detail_tab_shows_relevant_events_for_a_matched_detections_vessel', async ({
    page,
  }) => {
    // total (7) exceeds what one page returns, so hasMore is true and the
    // "check the Events tab" message renders with the correct remaining
    // count (7 - 1 = 6).
    const relevantEvent = {
      id: 'relevant-event-1',
      type: 'encounter',
      start: '2026-01-02T00:00:00Z',
      end: '2026-01-02T01:00:00Z',
      position: { lat: 55.2, lon: 14.4 },
      vessel: { id: 'v1', name: 'FIRST ENCOUNTER', ssvid: '111111111' },
    };

    const requestBodies: Record<string, unknown>[] = [];
    await page.route('**/events/search*', (route) => {
      requestBodies.push(JSON.parse(route.request().postData() ?? '{}'));
      route.fulfill({
        json: {
          success: true,
          limit: 5,
          offset: 0,
          nextOffset: 5,
          total: 7,
          metadata: { datasets: [], vessels: [], dateRange: { from: null, to: null } },
          entries: [relevantEvent],
        },
      });
    });

    const runQuery = await openReadyToQuery(page);
    const eventsCall = page.waitForResponse('**/report*');
    await runQuery.click();
    await eventsCall;
    await page.getByTestId('modal-close-button').click();

    // The fixture's first entry (event_id starting "dfc71c0f4f") is the one
    // matched detection whose raw_metadata.vesselId is known ahead of time
    // -- located by that id rather than row position/sort order (the table
    // sorts by triage_score by default, not fetch order), the gate
    // DetailEvents.tsx itself needs (only a matched detection carries a
    // vessel id).
    const matchedRow = page
      .getByTestId('detection-row')
      .filter({ hasText: 'dfc71c0f4f' });
    const relevantEventsCall = page.waitForResponse('**/events/search*');
    await matchedRow.getByTestId('event-details-button').click();
    await relevantEventsCall;

    // The query is exactly what DetailEvents.tsx promises: every dataset,
    // only this vessel, sorted latest-first, capped at 5 -- not the Event
    // tab form's own filters. The frontend's own outbound envelope wraps
    // the GFW filters in body_params (see useFetchGfwEvents' `rest` --
    // {url, method, body_params} -- Pharos' backend forwards body_params
    // on to GFW, it isn't flattened over the wire).
    const firstBody = requestBodies[0]?.body_params as
      | { vessels?: string[]; datasets?: unknown[] }
      | undefined;
    expect(firstBody?.vessels).toEqual([
      '369fc1e02-2678-b669-af58-b2f3ae66a515',
    ]);
    expect(firstBody?.datasets?.length).toBe(5);

    await expect(page.getByTestId('event-result-row')).toHaveCount(1);
    await expect(page.getByTestId('event-result-row')).toContainText(
      'FIRST ENCOUNTER',
    );

    // The section starts collapsed even though data already arrived, but
    // the fetched event is already on the map regardless -- no separate
    // "show on map" step, same as the Event tab's own results.
    await expect(
      page.getByTestId('detail-events-section-header'),
    ).toHaveAttribute('aria-expanded', 'false');
    await expect(page.getByTestId('event-markers-legend')).toContainText(
      'Event',
    );

    // Expand the section to reach its row actions.
    await page.getByTestId('detail-events-section-header').click();

    // "Go to" selects the event (highlighted row + map ring) and pans the
    // map there -- shared with the Event tab's own list (EventList.tsx).
    await page.getByTestId('event-result-go-to').click();
    await expect(page.getByTestId('event-result-row')).toHaveAttribute(
      'data-active',
      'true',
    );
    await expect(page.getByTestId('event-markers-legend')).toContainText(
      'Selected',
    );

    // No in-place "More" here (removed) -- with 6 more events than the
    // 5-per-page limit shows, DetailEvents.tsx instead points at the Event
    // tab's own Prev/Next to continue this exact search.
    await expect(page.getByTestId('detail-events-section-header')).toBeVisible();
    await expect(page.getByText(/6 more event\(s\) found/)).toBeVisible();
    await expect(page.getByText(/check the Events tab/)).toBeVisible();
    await expect(page.getByTestId('detail-events-more-button')).toHaveCount(0);

    // Renamed from "Event Results" (EventResults.tsx's own title) to just
    // "Events" for this box.
    await expect(
      page.getByTestId('detail-events-section-header'),
    ).toContainText('Events');
  });
});
