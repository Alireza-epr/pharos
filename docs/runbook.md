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

Obtain your `GFW_TOKEN` from [Global Fishing Watch API Token](https://globalfishingwatch.org/our-apis/tokens) and place it in a `.env` file inside the `apps/backend` directory. A `.env.example` file is provided for reference.

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
apps/backend/dist/pipeline/sample.js
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

---

## 7. Troubleshooting

If something goes wrong, use the following scripts to diagnose issues:

### Type Checking

```bash
npm run typecheck --workspace=apps/backend
npm run typecheck --workspace=apps/frontend
```

### Linting

```bash
npm run lint --workspace=apps/backend
npm run lint --workspace=apps/frontend
```

### Unit Tests

```bash
npm run test --workspace=apps/backend
npm run test --workspace=apps/frontend
```

### End-to-End Tests

```bash
npm run e2e --workspace=apps/frontend
```

---

## 8. Common Issues

### Pipeline build fails

- Check GFW_TOKEN in `apps/backend/.env`
- Run `npm run typecheck --workspace=apps/backend`

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

