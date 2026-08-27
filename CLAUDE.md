# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What PHAROS is

Early-stage prototype for **AIS–SAR alignment** using open maritime datasets. It retrieves SAR vessel detections (Sentinel-1–derived), inspects whether each is matched/unmatched to publicly available AIS, scores them for triage, and presents them on a map UI with exportable evidence bundles.

Domain framing that must be preserved in code, copy, and i18n strings:
- **"AIS-unmatched" = unmatched to the publicly available AIS used by the detection provider.** Unmatched ≠ illegal, ≠ confirmed "dark" vessel.
- Scores are for **triage and inspection only** — never present them as probabilities or risk indicators.
- The app does not claim dark-vessel detection, infer intent, perform custom SAR–AIS matching, or do real-time monitoring.

## Monorepo layout

npm workspaces (`apps/*`, `packages/*`), Node `22.15.0` (`.nvmrc`).

- `apps/backend` — Node + Express API **and** the offline data pipeline. CommonJS, built with `tsc`.
- `apps/frontend` — React 19 + Vite + Zustand, SCSS modules. ESM.
- `packages/{enum,types,utils}` — `@packages/*` shared code imported by BOTH apps. **These must be built before either app** (`npm run packages:build`); apps consume their compiled `dist/`, so changes to a package aren't visible until rebuilt.
- `docs/` — specs, runbook, API/auth docs. `infrastructure/` — Docker + OpenAPI generation scripts.

## Commands (run from repo root)

```bash
npm install                 # installs all workspaces
npm run packages:build      # build shared packages — do this first, and after editing any packages/*
npm run dev                 # packages:build, then backend + frontend concurrently
npm run build               # packages -> backend -> frontend
npm run lint                # frontend (eslint) + backend (eslint)
npm run lint:style          # stylelint over frontend SCSS
npm run typecheck           # tsc --noEmit, both apps
npm run test                # jest unit tests, both apps
npm run e2e                 # Playwright (frontend)
```

Per-app variants exist as `frontend:*` / `backend:*` (e.g. `npm run frontend:typecheck`). The frontend also has the `@/*` -> `src/*` path alias.

### Running a single test
Jest tests live in each app's `tests/` dir (root is `<rootDir>/tests`, not co-located with `src`). Frontend e2e specs (`tests/e2e/`) are excluded from Jest and run only via `npm run e2e`.

```bash
# by file
npm --prefix apps/frontend run test -- tests/foo.test.ts
# by test name (overrides the backend script's baked-in `-t .*`)
npm --prefix apps/backend run test -- -t "matches detection"
```

### Test naming convention
Test-case descriptions are **`snake_case`, no spaces** (words joined by `_`), matching the existing specs:
- `it(...)`/`test(...)`: e.g. `it('parses_a_valid_ISO_range', ...)`, `it('keeps_one_row_per_event_id_in_stable_id_sorted_order', ...)`. Acronyms keep case (`ISO`, `UTC`, `AOI`, `EEZ`); drop punctuation; keep identifiers intact (`event_id`).
- `describe(...)`: the unit's identifier (camelCase fn name, e.g. `validateBodyParams`) or a `Capitalized_With_Underscores` concept (e.g. `Hotspot_generation`, `Coverage_manifest`).

### Data pipeline
The pipeline (`apps/backend/src/pipeline`, entry `sample.ts`) is config-driven via `apps/backend/src/config/*.json`:

```bash
npm run pipeline:sample          # uses pilot.json
npm run pipeline:validation
npm run setup:data               # downloads bathymetry rasters (Windows shell syntax in the script)
```

## Backend architecture

- `src/core/server.ts` — Express bootstrap: middleware chain (CORS check → json → request/response loggers → CORS → attach start-time/git-SHA), then routes mounted under `/v1` by `EBaseRoutes` (`system`, `auth`, `events`, `exports`, `regions`, `vessels`).
- `src/modules/<name>/` — feature slice: `*.routes.ts` + `*.controllers.ts`. System routes are unauthenticated; others sit behind auth. `regions` serves EEZ/MPA/coastline boundary geometry (context-layer map toggles); `vessels` wraps the GFW Vessels API for the Vessel tab's search and on-demand vessel-identity enrichment.
- `src/services/` — `IOService` (parquet/file IO), `RouteService`, `GenericComService`.
- `src/pipeline/` — staged offline flow: `ingest → normalize → features → aggregate → schema → export` (+ `validation`).
- Helpers under `src/helpers/{utils,types,enum,fixtures}`; `typeRoots` includes `src/helpers/types` so ambient types resolve there.

### Auth
Backend issues a short-lived **access** JWT and a long-lived **refresh** JWT, both signed with `JWT_SECRET`. Frontend attaches the access token and silently refreshes on expiry. Protected endpoints (e.g. `/v1/events`) reject requests without a valid access token. See `docs/api/authentication.md`.

