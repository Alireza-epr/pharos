# Event Search (GFW Events API Integration)

## 1. Overview

Global Fishing Watch exposes vessel-behavior events - encounters, loitering,
port visits, AIS gaps, and fishing events - as a separate resource from the
gridded SAR/AIS detections the Report tab queries (4Wings) and from vessel
identity (Vessels API). This document covers the Events API endpoint Pharos
integrates and the feature built on it: the **Event tab** (search),
independent of the Report tab and the map.

Full request/response contract:
[query-contract.md](../api/query-contract.md#events-search) (`Events
Search`).

### A note on naming

Pharos's own domain object is already called an "event" (`IEventSchema`, a
SAR detection - see [event-schema.md](../data/event-schema.md)). GFW's
Events API returns a *different* kind of "event" - vessel behavior, not a
detection. This collision predates this feature (the type contract for it,
`EEventType`/`EEventDatasets`/`TGlobalEvent` in `packages/types`/
`packages/enum`'s `gfwTypes.ts`/`gfwEnum.ts`, already existed, unused, before
the Event tab was built) and isn't renamed away here - see CLAUDE.md's own
note on it. Concretely:

- **Backend** has no collision: SAR detections are named `report`/
  `Detection*` throughout (`modules/report`, `DetectionService`,
  `repositories/detection`) - `/v1/report` was renamed from `/v1/events` to
  free the name up for this feature's `modules/events` (`POST
  /v1/events/search`), `EventService`, `repositories/event`.
- **Frontend** does collide: `eventStore.ts`/`useEventStore` already means
  the Report tab's SAR detections, and is referenced far too widely to
  rename as part of this feature. The Event tab's own stores are prefixed
  `gfwEvent*` instead - `gfwEventSearchStore.ts`/`useGfwEventSearchStore`
  (search form state) and `gfwEventStore.ts`/`useGfwEventStore` (results/
  pagination/selection). Components (`EventTab.tsx`, `EventSearch.tsx`,
  `EventResults.tsx`, `EventExportAndImportConfig.tsx`) and the URL param
  (`eventConfig`) stay unprefixed, since nothing else claims those names.

---

## 2. Event tab (search)

A left-sidebar tab, next to Report and Vessels, for searching GFW's Events
API directly - independent of any SAR detection or the Vessel tab, but with
two deliberate, opt-in/shared bridges to the Report tab (Time Range and an
AOI checkbox - see below). Same three-section shape as the Vessel tab:
**Search** (`EventSearch.tsx`) / **Results** (`EventResults.tsx`) /
**Export/Import Config** (`EventExportAndImportConfig.tsx`), backed by
`POST /v1/events/search`, sent as an `IEventConfigJSON` - `url`/`method`/
`url_params` (limit/offset/sort)/`body_params` (the actual filters), built
by `buildEventSearchConfig()`; see
[query-contract.md](../api/query-contract.md#events-search) for the request
shape.

> **Corrected from an earlier draft:** this section originally modeled the
> Event tab's fields around a GET-style contract (a single `types` value,
> `include-regions`, `confidences` as a comma string). Checked against GFW's
> own maintained Python client and corrected - see
> [query-contract.md](../api/query-contract.md#events-search)'s own
> correction note for the full detail. `types` is dropped by design (see
> below), `include-regions` doesn't exist on this endpoint at all, and
> `confidences`/`encounterTypes`/`vesselTypes` are arrays, not scalars.

### Query fields

Every field GFW's Events API POST-body contract defines
(`IEventPostBodyParams`) is exposed - the "Author call" scope decision for
this feature was to expose the full field set, not a curated subset:

| Field           | Sends              | Notes                                                                 |
| --------------- | ------------------- | ---------------------------------------------------------------------- |
| Datasets        | `body_params.datasets` | Per-dataset checkbox + version row, mirroring the Report tab's own Filter.tsx "Datasets" block exactly - friendly event-type labels (`EEventDatasetsUI`), not raw dataset ids. **Required** - the only thing that gates Run Query (see below) |
| Vessels         | `body_params.vessels` | One comma-separated free-text field, split into an array - no vessel-id autocomplete this iteration |
| From / To       | `body_params.startDate`/`endDate` | **Not a separate Event-tab field** - reuses the Report tab's own Time Range block (`useTimeRangeStore`) directly, same defaults, so it's always populated |
| Use Report AOI  | `body_params.geometry` or `.region` | Checkbox, disabled unless the Report tab currently has an AOI set (drawn shape or EEZ/MPA region) - see below |
| Confidence      | `body_params.confidences` | Multi-select of `2`/`3`/`4` - **applies only to port_visits events**, sent regardless of which datasets are selected (see query-contract.md's correction note) |
| Encounter Type  | `body_params.encounterTypes` | Multi-select, 13 options - disabled unless the Encounters dataset is checked |
| Vessel Types    | `body_params.vesselTypes` | Multi-select, GFW's own 10-value `EEventVesselType` list - **not** Pharos's `EVessleType` (that one carries a `NotApplicable`/`""` member this endpoint doesn't accept) |
| Vessel Groups   | `body_params.vesselGroups` | One comma-separated free-text field, split into an array |
| Flags           | `body_params.flags` | Multi-select, reuses the Report tab's own `flags_options` (ISO3 codes) |
| Duration        | `body_params.duration` | Minimum event duration in minutes; `0` (the default) omits the field entirely |
| Sort            | `url_params.sort`   | Raw `+field`/`-field` text, e.g. `+start`                              |
| Limit           | `url_params.limit`  | Page size, default 20 (this app's own default - GFW's own client defaults to 99999) |

`datasets` is sent as the full versioned dataset id
(`public-global-encounters-events:v3.0`, etc.) - a per-dataset version
picker is exposed (mirroring Filter.tsx), defaulting every dataset to
`v3.0`, matching the version already hardcoded elsewhere in this codebase
(`samples.ts`, `filterStore.ts`).

`types` (GFW's own event-type filter, separate from `datasets`) is
deliberately never sent - see "Datasets, not Event Type" below.

### Datasets, not Event Type

**Author call:** the Event tab has no separate "Event Type" field. Each GFW
event dataset is already type-specific (the encounters dataset only ever
returns encounter events, etc.), so selecting "Loitering" in the Datasets
picker already fully determines which event types are queried - a second
`types` filter on top would be redundant for anything the UI needs. The
Datasets field's *labels* read as event types (`EEventDatasetsUI`: Fishing,
Encounters, Loitering, Port Visits, AIS Gaps) precisely so a user picks by
the concept they care about, without needing to know GFW's own
dataset-vs-type distinction exists underneath.

### The Report AOI bridge

**Author call:** two pieces of state are deliberately *shared* with the
Report tab, not duplicated:

- **Time Range** (`useTimeRangeStore`) - the Event tab's From/To fields are
  the exact same store the Report tab's own Time Range block reads and
  writes. Changing the date range on either tab changes it for both. This
  was a direct instruction, not an inference: reuse the existing control
  and its defaults (last month → now) rather than build a second,
  independent date range with its own state.
- **AOI** (`useAOIStore`) - opt-in via a checkbox, disabled unless the
  Report tab currently has an AOI set (`Boolean(eezActive || mpaActive ||
  feature)`, the identical gate `ReportTab.tsx` uses for its own Run Query
  button). When checked and a shape is drawn, it becomes `body_params.geometry`;
  when checked and an EEZ/MPA region is selected, it becomes
  `body_params.region` (`{dataset, id}` - GFW's own region reference shape,
  no buffer field, so a configured region buffer does not carry over).
  Unlike Time Range, this is **opt-in, not shared by default** - an Event
  search with the checkbox unset ignores whatever AOI the Report tab has.

Because every filter (including `geometry`/`region`) lives in the POST
body, there was never a GET/POST branch to build here (unlike the Report
tab's own AOI, which switches its *own* request between GET and POST
depending on whether a shape is drawn) - the Events endpoint is POST-only
regardless of whether the AOI checkbox is used at all.

**Import/export fully replaces AOI and Time Range, never merges.** Since
both are shared state, importing an Event Search Config file, applying an
Event tab History entry, or hydrating the `eventConfig` URL param all call
one shared function, `importEventAOIAndTimeRange()`
(`eventConfigUtils.ts`), which:

- Sets `dateFrom`/`dateTo` unconditionally from the imported
  `startDate`/`endDate` (stripping the trailing `Z` back off to the
  datetime-local shape those fields expect, falling back to `''` if
  somehow absent) - same "always overwrite" semantics
  `useTimeRangeStore.importTimeRange()` itself already has for the Report
  tab.
- Converts an imported `geometry`/`region` back into `useAOIStore`'s own
  `TAOIQuery` shape and calls `importAOI()` with it - **or, when the
  imported config has neither, calls `importAOI(null)` to clear the
  current AOI entirely.** A config with no AOI must not silently leave
  whatever the Report tab had set; it replaces it with "none," exactly like
  the Report tab's own import replaces its own AOI unconditionally.
- Sets `useReportAOI` (the Event tab's own checkbox) to match: **checked**
  when the imported config carries a `geometry`/`region`, unchecked when it
  doesn't - so the checkbox always reflects what the restored config
  actually contains, rather than whatever it happened to be set to before
  the import ran.
- Preloads the right EEZ/MPA option list first when importing a region
  reference (same `loadRegionOptions()` call, same reasoning, as
  `configUtils.ts`'s own `importConfigWithRegionPreload()`) so the restored
  selection can actually resolve, even on a URL hydrate that runs before
  `AreaOfInterest.tsx`'s own mount-time fetch would have.

### Run Query gate: datasets-only

**Author call:** Run Query is enabled once ≥1 dataset is selected - nothing
else is required (no vessel, no region). This mirrors GFW's own contract
(datasets is the one truly required field) and the Vessel tab's own
minimal-gate precedent, rather than layering an app-specific restriction on
top. Date range is never actually blank regardless, since it's always
populated from `useTimeRangeStore`'s own default (last month → now) - so in
practice every search already carries a date range without the gate having
to enforce it explicitly. Result size is still naturally bounded by
`limit`/`offset` pagination per request.

### Pagination is plain offset/limit paging

Unlike the Vessel tab's forward-only scroll cursor (`since`), GFW's Events
API uses ordinary offset/limit paging (`offset`/`limit` request params,
`nextOffset`/`total` in the response) - simpler:

- **Next** - if the page was already fetched earlier in this session,
  served from an in-memory cache (`pages` in `gfwEventStore`), no request.
  If not, fetches with `offset` set to the sum of every cached page's own
  length so far (`getNextOffset()` in `gfwEventUtils.ts`), reusing the
  paging session's frozen params (`lastParams`) - not whatever's currently
  in the live search form, for the same reason the Vessel tab freezes
  params on `since`.
- **Prev** - always served from that same cache.
- **"Has more?"** - `fetchedCount < total`, no cursor-presence check
  needed the way the Vessel tab's `since` requires.

### Clear

A **Clear** button sits next to Run Query in the footer
(`event-clear-button`), disabled while a search is in flight or the result
list is already empty. It resets `events`, `pages`, `pageIndex`, `total`,
`lastParams`, and `activeEvent` - the same fields `handleRunSearch` itself
zeroes out before firing a new request - without touching the search form.
Same "results only" scope as the History tab's own Clear button. Since the
map now draws directly from `events` (see below), this empties the map
too.

### Results and export

Each result renders as a compact card (`EventResults.tsx`): vessel name ·
event type, then flag / start time, drawn from the fields every
`TGlobalEvent` variant carries in common (`IBaseEvent`) via
`getEventDisplayFields()` in `gfwEventUtils.ts`. React keys use GFW's own
event id (`IBaseEvent.id`) directly - unlike vessel identity, no
multi-field fallback is needed (`getEventKey()`).

Clicking a result's export button (the "+") adds it to
`gfwEventStore.selectedEvents` - the Export tab's **Event** section (see
below), not an immediate download.

### Showing results on the map

Every event in `gfwEventStore.events` is drawn on the map as soon as a
search returns - no separate "pin to map" step (an earlier iteration had a
per-row toggle button for this; removed since it was redundant once
fetching *is* showing). Results stay on the map until the next search
replaces `events`, same lifetime as the list itself (`EventTab.tsx` clears
both together the moment Run Query fires - see "Clear" below for the other
way results disappear).

Drawn by `useGfwEventMarkers.ts` (mirroring `useEventMarkers.ts`'s SAR-
detection dots, but deliberately simpler - no clustering, no
matched/unmatched color split, since GFW events carry no such concept).
One fixed color, `--color-primary-purple4`, chosen specifically to not
collide with any hue already on the map: teal/orange are the SAR/AIS
detection dots, the whole blue family is AOI/EEZ/MPA/clusters. Identifying
detail (vessel name, event type, flag, start time) shows in a hover popup,
not an on-map text label - `MapCanvas`'s basemap deliberately loads no
`glyphs` resource, so a text `symbol` layer wouldn't render here any more
than it does for the SAR-detection dots (see that hook's own comment).

An "Event" swatch appears in `EventMarkersLegend.tsx` - the box that
already explains Matched/Unmatched/Clustered/etc. for the SAR-detection
dots, not `MapLegend.tsx` (which explains *which layers* are on screen,
e.g. AOI/EEZ/MPA) - whenever at least one event is in the results, same
"only show what's actually on screen" rule the rest of that legend already
follows. Reuses the Event tab's own `sidebar.tab.event` label ("Event")
rather than a second, duplicate-value i18n key.

### Selecting a result (list ↔ map)

Selection stays in sync both directions, mirroring the SAR-detection dots'
own behavior in `useEventMarkers.ts`:

- Clicking a result row sets `gfwEventStore.activeEvent`, which highlights
  the row (`ListItem`'s `active` prop) *and* draws a selection ring around
  its marker on the map.
- Clicking a marker on the map sets the same `activeEvent` (looked up by
  `getEventKey()` against `events`), which highlights the corresponding
  row in the list.
- Clicking the already-active row or marker again deselects it (toggle,
  not one-way).

The ring is a second circle layer in `useGfwEventMarkers.ts`
(`gfw-event-markers-selected-ring`, filtered on each feature's `active`
property), styled identically to `useEventMarkers.ts`'s own selection ring
(`--color-primary-purple6`, 13px radius) - they share the same "Selected"
row in `EventMarkersLegend.tsx` rather than each getting its own, since the
ring means the same thing and looks the same regardless of which store
triggered it.

---

## 3. Export tab: Report vs. Vessel vs. Event sections

The Export tab now has three sections, all gated by the same "at least one
item" rule feeding a single Export button, but each works differently:

| | Report section | Vessel section | Event section |
| - | --------------- | ---------------- | --------------- |
| Source | `eventStore.selectedEvents` | `vesselStore.selectedVessels` | `gfwEventStore.selectedEvents` |
| Include Files picker | Yes (`EExportEvidence` chips) | No - nothing to choose | No - nothing to choose |
| On Export | `POST /exports/events` → backend builds a ZIP bundle (see [export-bundle.md](./export-bundle.md)) | Client-side `downloadJSON(selectedVessels, ...)` - no backend call | Client-side `downloadJSON(selectedGfwEvents, ...)` - no backend call |

**Why the Event section has no backend bundle:** same reasoning as the
Vessel section (see [vessel-identity.md](./vessel-identity.md#3-export-tab-report-vs-vessel-sections))
- `evidenceController` rejects an empty `events` array and the ZIP bundle
format is entirely `IEventSchema`/`IHotspot`-shaped, with no GFW-event
schema anywhere in it. A `TGlobalEvent` record is also already fully
present client-side, so a plain JSON download is the direct fit.

All three sections can export in the same click if more than one has
items - independent downloads, not one combined file.

---

## 4. History tab: Event section

`master-plan.md`'s History-tab work originally shipped Report and Vessel
sections only, explicitly noting "Event tab excluded - it has no
query/results mechanism yet." This feature closes that gap: every Event
tab search (success or failure) is now recorded the same way Report/Vessel
runs are - `historyStore`'s `IHistoryEntry` gained a third `tab: 'event'`
variant carrying an `IEventSearchParams` (`{url_params, body_params}`) +
an `IGfwEventHistoryResult` (`events`/`pages`/`pageIndex`/`total`/
`lastParams`), and `applyHistoryEntry()` restores it into
`gfwEventSearchStore`/`gfwEventStore` (plus `useAOIStore`/`useTimeRangeStore`
via `importEventAOIAndTimeRange()` - see above) and re-syncs the
`eventConfig` URL param, same zero-backend-fetch restore the other two tabs
get.

---

## 5. Looking ahead

Noted here so they don't get silently forgotten, not commitments:

- **Detail-panel enrichment** (surfacing a matched detection's nearby GFW
  events, especially AIS gaps, in the Detail panel) is a distinct,
  not-yet-built feature - see the conversation this feature grew out of.
  It answers a different question ("what did *this* vessel do nearby") than
  the standalone Event tab ("browse GFW events by filter"), and carries its
  own domain-framing risk (a nearby gap/encounter is proximity, not a
  match) that would need the same care as the rest of the app's triage
  language.

---

## 6. Related documents

- [query-contract.md](../api/query-contract.md#events-search) - full request/response reference for the Events Search endpoint
- [architecture.md](../api/architecture.md) - `repositories/event` in the repository-layer pattern
- [vessel-identity.md](./vessel-identity.md) - the Vessel tab this feature mirrors section-for-section
- [export-bundle.md](./export-bundle.md) - the Report section's backend ZIP bundle (Event section export is not part of it)
- [limitations.md](../limitations.md) - the "unmatched ≠ illegal" framing that also bounds how GFW event data may eventually be presented alongside a detection
