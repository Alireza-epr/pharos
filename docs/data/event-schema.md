# Canonical Event Schema (Iteration 1)

This document defines a **event schema** for Iteration 1.

- One event represents **one SAR vessel detection**.
- AIS data, if present, is stored only as optional context.
- No additional inference or scoring is added.
- All coordinates use **WGS84**.
- All timestamps use **UTC (ISO 8601)**.

---

## Event Fields

### Core fields

- `event_id` (string)  
  Deterministic identifier for the event.  
  Created as a hash of basic fields (source, time, location).

- `timestamp_utc` (string)  
  Event time in ISO 8601 UTC.  
  Source: SAR `entryTimestamp`.

- `lon` (number)  
  Longitude in decimal degrees (WGS84).

- `lat` (number)  
  Latitude in decimal degrees (WGS84).

- `geom` (object)  
  GeoJSON geometry.

- `version` (string)  
  Code version used when the records were fetched.

### Matching indicator

- `matched_flag` (boolean)  
  Indicates whether vessel identity information is present in the SAR record.
  - `true` → identity fields exist
  - `false` → identity fields are empty  
    This follows the dataset decision.

### Source information

- `source` (string)  
  Name of the datasets with version.

### Metadata

- `confidence_fields` (number or null)  
  Confidence-related fields from the source, if any.
- `raw_metadata` (object)  
  Original SAR record stored without modification.

- `raw_event_metadata` (object)  
  Original event record stored without modification.

- `run_metadata` (object)  
  Information needed to reproduce the run:
  - configuration hash
  - configuration json
  - code version

- `context_layers` (object)  
  Geographic context information derived from the event record.

  Each context layer includes:
  - dataset - name of the dataset used for enrichment
  - version - pinned dataset version
  - enrichment - attributes including id and label

- `distance_to_coast_km` (number)
  Calculating by the Coastline Polylines dataset

### Scoring

- `triage_score` (number or null)
- `uncertainty_score` (number or null)
- `reason_codes` (list of strings)  
  Explanation in `tech/scoring-spec.md`.

---

### Rejected Event Schema

If validation fails during record normalization, the following schema will be returned:

- `rejected` (boolean<true>)
- `reason` (string)  
  Description of why the record was rejected.
- `raw_metadata` (object)  
  Original SAR record stored without modification.

---

## Example (Unmatched SAR Event)

```json
{
  "event_id": "sha256(...)",
  "timestamp_utc": "2025-12-21T17:01:09Z",
  "lon": 12.75,
  "lat": 54.53,
  "geom": { "type": "Point", "coordinates": [12.75, 54.53] },
  "matched_flag": false,
  "source": "gfw_sar_presence:v3:0",
  "confidence_fields": 2,
  "raw_metadata": { "...": "original SAR fields" },
  "raw_event_metadata": { "...": "original event fields" },
  "run_metadata": {
    "config_json": "...",
    "config_hash": "...",
    "code_version": "..."
  },
  "scoring": {
    "triage_score": null,
    "uncertainty_score": null,
    "reason_codes": [""]
  },
  "distance_to_coast_km" : 0,
  "context_layers:" {
    "EEZ": {
        "dataset": "public-eez-areas",
        "version": "v3",
        "enrichments": []
    },
    "MPA": {
        "dataset": "public-mpa-all",
        "version": "v3",
        "enrichments": []
    },
    "RFMO": {
        "dataset": "public-rfmo",
        "version": "v3",
        "enrichments": []
    }
  },
  "rejected": false
}
```

---

## Notes

- The schema is intentionally minimal.
- No new confidence or likelihood values are created.
- All interpretation is left to the user.
