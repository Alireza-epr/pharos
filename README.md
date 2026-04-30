# PHAROS

PHAROS is an early-stage prototype for exploring **AIS–SAR alignment** using open maritime datasets.
The focus of Iteration 1 is on **data access, normalization, transparency, and reproducibility** - not on real-time monitoring or enforcement claims.

---

## Project Scope (Iteration 1)

PHAROS is designed to:

- Retrieve SAR vessel detections from open Sentinel-1–derived datasets
- Inspect whether detections are matched or unmatched to **publicly available AIS** (as provided by the data source)
- Present results on a simple map-based UI for manual inspection
- Export evidence bundles for review and validation

PHAROS **does not**:

- Claim detection of illegal or “dark” vessels
- Infer vessel intent or behavior
- Perform custom SAR–AIS matching
- Provide real-time monitoring

---

## Repository Structure

```text
apps/
  backend/         # Node.js + Express backend
  frontend/        # React + Vite frontend

docs/              # Design, specifications, and validation documents
packages/          # Shared helpers and utilities for both backend and frontend
infrastructure/    # Docker, deployment configuration, and scripts
```

---

## Scripts

Common scripts (from repo root):

```bash
# run a fixed sample pipeline and write outputs
npm run pipeline:sample

# run a fixed sample validation and write outputs
npm run pipeline:validation

# start UI in dev mode
npm run frontend:dev

# build UI
npm run frontend:build

# preview production build
npm run frontend:preview

# download dataset
npm run setup:data

```

For more information, please refer to [the runbook](docs/runbook.md).

Important: Obtain your GFW_TOKEN from Global Fishing Watch API Token
and place it in a .env file inside the apps/backend directory. A .env.example file is provided for reference. For more information, see the API documentation https://globalfishingwatch.org/our-apis/tokens

---

## Docker

From `infrastructure/` folder:

```bash
cp .env.example .env
docker-compose up --build
```

- Backend: port `1370`
- Frontend: port `5173`

> Backend health is checked every 30s. Frontend waits at startup for backend.

---

## CI/CD

This repository uses **GitHub Actions** to automatically:

1. Install dependencies
2. Run lint and unit/E2E tests
3. Build the project
4. Deploy when merged into `master`

---

## Data & Terminology Notes

- **AIS-unmatched** means: _unmatched to publicly available AIS used by the detection provider_
- Unmatched ≠ illegal
- Unmatched ≠ confirmed dark vessel
- Scores are for **triage and inspection only**, not probabilities or risk indicators
