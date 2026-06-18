# Canonical Event Schema (Iteration 1)

This document defines a **event schema** for Iteration 1.

- A record represents the aggregated observation of vessel activity (or detections) within a specific grid cell during a specific time bucket.
- AIS data, if present, is stored only as optional context.
- All coordinates use **WGS84**.
- All timestamps use **UTC (ISO 8601)**.

---

## Event Fields

### Core fields

- `event_id` (string)  
  Deterministic identifier for the event.  
  Created as a hash of basic fields (source, time, location).

- `timestamp_utc` (string)  
  Derived from the start of the aggregation bucket (date) and represents the beginning of the time interval in which the detection occurred. It is not the exact detection time. The format is UTC.

- `lon` (number)  
  Longitude in decimal degrees (WGS84). Represents the center of the spatial grid cell in which detections occurred, not the exact vessel position.

- `lat` (number)  
  Latitude in decimal degrees (WGS84). Represents the center of the spatial grid cell in which detections occurred, not the exact vessel position.

- `geom` (object)  
  GeoJSON geometry.

- `version` (string)  
  Code version used when the records were fetched.

Longitude and latitude coordinates are represented with 3 decimal places for consistency.

### Matching indicator

- `matched_flag` (boolean)  
  Indicates whether vessel identity information is present in the SAR record.
  - `true` → identity fields exist
  - `false` → identity fields are empty  
    This follows the dataset decision.

Note: This property is available only in the public-global-sar-presence dataset. In all other datasets, this field is not included in the event schema.

### Source information

- `source` (string)  
  Name of the datasets with version.

### Metadata

- `confidence_proxy` (number or null)  
  Confidence-related fields from the source, if any.

- `confidence_tier` (enum)  
  Indicates the relative strength of the signal within the same spatial grid cell and time bucket, derived from provider metadata. It reflects observation intensity and signal consistency, not probability or certainty of vessel identity. For additional details, refer to [confidence-tier](../tech/confidence-tier.md)

  This value must be interpreted as a qualitative tier, not as a statistical probability or confidence score.

- `raw_metadata` (object)  
  Original entry record stored without modification.

- `raw_event_metadata` (object)  
  Original event record stored without modification.

- `run_metadata` (object)  
  Information needed to reproduce the run:
  Includes:
  - `config_hash`: deterministic hash of the executed configuration
  - `config_json`: full API request configuration used for data generation
  - `dataset_version`: input dataset versions used in processing
  - `context_layer_versions`: versions of geospatial enrichment layers
  - `git_commit_version`: exact pipeline code version
  - `run_time`: execution timestamp
  - `execution_duration_sec`: runtime performance metric

- `context_layers` (object)  
  Geographic context information derived from datasets.
  Explanation in [context-layers](./context-layers.md).

  Each context layer includes:
  - dataset - name of the dataset used for enrichment
  - version - pinned dataset version
  - enrichment - attributes

- `distance_to_coast_km` (number)
  Calculating by the Coastline Polylines dataset

### Scoring

- `triage_score` (number or null)
- `uncertainty_score` (number or null)
- `reason_codes` (list of strings)  
  Explanation in [scoring-spec](../tech/scoring-spec.md).

---

### Rejected Event Schema

If validation fails during record normalization, the following schema will be returned:

- `rejected` (boolean<true>)
- `reasons` (string[])  
  Description of why the record was rejected.
- `raw_metadata` (object)  
  Original record stored without modification.
- `raw_event_metadata` (object)  
  Original event record stored without modification.
- `run_metadata` (object)  
  Information needed to reproduce the run:
  - configuration hash
  - configuration json
  - git commit version

---

### Hotspot

Each event includes a reference to the H3 cell in which it is located, along with aggregated hotspot context signals derived from spatial and temporal analysis over the defined pilot period.

The hotspot signals are computed based on event data within the pilot scope (defined by the selected geographic area and time window). As a result, all values are relative to the current pilot configuration and may vary when the spatial extent or time range changes.

- `hotspot`: (object)  
  Represents the hotspot context of the event's spatial location.
  - `cell_id`: (string)  
    H3 index of the hexagonal grid cell where the event is located.

  - `signals`: (object)  
    Aggregated hotspot indicators computed from events within the pilot period for the same H3 cell.
    - `recurrence_count`: (number)  
      Total number of unmatched events historically observed in the same H3 cell within the pilot period.

    - `time_bins_with_unmatched`: (number)  
      Number of distinct time bins within the pilot period in which at least one unmatched event occurred in the cell.

    - `hotspot_strength`: (enum)  
      Qualitative classification of hotspot persistence and intensity based on recurrence and temporal distribution of activity within the pilot scope.

---

## Example (Unmatched Event)

```json
{
  "event_id": "sha256(...)",
  "timestamp_utc": "2025-12-21T17:01:09Z",
  "lon": 12.75,
  "lat": 54.53,
  "geom": { "type": "Point", "coordinates": [12.75, 54.53] },
  "matched_flag": false,
  "source": "gfw_sar_presence:v3:0",
  "confidence_proxy": null,
  "confidence_tier": "low",
  "raw_metadata": { "...": "original entry fields" },
  "raw_event_metadata": { "...": "original event fields" },
  "run_metadata": {
    "config_json": "...",
    "config_hash": "...",
    "git_commit_version": "..."
  },
  "scoring": {
    "triage_score": null,
    "uncertainty_score": null,
    "reason_codes": [""]
  },
  "distance_to_coast_km": 0,
  "context_layers": {
    "EEZ": {
      "dataset": "World_EEZ_20231025_LR",
      "version": "v12",
      "enrichments": []
    },
    "MPA": {
      "dataset": "WDPA_WDOECM_APR2026",
      "version": "v1.6",
      "enrichments": []
    },
    "Bathymetry": {
      "dataset": "gebco_2025_sub_ice_topo",
      "version": "v2.7",
      "enrichments": []
    }
  },
  "rejected": false,
  "hotspot": {
    "cell_id": "851f2a47fffffff",
    "signals": {
      "recurrence_count": 12,
      "time_bins_with_unmatched": 5,
      "hotspot_strength": "high"
    }
  }
}
```

---

## Notes

- The schema is intentionally minimal.
- No new confidence or likelihood values are created.
- All interpretation is left to the user.
