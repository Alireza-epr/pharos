# UI Usage Notes

Five independent topics live here: accessibility/keyboard reachability,
in-context help/caveats, query history, config import/export, and the map's
clustering behavior.

## Accessibility & Keyboard Reachability

Scope: the core analyst loop - left sidebar (Report / Vessels / Event tabs),
the results table (`BottomPanel`), the right drawer (Detail / Export /
History tabs), and the shared modal. Every interactive control in that loop
is keyboard-reachable and operable, not just clickable.

---

## Focus order

Natural Tab order follows DOM order, which is:

1. **Header** (`HeaderPanel`) - language, theme, logout.
2. **Left sidebar** (`Sidebar`) - Report / Vessels / Event tab buttons, then
   the active tab's own controls top-to-bottom (each collapsible section is
   one Tab stop when closed; opening it - Enter/Space on the header - reveals
   its fields as further stops). Collapsed sections are not just visually
   hidden: they're removed from the Tab order entirely (React's `Activity`
   hidden mode), so closed sections don't cost the keyboard user any stops.
3. **Map** (`MapView`) - no focusable controls today (no zoom buttons are
   added; panning/zooming is mouse/touch only either way).
4. **Right drawer** (`DetailDrawer`) - Detail / Export / History tab buttons,
   then the active tab's content.
5. **Results table** (`BottomPanel`) - sortable column headers, then one
   Tab stop per detection row.

### Known deviation from the ideal order

Steps 4 and 5 above are reversed from the more natural task order (skim
results, then inspect details) - the plan's original ask was "sidebar →
filter panel → results list → details → export." The results table
(`BottomPanel`) and the detail drawer occupy different rows of the flex
layout (`App.module.scss`): the drawer sits beside the map, the table spans
full width below both. Fixing the DOM order without changing the visual
layout needs CSS Grid areas (grid placement is independent of source order,
unlike flexbox), which is a real layout change to `App.tsx`/`App.module.scss`
- including the sidebar/drawer collapse-and-reopen-button positioning - that
wasn't made blind in an environment where the result couldn't be visually
verified. Left as a documented gap, not a silent one; a grid-based
`App.module.scss` refactor is the fix if this is picked up later.

### Known limitation: map drawing

Drawing a Zonal or Point AOI (`useAOIDraw.ts`) is a pointer gesture -
click to place vertices, drag to move them - with no keyboard equivalent.
This is a deliberate, accepted limitation (consistent with how spatial
drawing tools are generally treated under WCAG): everything *around* the
gesture - the Zonal/Point/Clear buttons, the EEZ/MPA dropdowns, the radius
input - is fully keyboard-operable; only the freehand drawing itself
requires a pointing device.

---

## Keyboard shortcuts & interactions

