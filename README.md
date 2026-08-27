# PHAROS

## Pitch

PHAROS is an early-stage prototype for **AIS–SAR alignment** using open maritime datasets. It retrieves Sentinel-1–derived SAR vessel detections, checks whether each one is matched or unmatched to the **publicly available AIS** used by the detection provider, scores the results for human triage, and presents them on a map-based UI with exportable evidence bundles.

The focus of this Iteration is **data access, normalization, transparency, and reproducibility** - not real-time monitoring or enforcement claims.

---

## Project Scope

PHAROS is designed to:

- Retrieve SAR vessel detections from open Sentinel-1–derived datasets
- Inspect whether detections are matched or unmatched to **publicly available AIS** (as provided by the data source)
- Score unmatched detections for triage/inspection priority, with reason codes and a confidence tier
- Present results on a map-based UI for manual inspection, with context layers (EEZ, MPA, bathymetry) and on-demand vessel identity enrichment
- Export evidence bundles for review and validation

PHAROS **does not**:

- Claim detection of illegal or "dark" vessels
- Infer vessel intent or behavior
- Perform custom SAR–AIS matching
- Provide real-time monitoring

---

## How It Works

There are two flows: an offline **data pipeline** that produces the dataset the UI queries, and the **live app** that a user interacts with.

### Data pipeline

Config-driven and staged, entry point `apps/backend/src/pipeline/sample.ts`, configured via JSON files in `apps/backend/src/config/*.json` (e.g. `pilot.json`):

```
ingest → normalize → features → aggregate → schema → export
```

(plus a separate `validation` stage)

- **Ingest** - pull SAR vessel detections and the matched/unmatched AIS flag from the detection provider (Global Fishing Watch, Sentinel-1 derived) for a configured AOI and time window.
- **Normalize** - reshape provider fields into the canonical event schema (`docs/data/event-schema.md`).
- **Features** - enrich each event with context layers: EEZ, MPA, bathymetry, coastline, and H3-hexagon hotspot membership.
- **Aggregate** - compute hotspot spatial density and temporal recurrence over the H3 grid (`docs/tech/hotspots.md`).
- **Schema** - apply the deterministic, rule-based triage scoring model (`triage_score`, `uncertainty_score`, fixed-vocabulary `reason_codes` - `docs/tech/scoring-spec.md`) and confidence tiering (`docs/tech/confidence-tier.md`).
- **Export** - write `events_scored.parquet` and prepare the exportable evidence bundle (`docs/tech/export-bundle.md`).

### Live app

1. The frontend queries the backend (`/v1/events`) for a chosen AOI, date range, and filters.
2. Results render on a MapLibre GL map and a sortable/filterable list, colour-coded by match status and confidence tier.
3. Selecting an event opens a detail drawer with the scoring breakdown, reason codes, context layers, and - for matched detections - on-demand vessel identity enrichment via the Global Fishing Watch Vessels API.
4. The Vessel tab supports standalone vessel search/lookup, independent of a specific detection.
5. The Export tab bundles the current filtered/scored Report result set as a ZIP, and separately exports any added vessel identities as client-side JSON.

---

## Features

