# Testing — Running Tests Locally

This guide explains how to run the PHAROS test suites on your machine. The same
checks run automatically on every pull request.

---

## 1. What we test

PHAROS is an npm-workspace monorepo (`apps/*`, `packages/*`). There are three
test layers:

| Layer                | App             | Runner               | Location                          |
| -------------------- | --------------- | -------------------- | --------------------------------- |
| Backend unit tests   | `apps/backend`  | Jest (`ts-jest`)     | `apps/backend/tests/`             |
| Frontend unit tests  | `apps/frontend` | Jest (`ts-jest`)     | `apps/frontend/tests/`            |
| Frontend E2E (smoke) | `apps/frontend` | Playwright (Chromium)| `apps/frontend/tests/e2e/`        |

The backend unit tests stub heavy/native dependencies.

The E2E smoke test stubs the backend with `page.route`, so it needs **no running
API** - Playwright builds and previews the frontend itself.

---

## 2. Prerequisites

- **Node.js `22.15.0`** (pinned in [`.nvmrc`](../../.nvmrc)). With `nvm`, run
  `nvm use` from the repo root.
- **Install dependencies** once from the repo root — this covers every workspace:

  ```bash
  npm install
  ```

- **Build the shared packages** before the first test run (and again after
  editing anything under `packages/*`). The tests import from `@packages/*`:

  ```bash
  npm run packages:build
  ```

> No secrets are required to run the tests. `GFW_TOKEN` / `JWT_SECRET` are needed
> to *run* the backend, but the unit tests mock the config loader and the E2E
> test mocks the API.

---

## 3. Run everything

From the repo root:

```bash
# Frontend + backend unit tests
npm test

# Frontend end-to-end (Playwright) tests
npm run e2e
```

To reproduce the full PR gate locally (matches CI ordering):

```bash
npm run typecheck      # backend + frontend tsc --noEmit
npm run lint           # backend + frontend ESLint
npm run lint:style     # frontend Stylelint (SCSS)
npm test               # backend + frontend unit tests
npm run e2e            # frontend Playwright smoke test
```

---

## 4. Backend unit tests

```bash
# From the repo root
npm run backend:test
# …or scope to the workspace
npm run test --workspace=apps/backend
# …or from inside the app
cd apps/backend && npm test
```

Under the hood this runs `jest --passWithNoTests -t .*`.

Useful variations (run from `apps/backend`):

```bash
# A single file
npx jest tests/applyFilter.spec.ts

# Tests whose name matches a pattern
npx jest -t "validateBodyParams"

# Watch mode while developing
npx jest --watch
```
---

## 5. Frontend unit tests

```bash
# From the repo root
npm run test --workspace=apps/frontend
# …or from inside the app
cd apps/frontend && npm test
```

This runs `jest --passWithNoTests`, so it succeeds even when no `*.test.ts(x)` /
`*.spec.ts(x)` files exist yet. Add new unit tests under `apps/frontend/tests/`.

---

## 6. Frontend E2E tests (Playwright)

```bash
# From the repo root
npm run e2e
# …or from inside the app
cd apps/frontend && npm run e2e
```

### One-time browser install

Playwright needs its browser binaries. Install Chromium (the only browser CI
uses) once:

```bash
cd apps/frontend
npx playwright install --with-deps chromium
```

> On Windows, drop `--with-deps` (it installs Linux system libraries and is a
> no-op / unsupported there): `npx playwright install chromium`.

### How it runs

Configured in
[`apps/frontend/playwright.config.ts`](../../apps/frontend/playwright.config.ts):

- `webServer` runs `npm run build && npm run preview` and waits for
  `http://localhost:4173/` — you do **not** start the app yourself.
- Outside CI, `reuseExistingServer` is on, so an already-running preview server
  on `:4173` is reused.
- The locale is pinned to `en-US` so English UI strings are asserted
  deterministically.

---

## 7. Troubleshooting

| Symptom                                              | Fix                                                                                          |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `Cannot find module '@packages/...'`                 | Run `npm run packages:build` from the repo root.                                             |
| Type errors only in tests                            | Re-run `npm install`, then `npm run typecheck`.                                              |
| Playwright: `browserType.launch: Executable doesn't exist` | Run `npx playwright install chromium` in `apps/frontend`.                              |
| Playwright: port `4173` already in use               | Stop the stray `vite preview` (or let it be reused outside CI).                              |
| E2E flakiness / timeouts on first run                | The `webServer` build can take a while; the config allows up to 120s for startup. Re-run.    |
| Backend `pipeline.spec.ts` slow                      | Expected — it builds and shells out via `execSync`. Scope to other specs while iterating.    |

---

## 8. CI reference

The PR check job (Ubuntu, Node from `.nvmrc`) runs, in order: install → build
shared packages → backend lint, typecheck, startup smoke, unit tests → frontend
typecheck, lint, style lint, unit tests → install Chromium → frontend E2E. If
all the commands in [section 3](#3-run-everything) pass locally, the PR should be
green.
