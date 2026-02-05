# Canonical Event Schema (Iteration 1)

This document defines a **simple and minimal event schema** for Iteration 1.

- One event represents **one SAR vessel detection**.
- AIS data, if present, is stored only as optional context.
- No additional inference or scoring is added.
- All coordinates use **WGS84**.
- All timestamps use **UTC (ISO 8601)**.

---

## Event Fields (Minimum)

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
  GeoJSON geometry (Point).

  ```json
  { "type": "Point", "coordinates": [lon, lat] }
  ```

### Matching indicator

- `matched_flag` (boolean)  
  Indicates whether vessel identity information is present in the SAR record.
  - `true` → identity fields exist
  - `false` → identity fields are empty  
    This follows the dataset decision.

### Source information

- `source` (string)  
  Name of the SAR detection dataset.

- `source_version` (string)  
  Dataset version or identifier (if available).

### Metadata

- `confidence_fields` (object)  
  Confidence-related fields from the source, if any.  
  Empty object `{}` if not provided.

- `raw_metadata` (object)  
  Original SAR record stored without modification.

- `run_metadata` (object)  
  Information needed to reproduce the run:
  - configuration hash
  - code version
  - context layer versions

### Optional

- `ais_context` (object or null)  
  Optional AIS records for reference only.  
  Not used for matching or decision-making.

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
  "source": "gfw_sar_presence",
  "source_version": "unknown",
  "confidence_fields": {},
  "raw_metadata": { "...": "original SAR fields" },
  "run_metadata": {
    "config_hash": "...",
    "code_version": "...",
    "context_layer_versions": { "...": "..." }
  },
  "ais_context": null
}
```

---

## Notes

- The schema is intentionally minimal.
- No new confidence or likelihood values are created.
- All interpretation is left to the user.
