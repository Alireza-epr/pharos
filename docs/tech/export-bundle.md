# Export Bundle

## Overview

This bundle contains a filtered and scored set of events enriched with geospatial context layers. Each event is evaluated using a rule-based scoring model producing a **triage score**, **uncertainty score**, and associated **reason codes**.

---

## Files in this bundle

The output of this bundle is a ZIP file containing the following data:

### 1. `events.csv`

Tabular representation of selected events with:

- Raw geospatial fields
- Context flags
- Confidence and scoring outputs
- Binary feature indicators used in scoring

Note: CSV includes derived boolean flags and numeric enrichments used in scoring logic.

---

### 2. `events.geojson`

GeoJSON representation of the same events for spatial workflows.

Each feature contains:

- Geometry (Point)
- Core event properties
- `context_layers` (object)
- `scoring` (object)

For additional details:

- Scoring specification: [`scoring-spec.md`](./scoring-spec.md)
- Context layers documentation: [`context-layers.md`](../data/context-layers.md)

This format is intended for GIS tools and spatial analysis pipelines.

---

### 3. `run_metadata.json`

Execution and configuration traceability file, including queries and scoring configuration used for data export.

This file ensures **reproducibility and auditability** of the pipeline run.

For additional details:

- Event Schema: [`event-schema.md`](../data/event-schema.md)

---

## Scoring configuration

Thresholds and weights used in the scoring model are defined in:

`apps/backend/src/config/pilot.json`

These parameters control:

- Feature weighting
- Spatial thresholds
- Confidence tier boundaries
- Penalties for missing or noisy signals

---

## Interpretation Notes

### 1. Scores are comparative, not absolute

- Not calibrated as probabilistic likelihoods
- The framework does not infer intent or determine legality
- Results should be used for prioritization and review, not decision enforcement

### 2. Context layers are versioned

Different enrichment dataset versions may produce slightly different outputs.

### 3. GeoJSON is authoritative for spatial analysis

- CSV is a flattened representation
- GeoJSON preserves hierarchical structure and is preferred for GIS workflows

---

## Triage Warning

**Unmatched is triage, not absence of activity**

Events marked as:

- `unmatched_to_public_ais = true`

do not imply invalid or false detections. They indicate:

- missing AIS correlation
- potential dark activity signals
- incomplete reference coverage

These cases should be treated as **investigation candidates**, not discarded data.

---

## Reproducibility

To reproduce this dataset, use `config_json` from `run_metadata.json`.

---

## Audit Log

In addition to the ZIP file, an audit log is generated containing the following information:
`user`: Information about the user who initiated the request.
`date`: The date and time when the ZIP file was created.
`eventCount`: The total number of exported events.
`configHash`: A hash generated from the query parameters and request body used to retrieve the events.
`exportId`: The unique identifier of the export, which is also used as the ZIP file name.
