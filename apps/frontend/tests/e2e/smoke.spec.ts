// UI smoke test: load the app, run the default query (AOI satisfied by picking
// the first EEZ so the Run Query button activates), render the detections list,
// open an event, and confirm its details render.
//
// The backend is fully stubbed via page.route so the test is deterministic and
// needs no running API: only the calls the happy path makes are mocked.
import { test, expect, type Page } from 'playwright/test';
import { readFileSync } from 'node:fs';

// A fixed detections payload (real canonical events sliced from the backend
// fixtures) returned for the "Run Query" call.
const eventsResponse = JSON.parse(
  readFileSync(new URL('./fixtures/eventsResponse.json', import.meta.url), 'utf-8'),
) as { entries: { event_id: string }[] };

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
      properties: { id: `${a_Dataset.toLowerCase()}-1`, title: `Test ${a_Dataset} Region` },
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

const stubBackend = async (page: Page) => {
  await page.route('**/system/health*', (route) =>
    route.fulfill({ json: healthResponse }),
  );
  await page.route('**/events*', (route) =>
    route.fulfill({ json: eventsResponse }),
  );
  await page.route('**/regions*', (route) => {
    const dataset = new URL(route.request().url()).searchParams.get('dataset');
    route.fulfill({ json: regionsResponse(dataset === 'MPA' ? 'MPA' : 'EEZ') });
  });
};

test.describe('UI_smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(seedAuthToken); // bypass login before app scripts run
    await stubBackend(page);
  });

  test('load_UI_run_default_query_render_list_open_event_details', async ({
    page,
  }) => {
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

    // 4) Run the query and wait for the (mocked) events response.
    const eventsCall = page.waitForResponse('**/events*');
    await runQuery.click();
    await eventsCall;

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
    const rowIdPrefix = (await firstRow.getByTestId('detection-row-id').innerText())
      .trim()
      .replace(/\.\.\.$/, '');
    expect(rowIdPrefix.length).toBeGreaterThan(0);

    await firstRow.getByTestId('event-details-button').click();

    // The detail panel shows the selected event's Event ID field
    // (shortenText(id, 30)), which starts with the same prefix as the row.
    await expect(page.getByTestId('detail-event-id')).toHaveValue(
      new RegExp('^' + rowIdPrefix),
    );

    // Capture a screenshot of the final state as evidence of the happy path.
    await page.screenshot({ path: './test-artifacts/ui-smoke.png', fullPage: true });
  });
});
