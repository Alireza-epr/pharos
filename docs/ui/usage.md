# UI Usage - Accessibility & Keyboard Reachability

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
