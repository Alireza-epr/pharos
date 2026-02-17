# Data Specification (Iteration 1)

This document describes the data used in Iteration 1 of the project.
It records what data is used, where, and under which conditions.

---

## Data Sources

The project uses the following Global Fishing Watch datasets:

- public-global-sar-presence (SAR vessel detections)
- public-global-presence (AIS presence data)

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

- Start: 2025-12-16T00:00:00Z
- End: 2025-12-22T23:59:59Z

This one-week window is short enough for testing and reproducible analysis.

---

## Data Scale (Initial Pull)

- SAR detections: 2
- AIS records: 13

This confirms the AOI and time window are manageable.

---

## Event Fields

Each SAR detection is stored as one event.

The canonical event structure is defined in:

- docs/data/event-schema.md

Upstream fields are preserved without modification.

<!-- ---

## Context Layers

The following background layers are selected for Iteration 1:

- EEZ boundaries
- Marine Protected Areas
- Coastline / land mask
- Bathymetry grid (coarse resolution)

These layers are used only for spatial context. -->

---

## Version Pinning Plan

To ensure reproducibility, fixed versions of all data sources and context layers are used.

For each run, the following information is recorded:

- source dataset name
- source dataset version
- code version

---

## Notes

- This specification is intentionally minimal.
- No accuracy or operational claims are made.
- The focus is on clarity and reproducibility.
