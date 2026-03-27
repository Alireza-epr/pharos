# Data Specification (Iteration 1)

This document describes the data used in Iteration 1 of the project.
It records what data is used, where, and under which conditions.

---

## Data Sources

The project uses the following Global Fishing Watch datasets:

- SAR Vessel Detections
- Event API Dataset

No custom detection, matching, or scoring logic is used in Iteration 1.

---

## Pilot Area of Interest (AOI)

The pilot AOI is intentionally small to keep the number of events suitable for one-person validation.

AOI geometry (WGS84) is defined by the following polygon coordinates:

- Longitude 12.5, Latitude 54.5
- Longitude 12.9, Latitude 54.6
- Longitude 12.9, Latitude 54.4
- Longitude 12.5, Latitude 54.5

---

## Time Window

- Start: 2025-12-01T00:00:00Z
- End: 2025-12-07T23:59:59Z

This one-week window is short enough for testing and reproducible analysis.

---

## Data Scale (Initial Pull)

- SAR detections: 18

This confirms the AOI and time window are manageable.

---

## Event Fields

Each SAR detection is stored as one event.

The canonical event structure is defined in:

- docs/data/event-schema.md

Upstream fields are preserved without modification.

---

## Version Pinning Plan

To ensure reproducibility, fixed versions of all data sources are used.

For each run, the following information is recorded:

- source dataset name
- source dataset version
- code version

---

## Notes

- This specification is intentionally minimal.
- No accuracy or operational claims are made.
- The focus is on clarity and reproducibility.