- SAR vessel detection retrieval for a configurable AOI and date range
- AIS matched/unmatched status per detection (the provider's upstream flag, not custom matching)
- Deterministic triage scoring (`triage_score`, `uncertainty_score`) with fixed-vocabulary reason codes - for **inspection priority only**
- Confidence tiering derived from provider-side signal quality
- Hotspot analytics on an H3 hexagon grid (spatial density + temporal recurrence)
- Context layers - EEZ boundaries, Marine Protected Areas, bathymetry, coastline - toggleable per selected event
- Vessel identity enrichment (name, flag, MMSI/IMO/call sign, registry ownership) for matched detections, plus a standalone Vessel search tab
- Interactive MapLibre GL map with legends and list/map sync
- Filtering, sorting, and pagination over results
- Config export/import and URL-synced state for the Report and Vessel tabs (shareable, restorable views)
- Evidence-bundle export (ZIP) with scores, reason codes, and enriched context; a separate vessel-identity JSON export
- JWT-based authentication (access + refresh) gating all non-system endpoints

---

## Query Parameters

Report-tab queries and vessel search accept (full contract: [docs/api/query-contract.md](docs/api/query-contract.md)):

- **AOI**: polygon drawn/selected on the map
- **Date range**: start/end of the SAR detection window
- **Match status**: matched / unmatched / both
- **Confidence tier / score thresholds**: filter results by scoring output
- **Context layers**: EEZ / MPA / Bathymetry, applied per selected event
- **Hotspot grid**: H3 resolution and recurrence window
- **Sort**: by score, date, or other event fields
- **Vessel search**: name, MMSI/IMO/call sign, flag, and other identity fields (separate from Report-tab filters)

Report-tab and Vessel-tab configuration are persisted in the URL and can also be exported/imported as JSON, so a view can be restored or shared.

---

## Live Deployment

- Frontend: https://pharos-dev.vercel.app
- Backend: https://pharos-kqxq.onrender.com

> Backend runs on Render's free tier and may take a few seconds to wake up after inactivity.

---

## Quickstart

```bash
git clone <repo>
cd pharos
npm install
npm run dev
```

`npm run dev` builds the shared `@packages/*` first, then runs backend (`:1370`) and frontend (`:5173`) concurrently. Set the required environment variables first - see below.

---

## Scripts

Common scripts (from repo root):

| Command | Description |
|---|---|
| `npm install` | Install all workspaces |
| `npm run packages:build` | Build `@packages/{enum,types,utils}` - required first, and after any change to a package, since both apps consume compiled `dist/` |
| `npm run dev` | Build packages, then run backend + frontend concurrently in dev mode |
| `npm run build` | Build packages → backend → frontend |
| `npm run start` | Build everything, then run backend + a frontend preview server |
| `npm run lint` | ESLint, frontend + backend |
| `npm run lint:style` | Stylelint over frontend SCSS |
| `npm run typecheck` | `tsc --noEmit`, both apps |
| `npm run test` | Jest unit tests, both apps |
| `npm run e2e` | Playwright e2e (frontend) |
| `npm run format` | Prettier, written across the repo |
| `npm run pipeline:sample` | Run the offline pipeline against `config/pilot.json` |
| `npm run pipeline:sample:unmatched` / `:heavy` | Same pipeline against alternate fixture configs |
| `npm run pipeline:validation` | Run the validation pipeline stage |
| `npm run setup:data` | Download bathymetry rasters (GEBCO) - Windows shell syntax in the script |

Per-app variants exist as `frontend:*` / `backend:*` (e.g. `npm run frontend:typecheck`). See [the runbook](docs/runbook.md) for full setup and troubleshooting steps.

---

## Environment Setup

Set `DETECTION_TOKEN` - the detection-provider API token. In this iteration the provider is Global Fishing Watch, so obtain the token from the GFW API Token page and place it in a `.env` file inside `apps/backend`. A `.env.example` is provided for reference. See https://globalfishingwatch.org/our-apis/tokens.

Set `JWT_SECRET` in the same `apps/backend/.env` file. It signs and verifies authentication tokens (access + refresh), so it must be a long, random, secret string, never committed. Generate one locally with `node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"` (or `openssl rand -base64 48`). In CI, the values are supplied via GitHub Actions secrets; the secret keys must match the local secret keys. Use a different secret per environment.

Set `VITE_CARTO_API_KEY` in `apps/frontend/src/.env` (a `.env.example` is provided for reference) - CARTO requires a free key for its basemap tiles (fair-use cap: 5M requests/month); without it, map tiles render watermarked "API KEY REQUIRED" instead of the real basemap. Request one at https://carto.com/basemaps/apikey. In production this must be set as a build-time environment variable on the frontend host, since Vite bakes it in at build time.

Other backend variables (see `apps/backend/.env.example`) include CORS configuration, detection-provider timeout/retry tuning, and `CONTEXT_DATASET_QUALITY` (`simplified` by default, `full` if the host has enough RAM - see [Data Sources & Licenses](#data-sources--licenses)). Other frontend variables (see `apps/frontend/src/.env.example`) include the API base URL/retry tuning and the initial map view (default centre: Strait of Hormuz).

---

## Authentication

The app requires login. The backend issues a short-lived **access token** and a long-lived **refresh token** (JWT, signed with `JWT_SECRET`); the frontend stores them, attaches the access token to API requests, and refreshes it automatically when it expires. Protected endpoints such as `/v1/events` reject requests without a valid access token.

See the [authentication guide](docs/api/authentication.md) for the full login flow.

---

## Docker

Each app's `.env` is gitignored and read directly from the build context, so create both from their `.env.example` first (fill in `DETECTION_TOKEN`/`JWT_SECRET` in the backend one - see [Environment Setup](#environment-setup)):

```bash
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/src/.env.example apps/frontend/src/.env
```

Then, from `infrastructure/`:

```bash
docker-compose up --build
```

- Backend: port `1370`
- Frontend: port `5173`

> Backend health is checked every 30s. Frontend waits at startup for backend.

---

## Repository Structure

```text
apps/
  backend/          # Node.js + Express API and the offline data pipeline
    src/modules/      # feature slices: system, auth, events, exports, regions, vessels
    src/pipeline/      # ingest -> normalize -> features -> aggregate -> schema -> export (+ validation)
  frontend/         # React 19 + Vite + Zustand UI
    src/stores/        # one Zustand store per concern
    src/components/    # layout, map, sidebar, table, blocks, common

packages/           # @packages/{enum,types,utils} - shared code, built before either app
docs/               # specs, runbook, API/auth docs, data provenance and limitations
infrastructure/     # Docker + OpenAPI generation scripts
```

---

## Data Sources & Licenses

All data is open and publicly accessible; no proprietary or user-submitted data is used. Datasets are version-pinned for reproducibility (`docs/data/context-layers.md`, `docs/data/data-spec.md`).

- **SAR detections, AIS matched/unmatched flag, vessel identity** - Global Fishing Watch (Sentinel-1 derived). Provider data caveats: https://globalfishingwatch.org/our-apis/documentation#data-caveat
- **EEZ boundaries** - Flanders Marine Institute, `World_EEZ_20231025_LR` v12. Citation: Flanders Marine Institute (2026): MarineRegions.org, www.marineregions.org.
- **Marine Protected Areas** - UNEP-WCMC & IUCN, Protected Planet, `WDPA_WDOECM_APR2026` v1.6 (World Database on Protected Areas / WD-OECM). www.protectedplanet.net.
- **Bathymetry** - GEBCO Compilation Group, GEBCO 2025 Grid v2.7 (doi:10.5285/37c52e96-24ea-67cee063-7086abc05f29).
- **Basemap tiles** - CARTO (requires a free API key; fair-use cap 5M requests/month).
- **Map rendering** - MapLibre GL JS (BSD-3-Clause).
- **Geometry & indexing** - Turf.js (geometric utilities) and H3 (`h3-js`, hexagonal hotspot grid).

EEZ, MPA, and coastline geometry are served **simplified** by default (`@turf/simplify`, tolerance ~110–550m depending on the dataset) to fit memory-constrained hosts; set `CONTEXT_DATASET_QUALITY=full` to serve the unsimplified originals on a host with enough RAM. See [Limitations](#limitations).

---

## In-Memory Caching

The backend memoizes its heaviest per-process reads so each is parsed at most once:

- EEZ, MPA, land, and coastline polygon/polyline readers (`apps/backend/src/helpers/utils/datasetUtils.ts`) - the first call parses the source GeoJSON and caches the `FeatureCollection` in module state.
- Bathymetry raster tiles - cached by bounding box after first read.

**Notes:**
- Caches are in-memory only, per server process - not persisted, not shared across instances, and cleared on restart.
- There is no eviction policy; this is acceptable at current (pilot-scale) dataset sizes.

---

## Limitations

Full detail: [docs/limitations.md](docs/limitations.md). In summary:

- **"Unmatched" is a triage indicator, not a conclusion** - it can result from AIS transmission gaps, timing offset between SAR acquisition and AIS reports, or position inaccuracy, and does not imply illegal activity or a "dark vessel."
- **Coastal areas and dense shipping lanes** carry higher uncertainty - more false positives, overlapping AIS tracks, and ambiguous matches.
- **Context-layer boundaries are simplified**, so classification right at an EEZ/MPA/coastline edge (within roughly 100–550m) can occasionally differ from the full-resolution source.
- **AIS coverage is incomplete and non-real-time** - not all vessels transmit, coverage varies by region, and some datasets are temporally downsampled.
- **Some upstream fields are model-based interpretations** (e.g. activity classification) rather than direct observations, and registry/identity fields are self-reported upstream, not independently verified.
- Data freshness and completeness are not guaranteed; results should be interpreted within these constraints.

---

## Data & Terminology Notes

- **AIS-unmatched** means: _unmatched to publicly available AIS used by the detection provider_
- Unmatched ≠ illegal
- Unmatched ≠ confirmed dark vessel
- Scores are for **triage and inspection only**, not probabilities or risk indicators

---

## CI/CD

`.github/workflows/pr-checks.yml` runs on PRs into `master`/`develop` and gates merge:

1. Install dependencies and build shared packages
2. **Backend** - lint, typecheck, build + a health-check smoke test (`/v1/system/health`), unit tests
3. **Frontend** - typecheck, lint, stylelint, unit tests, Playwright e2e
4. Deploy on merge into `master`

---

## Tech Stack

- **Backend** - Node.js, Express 5, TypeScript (CommonJS, built with `tsc`), JWT auth, Turf.js, h3-js, geotiff, jszip, parquetjs
- **Frontend** - React 19, Vite, Zustand, SCSS Modules, MapLibre GL JS, Turf.js, h3-js
- **Shared** - `@packages/{enum,types,utils}` npm workspaces, consumed by both apps
- **Testing** - Jest (unit, both apps), Playwright (frontend e2e)
- **Quality** - ESLint + typescript-eslint, Stylelint, Prettier, `tsc --noEmit`
- **CI/CD** - GitHub Actions

---

## Privacy Note

- No analytics or tracking libraries are included in the app.
- Login (JWT) is required for API access control only, not to collect personal data.
- All SAR, AIS, and context-layer data comes from open, public sources - no proprietary or user-submitted data is processed.

---

## Citation & Attribution

Built on open data and open-source software:

- Global Fishing Watch APIs - SAR detections, AIS match status, vessel identity
- Flanders Marine Institute / MarineRegions.org - EEZ boundaries
- UNEP-WCMC & IUCN / Protected Planet - WDPA Marine Protected Areas
- GEBCO Compilation Group - bathymetry
- MapLibre GL JS, Turf.js, H3, React, Zustand, Express

If citing this prototype: Almer, Alireza. *PHAROS: AIS–SAR Alignment Prototype*.

Code is marked **ISC** in each app's `package.json`.