### Required env (`apps/backend/.env`, see `.env.example`)
- `DETECTION_TOKEN` — detection-provider API token (Global Fishing Watch in this iteration).
- `JWT_SECRET` — long random string; different per environment; must match the keys CI injects. Never commit it.

## Frontend architecture

- State is **Zustand stores**, one per concern, in `src/stores/` (`eventStore`, `filterStore`, `detailStore`, `contextLayersStore`, `loginStore`, `paginationStore`, etc.). Prefer extending the relevant store over lifting ad-hoc state into components.
- Components in `src/components/{layout,map,sidebar,table,blocks,common}`. Map rendering uses MapLibre GL; geo math uses `@turf/turf`.
- `<Section>` / `<SectionItem>` use the `collapsible` prop as a tri-state: omitted = always open with no toggle UI; `true` = starts open and toggleable; `false` = starts collapsed and toggleable.
- Domain model: an **"event"** is a SAR detection carrying scoring, hotspot context, and context layers (EEZ / MPA / Bathymetry). Core types live in `packages/types/src/eventTypes.ts`; enums (`EConfidenceTiers`, `EHotspotStrength`, `EReasonCodes`, `EContextLayers`) in `packages/enum/src/`. Sample/dev data: `src/helpers/fixtures/`.

### TypeScript strictness (frontend) — known gotchas
`noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` are ON, plus `noUnusedLocals`/`noUnusedParameters`.
- CSS-module class maps are typed `{ [key: string]: string }`, so indexing returns `string | undefined`. **Do not annotate helpers that return a CSS class name with `: string`** — let TS infer (it will be `string | undefined`).
- `t()` is type-safe: its key type is derived from `en.json`. Referencing a key absent from `en.json` is a compile error (TS2345), so **add the key to `en.json` first**.

### Styling conventions
- SCSS modules only; class names are **kebab-case in `.scss`, camelCase in TSX** (`.badge-matched` → `style.badgeMatched`).
- **Never hardcode colors/sizes** — use CSS variables/design tokens: `--theme-*` (bg/text/border), `--padding-*`, `--radius-sm|md`, color ramps `--color-primary-purple*`, `--color-accent-teal*`, `--color-alert-orange*`.
- Use global utility classes for typography/state (`font-size-*`, `font-family-header|tech`, `font-*` weights, `scrollbar`, `hover/active/disabled/focus`) rather than re-declaring them.

### i18n (`apps/frontend/src/locales/{en,de}.json`)
Read via `t('a.b.c')` from `useTranslator()`. Maintenance rules (enforced, not optional):
- **`en.json` and `de.json` must have identical key sets** (`en.json` is the canonical shape and the type source; `de.json` parity is checked separately — script/manual).
- **No duplicate values within a locale.** If two used keys share a value, consolidate to ONE canonical key (`general.label.*` for app-wide, `sidebar.label.*` for shared fields) and update referencing components. Cross-namespace reuse is expected.
- **Source of truth is component usage:** a key referenced nowhere is removed from both locales; a key referenced but missing is added to both.

## CI / definition of done

`.github/workflows/pr-checks.yml` runs on PRs to `master` and gates merge. Before pushing, mirror it locally — backend **lint, typecheck, build + health-check smoke (`/v1/system/health`), unit tests**; frontend **typecheck, lint, lint:style, unit tests, Playwright e2e**. Deploy happens on merge to `master`. OpenAPI is generated/linted by separate workflows (`generate-openapi.yaml`, `lint-openapi.yaml`; spec rules in `.spectral.yaml`).

## Commit & branch conventions
Commits follow **Conventional Commits** (`feat:`, `fix:`, `docs:`, `chore:`, `build:`, `test:`, `style:`, `refactor:`, `perf:`) — keep new commits consistent with the existing history. Work happens on feature branches off `develop`; PRs target `master` (which runs `pr-checks.yml` and deploys on merge). The `/format-and-push` and `/git-commit-formatter` skills exist to normalize messages into this style.

## Docker
Both apps' `.env` are gitignored and read from the build context, so create them from their `.env.example` first: `cp apps/backend/.env.example apps/backend/.env` (fill in `DETECTION_TOKEN`/`JWT_SECRET`) and `cp apps/frontend/src/.env.example apps/frontend/src/.env`. Then, from `infrastructure/`: `docker-compose up --build` → backend `:1370`, frontend `:5173` (frontend waits on backend health).

## Project notes
- Personal planning/AI-leverage notes live under `docs/planning/` and `docs/knowledge/`, which are **git-ignored** — they won't appear in `git status` or a fresh clone, so check the working tree before assuming they're absent. Proposals are versioned at repo root (`Proposal_V3.md`, `Proposal_V4.md`); when asked to "update the proposal," create the next version rather than overwriting.
