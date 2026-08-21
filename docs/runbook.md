# Pharos Runbook

This runbook provides step-by-step instructions for setting up the environment, running the pipeline, understanding outputs, and troubleshooting common issues.

---

## 1. Environment Setup

### Prerequisites

Make sure you have the following installed:

- Node.js (recommended: v22.15.0)
- npm or yarn
- Docker & Docker Compose

---

### Token

Set `DETECTION_TOKEN` - the detection-provider API token. **In this iteration the provider is Global Fishing Watch**, so obtain the token from the [Global Fishing Watch API Token](https://globalfishingwatch.org/our-apis/tokens) page and place it in a `.env` file inside the `apps/backend` directory. A `.env.example` file is provided for reference.

---

### Install Dependencies

From the root of the repo:

```bash
npm install
```

> This installs dependencies for all workspaces: `apps/*` and `packages/*`.

---

## 2. Available Environments

The UI supports three environments:

### Development

Runs the app in development mode with hot reload.

```bash
npm run frontend:dev
```

### Build

Builds the UI for production.

```bash
npm run frontend:build
```

### Preview

Previews the production build locally.

```bash
npm run frontend:preview
```

### Full Stack (backend + frontend together)

Run both apps from the repo root:

- **Development (hot reload):** builds the shared packages, then starts the
  backend (ts-node) and the Vite dev server concurrently.

  ```bash
  npm run dev
  ```

- **Production-style (build & serve):** builds packages, backend, and frontend,
  then runs the compiled backend server alongside the Vite preview of the built
  UI.

  ```bash
  npm start
  ```

> Both use `concurrently`, so a single `Ctrl-C` stops backend and frontend
> together.

---

## 3. Running the Pipeline

To run the backend pipelines:

```bash
npm run pipeline:sample

npm run pipeline:validation
```

### What this does:

1. Builds the pipeline using the root workspace setup
2. Executes the pipeline script in:

```text
apps/backend/dist/src/pipeline/sample.js
```

### Configuration

The sample pipeline supports a --config parameter. The config path is relative to the backend src directory.
Do not include backend in the path.

- Default config:

```text
src/config/pilot.json
```

- Example alternative config (unmatched-heavy export):

```text
src/config/pilot_unmatched.json
```

---

## 4. Dataset Setup (Bathymetry Rasters)

Some backend features depend on a large bathymetry dataset that is not included in the repository due to its size.
After starting the system, run the following command to download and extract the dataset:

```bash
npm run setup:data
```

This will:

- Download the dataset from S3
- Extract it into:

```text
apps/backend/data/bathymetry_rasters/
```

- Remove the temporary .zip file

**Important Notes**

- The dataset size is approximately **4.5GB**
  - Download time depends on your internet speed
  - May incur bandwidth costs depending on your network/provider
- If this step is skipped or fails:
  - `bathymetry` data in events will **NOT be available**
  - All other application features will continue to work normally

### System Requirements

To run `npm run setup:data`, ensure your system has:

- curl
- tar (with zip support) or a compatible extraction tool

#### Windows

- Works in PowerShell (Windows 10+)
- Uses built-in curl and tar

#### Linux (Ubuntu/Debian)

sudo apt install curl

#### macOS

brew install curl

### Troubleshooting

If the command fails:

- Ensure the output directory exists:
  mkdir -p apps/backend/data/bathymetry_rasters

- Check if curl is available:
  curl --version

- Retry the command:
  npm run setup:data

---

## 4b. Context Layer Dataset Quality (EEZ / MPA / Coastline)

The EEZ, MPA, and coastline boundary files each ship two versions in the repo:

- `*.geojson` - simplified (default). Fits a memory-constrained host.
- `*.full.geojson` - the original, unsimplified upstream geometry.

Controlled by `CONTEXT_DATASET_QUALITY` in `apps/backend/.env` (`simplified` | `full`, defaults to `simplified`).

`GET /v1/regions` (the EEZ/MPA option list behind the Area of Interest dropdowns) reads these same files to compute each region's bbox/centroid, so it's subject to the same setting. Unlike the point-in-polygon serving path — which only loads them when a query actually uses a named-region AOI — this endpoint loads them on its first hit, which in practice means on first sidebar load of any session. On a memory-constrained host this brings the cost forward; see the deferred fix noted for this in project memory (precompute a small `{id, title, bbox, centroid}` file offline instead of reading the full boundary files at request time).

---

## 5. Output Location

By default, pipeline outputs are stored in:

```text
apps/backend/data/out/
```

### Customizing Output

You can change the output directory and other pipeline request parameters in:

```text
apps/backend/src/config/pilot.json
```

---

## 6. Running via Docker Compose

From the `infrastructure/` folder:

```bash
docker-compose up --build
```

- Backend container runs on port `1370` (default, can be overridden via `.env`)
- Frontend container runs on port `5173`

> Backend health is checked periodically every 30s. Frontend will wait until backend container is available at startup.

> The images contain the API server and the built frontend only. Large datasets
> (bathymetry rasters and the coastline/EEZ/MPA polygons) are **not** baked into
> the image - they are used solely by the host-run pipeline (see sections 3–4),
> so excluding them keeps the build context small.

### Recording the commit SHA (optional)

Exports embed the source commit SHA for provenance. The image has no `.git`, so
pass it as a build arg; it defaults to `N/A` when omitted.

```bash
# bash / sh
GIT_COMMIT_SHA=$(git rev-parse HEAD) docker-compose up --build
```

```powershell
# PowerShell
$env:GIT_COMMIT_SHA = git rev-parse HEAD; docker-compose up --build
```

---

## 7. Troubleshooting

If something goes wrong, use the following scripts to diagnose issues:

### Type Checking

```bash
npm run backend:typecheck
npm run frontend:typecheck
```

### Linting

```bash
npm run backend:lint
npm run frontend:lint
```

### Unit Tests

```bash
npm run backend:test
npm run frontend:test
```

### End-to-End Tests

```bash
npm run frontend:e2e
```

---

## 8. Common Issues

### Pipeline build fails

- Check DETECTION_TOKEN in `apps/backend/.env`
- Run `npm run backend:typecheck`

### No output generated

- Verify output path in `apps/backend/src/config/pilot.json`
- Ensure pipeline ran successfully

### UI not loading

- Run `npm install`
- Restart with `npm run frontend:dev`

### Docker-related issues

- Check container logs:

```bash
docker-compose logs backend
docker-compose logs frontend
```

---

## 9. Notes

- Rebuild packages before running pipeline if changes were made:

```bash
npm run packages:build
```

- Keep `pilot.json` updated for correct execution