| Control | Keys |
|---|---|
| Any button (`ButtonInput`, native `<button>`) | `Tab` to focus, `Enter`/`Space` to activate |
| Collapsible section header (`Section`, `SectionItem`) | `Tab` to focus, `Enter`/`Space` to expand/collapse (`aria-expanded` reflects state) |
| Results list row (`ListItem` - Vessel results, History entries) | `Tab` to focus, `Enter`/`Space` to select/activate |
| Detection table row (`BottomPanel`) | `Tab` to focus, `Enter`/`Space` to select (`aria-selected` reflects state) |
| Sortable table column header | `Tab` to focus, `Enter`/`Space` to toggle sort (`aria-sort` reflects state) |
| Searchable dropdown (`DropdownInput`'s combobox mode) | `Enter`/`↓` opens it, `↑`/`↓` moves the highlight, `Enter` commits, `Escape` closes |
| Checkbox (`CheckboxInput`) | Native checkbox: `Tab` to focus, `Space` to toggle |
| Modal (`Modal`, incl. the query-progress modal) | Opening moves focus into the dialog; `Tab`/`Shift+Tab` cycles within it (doesn't escape to the page behind); `Escape` closes and returns focus to whatever opened it |

---

## Visible focus indicator

One consistent style everywhere: `:focus-visible` outline
(`--border-width-md` solid `--color-primary-purple6`, 2px offset) via the
global `.focus` utility class - so it only appears for keyboard focus, not
every mouse click. Applied to every button, input, and the newly-focusable
list rows/disclosure headers/table rows above. The one exception is
`CheckboxInput`: its native `<input>` is visually hidden (a custom `.box`
renders the check), so its ring is drawn on the whole control via
`:focus-within` on the wrapper instead of `.focus` on the input itself.

---

## `aria-label`s on icon-only controls

`ButtonInput` derives an icon button's accessible name from its `title`
automatically (`aria-label={ariaLabel ?? (icon ? title : undefined)}`) - every
icon-only button in the app already sets a descriptive `title` for its
tooltip, so this covers them without per-callsite changes. Raw `<button>`s
outside `ButtonInput` (`Modal`'s close button, `Section`'s import/export
icons, `DropdownInput`'s clear button, `TextInput`'s copy button,
`SidebarToggleInput`) each set `aria-label` directly.

---

## Testing

`apps/frontend/tests/e2e/smoke.spec.ts` includes
`keyboard_only_walkthrough_reaches_and_operates_the_core_controls`, which
drives the same happy path as the mouse-based smoke test - expand the AOI
section, pick an EEZ, run the query, inspect the progress modal's focus
trap, sort a column, select a detection row - using only `Tab`/`Enter`/
`Escape`, never `.click()`.

---

## In-context help, hints & caveats

Two mechanisms, both reusing existing UI primitives rather than adding new
ones:

**Hints on score, uncertainty & reason codes.** `SectionItem`'s existing
`hint`/`caveat` props (an ℹ/⚠ glyph next to a label, native `title`
tooltip on hover) now cover the Detail drawer's Scoring block: the triage
score and uncertainty score fields each explain in one sentence what the
0-1 number means and, just as importantly, what it *isn't* ("not a
probability or risk score"). Every raw reason-code chip
(`bathymetry_shallow_eez_hotspot` and friends) gets the same treatment via
a new `titleFor` prop on `ChipGroupInput` backed by
`reasonCodeHint()` (`helpers/utils/eventUtils.ts`) - one short explanation
per `EReasonCodesStatic` value, plus the two `missing_required_*_field:`
template variants (field name interpolated in). Shared by both places a raw
reason code renders as a chip: the Scoring block's read-only display and
Filter's include/exclude pickers.

**Standing "unmatched is triage, not a claim" caveat near the results.**
`BottomPanel` (the detections table, in both its normal and maximized/modal
form) now always shows a small ⚠-prefixed line above the table whenever
there are events to show, reusing the same copy already shown per-event in
the Detail drawer's footer (`detailPanel.text.dataLimitationBody`) rather
than inventing new wording - one canonical sentence, surfaced in two
places. This is UI-only; the export bundle's file set is unchanged (the
canonical, fuller version of this caveat lives in `docs/limitations.md`
for anyone reading the repo).

---

## History (`HistoryTab.tsx`)

The right drawer's third tab, alongside Detail and Export. Two sections,
**Report** and **Vessels**, styled the same as `ExportTab` - one entry per
query/search that actually ran in that tab, success or failure, newest
first. Each entry shows a timestamp and either a result count
(`{{count}} result(s)`) or a `Query failed` subtitle, the latter colored via
the same global `error` class the rest of the app uses for failure text
(`ReportTab`/`VesselTab`/`ExportTab` all use it too - one consistent "this
went wrong" color, not a one-off here).

**Apply** restores that entry's query config and its captured result set
with no re-fetch of the underlying detections/vessels - the result was
saved alongside the query the moment it originally ran, so replaying it is
a pure state write (`applyHistoryEntry`, `helpers/utils/historyUtils.ts`).
The one exception: a Report-tab entry whose AOI used an EEZ/MPA region
dropdown does trigger one network call on Apply - reloading that dropdown's
option list (`GET /v1/regions`) so the restored selector has something to
render/edit - but this is populating a picker, not re-running the query.

`Clear` empties the whole history store (both sections at once) from one
footer button; there's no per-entry delete.

---

## Import / export configuration

Two independent layers, both plain JSON-file round-trips
(`downloadJSON`/`openJSONFile`) with no server involvement:

- **Whole-query config** - one `Section` per tab (`ExportAndImportConfig.tsx`
  for Report, `VesselExportAndImportConfig.tsx` for Vessel Search). Export
  downloads the entire current config as one JSON file (hidden run-only
  fields like `gitCommitSHA`/`export`/`cache` stripped first via
  `stripHiddenConfiguration`); import validates the file's shape and, if
  valid, replaces the whole config (`caveat` on the Import button warns
  this before the fact). This is the same `config_json` shape an export
  bundle records in its `run_metadata.json` (master-plan 3.8) - a
  downloaded config and a bundle's recorded config are interchangeable.
- **Per-section config** - `Section`'s own `showImport`/`showExport` props
  (a ↧/↥ icon pair next to a section's title) let AOI, Time Range,
  Threshold & Weights, Sort Order, Pagination, Hotspot Config, Filter, and
  Advanced Query each export/import just their own slice of the config,
  independent of the rest - for sharing or reusing one part of a query
  setup without overwriting everything else.

Both layers report an invalid/unreadable file through the same
`general.text.invalidImportFile` warning rather than failing silently;
whole-config import additionally re-triggers the EEZ/MPA region-list
preload described above under History, for the same reason.

---

## Map clustering (`useEventMarkers.ts`)

Detections are drawn as a real MapLibre GL `circle` layer on a GeoJSON
source, not individual DOM markers - which already gets two things for
free, with no extra code: **hit-testing** (`map.on('click', layerId, ...)`
uses MapLibre's own GPU-backed index, not a manual scan) and **viewport
culling** (a GL layer only renders what's in view as a normal part of how
it renders anything). The one actual gap was **clustering** - dozens of
overlapping dots at low zoom turning into unreadable clutter.

Fixed by turning on the GeoJSON source's built-in `cluster: true` option
(`clusterMaxZoom`, `clusterRadius`) - `maplibre-gl` bundles `supercluster`
internally for this, so it's a config flag, not a new dependency or a
hand-rolled spatial index. Below `CLUSTER_MAX_ZOOM` (11 - at or below the
map's own `maxZoom` of 12, so the tightest zoom always shows raw dots, never
a cluster that can't split further), nearby dots merge into one bubble sized
by count (`circle-radius` `step`d on `point_count`); clicking a bubble zooms
in just enough to split it apart (`getClusterExpansionZoom`).

**Deliberately no count label on the bubble.** A text label needs a
`symbol` layer, which needs a `glyphs` URL in the map style to fetch font
glyph ranges from - and the basemap style (`helpers/fixtures/map.ts`)
intentionally sets none, to avoid an extra external resource dependency
(same reason there are no vessel-type/gear icons on individual dots either).
Cluster size is the only signal for "how many," not an exact count.
