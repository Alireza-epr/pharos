# Tech Decisions (Iteration 1)

This document lists the minimal stack choices for Iteration 1 and why they were chosen.
The goal is to keep the prototype small, reproducible, and easy to validate.

---

## 1) Pipeline (ingest + normalize + score)

### Language

- TypeScript (Node.js)

Why:

- Same language as the UI.
- Fast to build a small, practical pipeline.

### Geospatial handling

- AOI is handled as a GeoJSON polygon.
- Events are treated as simple points.

Why:

- Only basic map handling is needed in Iteration 1.

---

## 2) Storage and export formats

### Main table format

- Parquet for storing processed event rows.

Why:

- Efficient for storing and sharing event data.

### Small samples

- GeoJSON for small samples and debugging.

Why:

- Easy to view on a map.

### Evidence export

- parquet outputs
- run metadata JSON
- configuration JSON
- optional GeoJSON samples

Why:

- Makes it possible to review and reproduce a run.

---

## 3) UI

- React + TypeScript
- MapLibre

Why:

- Lightweight and suitable for map-based inspection.

---

## 4) Tests

### Unit tests

- Event normalization
- Scoring logic
- URL-state parsing

### E2E smoke test

- Open the app
- App loads without error
- Set basic filters (AOI/time)
- Trigger data load
- Events appear on the map or list

Why:

- Minimal but real coverage.

---

## 5) CI

On every pull request:

- Lint
- Type check
- Unit tests
- Build

Why:

- Keep main branch stable.

---

## 6) Data flow

AOI/time selection → detection ingest → normalization → context enrichment →
scoring → export → UI → evidence export

---

## 7) URL-state schema

The UI state is stored in the URL.

Parameters:

- aoi
- start
- end
- unmatched
- scoreMin

Why:

- Allows sharing and reproducing views.

---

## Notes

Iteration 1 non-goals:

- Real-time processing
- Global AIS ingestion
- Custom SAR–AIS matching
- Advanced geospatial analysis
- No claims about vessel intent, behavior, or legality
