# PHAROS

PHAROS is an early-stage prototype for exploring **AIS–SAR alignment** using open maritime datasets.
The focus of Iteration 1 is on **data access, normalization, transparency, and reproducibility** — not on real-time monitoring or enforcement claims.

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
src/
  pipeline/
    ingest/        # data access
    normalize/     # canonical event shaping
    features/      # simple derived fields
    scoring/       # triage score & uncertainty
    export/        # parquet / geojson outputs
    sample.ts      # sample pipeline run

  ui/              # React + Vite UI shell

docs/              # design, specs, validation docs
tests/             # unit tests
e2e/               # end-to-end smoke tests
```

## Scripts

Common scripts (from repo root):

```bash
# run a fixed sample pipeline and write outputs
npm run pipeline:sample

# start UI in dev mode
npm run ui:dev

# build UI
npm run ui:build

# lint / format / typecheck
npm run lint
npm run format
npm run typecheck
```

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
