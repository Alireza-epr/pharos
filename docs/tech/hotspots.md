# Hotspots Analytics Documentation

## 1. Overview

Hotspots identify areas with concentrated events within the AOI. They allow tracking both **spatial density** and **temporal recurrence** of events.

We use **H3 hexagons** for spatial aggregation. Hexagons provide:

- Reduced distortion compared to squares
- Equal distance to neighbors
- Better support for recurrence and heatmap analytics

---

## 2. Grid Parameters

- **Default resolution:** 5
- Provides a balance between **spatial granularity** and **number of hexes** for the AOI defined in `src/config/pilot.json`.

---

## 3. Hotspot Aggregation

**Aggregation scheme:** H3 hexagon + daily `time_bin`

**Metrics computed per `(cell_id, time_bin)` row:**

| Field                        | Description                                                                      |
| ---------------------------- | -------------------------------------------------------------------------------- |
| `cell_id`                    | H3 index of the hexagon                                                          |
| `time_bin`                   | Aggregation period (daily)                                                       |
| `count_total`                | Total events in the hexagon for that day                                         |
| `count_unmatched`            | Number of events **without a match**                                             |
| `count_high_score_unmatched` | Unmatched events above `low_detection_confidence_threshold`                      |
| `mean_score`                 | Average `triage_score` of events in the hex                                      |
| `mean_uncertainty`           | Average `uncertainty_score` of events in the hex                                 |
| `pct_near_coast`             | Percentage of events near coast (`distance_to_coast_km <= near_coast_threshold`) |

---

## 4. Recurrence Metrics

Added to support **temporal analysis**:

| Field                 | Description                                                        |
| --------------------- | ------------------------------------------------------------------ |
| `recurrence_count`    | Total unmatched events in the hex **across the full pilot period** |
| `days`                | Number of days in this hex |
| `days_with_unmatched` | Number of days with **at least one unmatched event** in this hex   |

- These metrics allow identification of **persistent hotspots** over time.
- Calculated after daily aggregation by summing/merging all rows per cell.

---

## 5. Thresholds

Thresholds are defined in `apps/backend/src/config/pilot.json`:

- `low_detection_confidence_threshold` → minimum score for high-score unmatched
- `near_coast_threshold` → maximum distance in km to consider “near coast”

---

## 6. Outputs

| File                        | Description                                                   |
| --------------------------- | ------------------------------------------------------------- |
| `apps/backend/data/out/hotspots.parquet` | Full dataset of hotspots with metrics, suitable for analytics |
| `apps/backend/data/out/hotspots.geojson` | Simplified polygons for UI visualization, one feature per hex |

---

## 7. Notes

- Using daily `time_bin` allows **recurrence analysis per cell**.
- Each row corresponds to one hex for one day, but \*\*rec
