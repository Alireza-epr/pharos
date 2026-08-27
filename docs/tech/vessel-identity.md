# Vessel Identity (Vessels API Integration)

## 1. Overview

Global Fishing Watch exposes vessel identity data (who a vessel is - name,
flag, MMSI/IMO/call sign, registry ownership, gear/ship type) as a separate
resource from the gridded SAR/AIS detections the Report tab queries (4Wings)
and from event-level activity (Events API). This document covers the two
Vessels API endpoints Pharos integrates and the two features built on them:
the **Vessel tab** (search) and **Vessel Identity** (on-demand enrichment of
a matched detection in the Detail panel).

Full request/response contracts: [query-contract.md](../api/query-contract.md#vessels-search)
(`Vessels Search`, `Vessels List by IDs`).

---

## 2. Vessel tab (search)

A left-sidebar tab, next to Report, for searching GFW's vessel identity
dataset directly - independent of any SAR detection. Backed by
`POST /vessels/search`, sent as an `IVesselConfigJSON` - the Vessel tab's
analogue of the Report tab's `IConfigJSON` (`url`/`method`/`url_params`,
built by `buildVesselSearchConfig()`; see
[query-contract.md](../api/query-contract.md#vessels-search) for the
request shape).

### Query fields

| Field        | Sends           | Notes                                                          |
| ------------ | --------------- | ---------------------------------------------------------------- |
| Search       | `query`         | Free text - MMSI, IMO, call sign, or name. GFW requires 3+ chars |
| Raw Query    | `where`         | Advanced expression, e.g. `flag = 'KOR'`. Usable alone, without Search |
| Match Fields | `match-fields[]` | Filters the *result set* by match confidence (`ALL`/`SEVERAL_FIELDS`/`NO_MATCH`) - doesn't change how many candidates exist |
| Include      | `includes[]`    | Extra data attached per result (`OWNERSHIP`/`AUTHORIZATIONS`/`MATCH_CRITERIA`) - all three on by default |
| Limit        | `limit`         | 1-50, default 20                                               |

`datasets[]` is sent fixed as `public-global-vessel-identity:latest` and not
exposed as a picker - GFW currently allows only that one value.

### Pagination is a forward-only scroll cursor

Confirmed against the live API, and non-obvious enough to call out
explicitly: GFW's `since` token is **not** an incrementing offset. It's an
Elasticsearch scroll id under the hood, and the *same* token is returned and
reused for every subsequent page of one query - there is no backward cursor
at all.

Consequences for the frontend implementation (`vesselStore.ts`,
`VesselTab.tsx`):

- **Next** - if the page was already fetched earlier in this session, it's
  served from an in-memory cache (`pages` in `vesselStore`), no request. If
  not, it fetches using the stored `since` **and the original search
  params frozen at the moment Run Query was pressed** (`lastParams`) - not
  whatever's currently in the live search form, since editing the form
  mid-scroll must not silently change the query a stale `since` token is
  still scoped to.
- **Prev** - always served from that same cache; there's no server-side way
  to go backward.
- **"Has more?"** - GFW sends no end-of-results flag. It's inferred by
  comparing how many entries have been fetched across all cached pages
  against the response's `total`.

### Results and export

Each result renders as a compact card (`VesselResults.tsx`): ship name, then
flag / MMSI / IMO / call sign / vessel type, drawn from whichever of
`selfReportedInfo` / `registryInfo` / `combinedSourcesInfo` actually has the
data (`getVesselDisplayFields()` in `vesselUtils.ts`). React keys use GFW's
own vessel UUID (`combinedSourcesInfo[0].vesselId`, mirrored as
`selfReportedInfo[0].id`) - **not** MMSI/IMO/call sign, which GFW can
reassign to a different vessel over time and are therefore not safe unique
identifiers.

Clicking a result's export button adds it to `vesselStore.selectedVessels` -
the Export tab's **Vessel** section (see below), not an immediate download.

---

## 3. Export tab: Report vs. Vessel sections

The Export tab has two sections, both gated by the same "at least one item"
rule feeding a single Export button, but they work completely differently:

| | Report section | Vessel section |
| - | --------------- | ---------------- |
| Source | `eventStore.selectedEvents` | `vesselStore.selectedVessels` |
| Include Files picker | Yes (`EExportEvidence` chips) | No - nothing to choose |
| On Export | `POST /exports/events` → backend builds a ZIP bundle (see [export-bundle.md](./export-bundle.md)) | Client-side `downloadJSON(selectedVessels, ...)` - no backend call |

**Why the Vessel section has no backend bundle:** `evidenceController`
(the Report section's endpoint) hard-rejects a request with an empty
`events` array, and the ZIP bundle format (`evidenceExport`) is entirely
`IEventSchema`/`IHotspot`-shaped - there's no vessel schema anywhere in it.
A vessel identity record is also already fully present client-side (nothing
the backend would need to compute), so a plain JSON download of whatever's
in the list is the direct fit rather than extending the bundle pipeline.

Both sections can export in the same click if both have items - two
independent downloads, not one combined file.

---

## 4. Vessel Identity (Detail-panel enrichment)

A matched detection's raw 4Wings entry already carries GFW's internal
vessel id (`event.raw_metadata.vesselId` - see
[event-schema.md](../data/event-schema.md)'s `raw_metadata` note). The
Detail panel resolves that id into a full vessel identity on demand, via
`POST /vessels` (list by ids) - a **different** GFW endpoint from the Vessel
tab's search, with its own response `metadata` shape
(`idsFound`/`idsNotFound`, not `query`/`normalizedQuery`/`didYouMean`).
Same `IVesselListConfigJSON` request pattern as the Vessel tab's own
`IVesselConfigJSON` (`buildVesselListConfig()`, see
[query-contract.md](../api/query-contract.md#vessels-list-by-ids)).

Shown as a new **Vessel Identity** section in the Detail panel, between
Source & Detection and Scoring (`VesselIdentityContext.tsx`) - only when
`vesselId` is present (i.e. never for an unmatched detection).

### Explicit design decisions

These were deliberate, not default choices - recorded here so they don't
get silently reversed later:

- **Contextual only, never feeds scoring.** Vessel identity data (registry
  ownership, tonnage, etc.) is displayed for a human analyst to look at
  during triage; it never factors into `triage_score`, `uncertainty_score`,
  or `reason_codes`. Feeding vessel identity into scoring would risk
  implying that ownership/registry data signals risk or intent, which
  conflicts with this project's domain framing (see root `CLAUDE.md`:
  "Scores are for triage and inspection only — never present them as
  probabilities or risk indicators") and with
  [export-bundle.md](./export-bundle.md)'s own "scores are comparative, not
  absolute" interpretation notes.
- **Fetched on demand, not eagerly for every matched event.** Only when the
  Detail panel is actually opened for a matched event - not for a whole
  page of Report tab results, whether or not anyone looks at them.
- **Never persisted onto `IEventSchema` or written into the Parquet
  cache.** Registry/ownership data can change over time (a vessel's owner,
  tonnage, etc. isn't fixed); baking a snapshot into a cached event would
  go stale with no way to refresh it. It's cached only in memory, for the
  lifetime of one Detail-tab session (`useVesselIdentity.ts`, mirroring the
  same lifetime-scoped cache pattern `useSyncRegionGeometry.ts` already
  uses for EEZ/MPA boundary lookups) - stepping through events via Prev/Next
  never re-fetches a vessel already seen in that session, but a fresh page
  load always does.

---

## 5. Related documents

- [query-contract.md](../api/query-contract.md#vessels-search) - full request/response reference for both Vessels endpoints
- [architecture.md](../api/architecture.md) - `repositories/vessel` in the repository-layer pattern
- [event-schema.md](../data/event-schema.md) - where `vesselId` lives on a matched detection
- [export-bundle.md](./export-bundle.md) - the Report section's backend ZIP bundle (Vessel section export is not part of it), and its own "scores are comparative, not absolute" interpretation notes
- [limitations.md](../limitations.md) - the "unmatched ≠ illegal" framing this feature is built to not violate
