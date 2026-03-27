# Pharos Runbook

This runbook provides step-by-step instructions for setting up the environment, running the pipeline, understanding outputs, and troubleshooting common issues.

---

## 1. Environment Setup

### Prerequisites

Make sure you have the following installed:

- Node.js (recommended: v22.15.0)
- npm or yarn

### Install Dependencies

```bash
npm install
```

---

## 2. Available Environments

The UI supports three environments:

### Development

Runs the app in development mode with hot reload.

```bash
npm run ui:dev
```

### Build

Builds the UI for production.

```bash
npm run ui:build
```

### Preview

Previews the production build locally.

```bash
npm run ui:preview
```

---

## 3. Running the Pipeline

To run the pipeline:

```bash
npm run pipeline:sample
```

### What this does:

1. Builds the pipeline using a custom Vite configuration (vite.config.pipeline.ts)
2. Executes the pipeline script:
   dist/pipeline/pharos.js

---

## 4. Output Location

By default, pipeline outputs are stored in:

data/out/

### Customizing Output

You can change the output directory and other request parameters in:

src/config/pilot.json

---

## 5. Troubleshooting

If something goes wrong, use the following scripts to diagnose issues:

### Type Checking

```bash
npm run typecheck
```

### Linting

```bash
npm run lint
```

### Unit Tests

```bash
npm run test
```

### End-to-End Tests

```bash
npm run e2e
```

---

## 6. Common Issues

### Pipeline build fails

- Run `npm run typecheck`
- Check vite.config.pipeline.ts

### No output generated

- Verify output path in src/config/pilot.json
- Ensure pipeline ran successfully

### UI not loading

- Run `npm install`
- Restart with `npm run ui:dev`

---

## 7. Notes

- Rebuild before running pipeline if changes were made
- Keep pilot.json updated for correct execution
