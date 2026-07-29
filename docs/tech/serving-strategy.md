# Serving Strategy

## Overview

The system stores vessel event data in Parquet files and serves them through a simple read-optimized API.

The core is a single component:

- **API service**: resolves the query to partitions, reads those Parquet files, and returns results — fetching, enriching, and storing on a cache miss.

The API does not normally call the provider, except when coverage is missing (cache-on-miss). **Ingestion is on-demand**: a request that misses populates the partitions it needs. There is no separate scheduled ingestion worker today — see [Ingestion](#ingestion-on-demand-today).

### Module map

| Concern | Module |
|---|---|
| Pure helpers (date range, query key, dedup, time filter, coverage logic) | `helpers/utils/servingUtils.ts` |
| Spatial logic (AOI → partition resolution, per-event routing, H3 + exact-polygon filters) | `helpers/geo/spatial.ts` |
| Orchestration (resolve → coverage → cache-on-miss → filter → sort) | `services/ServingService.ts` |
| Serving **repository** (partition Parquet read/write + coverage manifest), behind `IServingRepository` + a config-selectable factory | `repositories/serving/` (`IServingRepository` in `helpers/types/serviceTypes.ts`) |
| Detection service: fetch → normalise → enrich on miss (+ dev fixture fallback) | `services/DetectionService.ts` |
| Detection **repository** (raw provider fetch), behind `IDetectionRepository` + a config-selectable factory | `repositories/detection/` (`GfwDetectionRepository`; `IDetectionRepository` in `helpers/types/serviceTypes.ts`) |

---

# What is stored in a partition

Each partition file is a Parquet file of canonical events. Each row has just two
columns: `event_id` (an inspectable primary/dedup key) and `canonical_json` (the
full `IEventSchema` serialized to a string). The read path returns complete
events by parsing `canonical_json`, and filtering (time / H3 / polygon) runs on
those reconstructed objects.

> Extra scalar columns for **predicate pushdown** (filtering on `timestamp` /
> `lat` / `lon` / `h3_cell` *before* parsing the JSON) are intentionally omitted
> for now — at pilot scale we parse every row. Adding them is the documented
> scale optimization (see [Future improvements](#future-improvements)).

> This is deliberately **separate** from the analyst-facing export schema in
> `helpers/types/parquetTypes.ts`, which is intentionally flat/lossy (CSV-like
> columns for the evidence bundle). The serving store must round-trip full
> fidelity; the export store must stay human-legible.

---

# How data is stored

Data is stored per **day** and split into:

- EEZ-based files
- ONE HIGH_SEAS file per day (fallback bucket)

### Example structure

```
events/
  date=2026-05-26/
    8444.parquet
    8812.parquet
    HIGH_SEAS.parquet
```

---

# What is HIGH_SEAS?

HIGH_SEAS contains all events that are outside any EEZ.

It is:

- created on the first request whose data falls outside any EEZ
- shared for the whole day
- updated when new missing data is fetched

It is NOT created per request.

---

# Ingestion (on-demand today)

Ingestion is **lazy / cache-on-miss**, not a scheduled background job. When a
request misses, the serving path itself ingests the data it needs, in one pass
(`services/ServingService.ts` → `services/DetectionService.ts` → `repositories/detection` → GFW):

1. Call the provider once for the requested window.
2. Enrich events (EEZ, H3, scoring, metadata).
3. Route each event to its `(day, partition)` bucket and merge + dedup into the
   partition file.
4. Record coverage so a repeat of the same query is a pure cache hit.

A **scheduled ingestion worker** that proactively pre-warms partitions
(per-EEZ, on a timer) is a deliberate *future* improvement, not part of the
as-built system — see [Future improvements](#future-improvements). It would
reuse the same `writePartition` / coverage code behind a CLI + scheduler.

> Note: the offline pipeline (`pipeline:sample`, `src/pipeline/sample.ts`) is a
> separate concern — it produces evidence bundles under `data/out/`, and does
> **not** write to the `data/events/` partition cache.

---

# API serving flow

When a user sends a request:

## Step 1 - Find region

- Check which EEZ overlaps the polygon
- If none then use HIGH_SEAS

---

## Step 2 - Load files ( if applicable )

Examples:

```
events/date=2026-05-26/8444.parquet
events/date=2026-05-26/HIGH_SEAS.parquet
```

---

## Step 3 - Filter data

After loading and merging the resolved partitions, filtering is applied in this
order (the result is identical regardless of order; the order is chosen so the
cheap steps prune first):

1. **time** - keep events inside the requested `date-range`.
2. **H3 (coarse)** - keep events whose serving-resolution H3 cell falls in the
   AOI cell set. The cell set is the polygon's cells **expanded by one ring**
   (`gridDisk(k=1)`), so this step never drops a valid edge event before the
   exact check runs. It is skipped when the AOI is smaller than a single cell.
3. **exact polygon** - authoritative point-in-polygon test against the AOI.

---

## Step 4 - Missing data ( cache-on-miss behavior )

Coverage is tracked in a **coverage manifest** (`data/events/coverage.json`) by
**area, not by request shape**. Its structure is `date → queryKey → covered H3
cells`:

- The **queryKey** is the *non-spatial, non-temporal* shape of the request
  (URL, method, datasets, resolutions, group-by, filters). It **excludes**
  `date-range` (the day is the partition dimension) **and all geometry** (the
  spatial dimension is the cell set). So a different map box with the same
  datasets resolves to the same queryKey.
- The **covered cells** are the H3 cells (at a coarse coverage resolution) that
  have actually been fetched for that day + queryKey.

A day is **covered** for a request when *every* cell its AOI needs is already in
the set — i.e. the AOI's cells are a **subset** of what's been fetched. This is
what makes **zooming in a cache hit**: a smaller box inside an already-fetched
box needs only cells we already have.

On a miss (any requested day whose cells aren't all covered):

1. **Align the fetch to the cells' bounding box** and call the provider **once**
   for the whole window. Fetching the cell-bbox (⊇ the cells we'll mark)
   guarantees every covered cell is *fully* fetched — so a later subset query
   can be served from cache without losing events at cell edges.
2. Process and enrich events.
3. Route each event to its `(day, region)` partition file (`region = its EEZ
   MRGID`, else `HIGH_SEAS`) and **merge + dedup**.
4. **Union the AOI's cells** into the coverage set for each missed day —
   including days that came back empty, so a repeat is a hit, not a re-fetch.
5. Read the partitions back, filter, and return.

A second identical **or zoomed-in** request finds its cells covered and is a
**pure cache hit** (no provider call). The hit/miss outcome is logged; surfacing
it in the response payload is owned by the response-cache work (master-plan 2.2).

> Region partitions (files) and coverage (cells) are **separate dimensions**:
> regions decide *which file* an event is stored in/read from; cells decide
> *whether we need to fetch*. That separation is what lets zoom-in hit the cache
> without changing the file layout.

---

# Deduplication rule

Every write into a partition (most importantly the shared, growing
`HIGH_SEAS` file) is **deduplicated by `event_id`** - the deterministic
SHA-256 of `timestamp + lon + lat + source`. `writePartition` reads the
existing file, concatenates the new rows, keeps one row per `event_id`, sorts by
`event_id`, and rewrites the file (parquetjs cannot append in place). This makes
overlapping/repeated fetches idempotent and keeps partition files from
accumulating duplicates at pilot scale.

---

# Multiple request behavior

If another request comes for the same day (same or overlapping area):

- the system reuses the existing region Parquet files,
- only calls the provider when the AOI needs a cell not yet covered,
- merges any newly fetched data into the region files, deduped by `event_id`,
  and unions the new cells into coverage.

---

# Why this design works

- Simple storage layout
- No explosion of files
- Fast reads for most queries
- Works for both EEZ and open ocean
- Supports incremental caching

---

# Limitations

- First request for an area/day may be slower (provider fetch + enrich + write).
- The `HIGH_SEAS` file grows over time. Duplicate rows are prevented by the
  `event_id` dedup rule above, but the file is still rewritten in full on each
  merge - fine at pilot scale, not at operational scale.
- **Coverage granularity is the coarse H3 cell.** A new box is a hit only when
  all of its cells were previously fetched. Nested/overlapping boxes hit; a box
  that pokes one cell beyond what's been fetched re-fetches (the dedup rule keeps
  that correct, just not free).
- **The miss-fetch over-fetches to the cell bounding box.** For a thin or
  diagonal AOI the cells' bbox can be noticeably larger than the AOI, so the
  provider call pulls more than strictly needed (deduped on write). Fine for the
  compact AOIs at pilot scale.

---

# Future improvements

- Add predicate-pushdown columns to the serving schema (`timestamp`, `lat`,
  `lon`, `h3_cell`) and filter on them — projecting columns on read — so large
  partitions don't parse every row's `canonical_json`.
- Tighten the miss-fetch from the cell bbox toward the exact cell set (fewer
  over-fetched events for thin/diagonal AOIs).
- Background prefetching for hot areas; partition-file compaction for `HIGH_SEAS`.
- Move to a lakehouse system (Iceberg/Delta) with a scheduled ingestion worker.

---

# Diagram

```mermaid
flowchart TD
    A[Request: polygon / EEZ / MPA + time] --> B[Resolve partitions:<br/>- Time bin<br/>- Spatial resolution]

    B -.-> B1[[Spatial Resolution:<br/>- detect EEZ intersections<br/>- fallback to HIGH_SEAS if no match<br/>- combine EEZ + HIGH_SEAS partitions when needed]]

    B --> C[Check coverage: are the AOI's H3 cells<br/>already fetched for this day + query?]

    C --> D{All cells covered?}

    D -->|Yes| E[Load region partitions]
    D -->|No| F[Fetch provider for the cells' bbox]

    F --> G[Ingest + enrich events]
    G --> H[Write region partitions + union cells into coverage]
    H --> I

    E --> I[Merge region data]

    I --> J[Filter results:<br/>- time filter<br/>- H3 filter<br/>- exact polygon check]

    J --> K[Return response]
```

---

# Summary

Data is stored per day and split into:

- EEZ partitions
- ONE HIGH_SEAS fallback partition

H3 is used in two places: a coarse read-time filter prune, and (at a coarser
resolution) the coverage manifest that decides hit vs. fetch by area.

The system learns and grows its cache based on usage — and because coverage is
tracked by area (cells), zooming into an already-fetched region is a cache hit.
