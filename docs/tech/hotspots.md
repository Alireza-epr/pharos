# Hotspots Analytics Documentation

## 1. Overview

Hotspots identify areas with concentrated events within the AOI. They allow tracking both **spatial density** and **temporal recurrence** of events.

We use **H3 hexagons** for spatial aggregation. Hexagons provide:

- Reduced distortion compared to squares
- Equal distance to neighbors
- Better support for recurrence and heatmap analytics

---

## 2. Grid Parameters

These settings are defined in `apps/backend/src/config/pilot.json`.

### Spatial Resolution

The hotspot spatial resolution is configurable via:

```json
"hotspotResolution": 5
```

Allowed values: `0` to `15`.

---

### Time Bin Configuration

Hotspot temporal aggregation can be configured using:

```json
"hotspotTimeBin": "DAILY" | "HOURLY"
```

| Value      | Behaviour                        |
| ---------- | -------------------------------- |
| `DAILY`    | Aggregates events per day        |
| `HOURLY`   | Aggregates events per hour       |

---

## 3. Hotspot Aggregation

**Aggregation scheme:** H3 hexagon + configurable `time_bin`

**Metrics computed per `(cell_id, time_bin)` row:**

| Field                         | Description                                                                 |
| ----------------------------- | --------------------------------------------------------------------------- |
| `cell_id`                     | H3 index of the hexagon                                                     |
| `time_bin`                    | Aggregation period (depending on config)                    |
| `count_total`                 | Total events in the hexagon for that time bin                               |
| `count_unmatched`             | Number of events **without a match**                                        |
| `count_high_score_unmatched`  | Unmatched events above `medium_triage_score_threshold`                      |
| `mean_score`                  | Average `triage_score` of events in the hex                                 |
| `mean_uncertainty`            | Average `uncertainty_score` of events in the hex                            |
| `pct_near_coast`              | Percentage of events near coast (`distance_to_coast_km <= near_coast_threshold`) |

---

## 4. Recurrence Metrics

Added to support **temporal analysis** across configurable time bins:

| Field                      | Description                                                              |
| -------------------------- | ------------------------------------------------------------------------ |
| `recurrence_count`         | Total unmatched events in the hex across the full pilot period           |
| `time_bins_total`          | Number of time bins observed for this hex                                |
| `time_bins_with_unmatched` | Number of time bins with **at least one unmatched event** in this hex   |

---

## 5. Thresholds

Thresholds are defined in `apps/backend/src/config/pilot.json`:

- `medium_triage_score_threshold` → minimum score for high-score unmatched
- `near_coast_threshold` → maximum distance in km to consider "near coast"

---

## 6. Outputs

| File                                        | Description                                                            |
| ------------------------------------------- | ---------------------------------------------------------------------- |
| `apps/backend/data/out/hotspots.parquet`    | Full dataset of hotspots with metrics, suitable for analytics          |
| `apps/backend/data/out/hotspots.geojson`    | Simplified polygons for UI visualization, one feature per hex          |

---

## 7. Notes

- Recurrence metrics are **time-resolution agnostic**
- Each row corresponds to one hex for one time bin

---
## 8. Interpreting Hotspot Signals

- Spatial consistency signals
    - recurrence_count
    - time_bins_with_unmatched
    - count_total
    - count_unmatched
- Temporal persistence signals
    - time_bins_total
    - time_bins_with_unmatched
- Quality / ambiguity signals
    - mean_uncertainty
    - mean_score
    - count_high_score_unmatched