## Iteration 1 Mode

### Purpose

This document defines the committed mode for Iteration 1 of the AIS–SAR prototype.
The goal is to avoid scope drift.

---

### Rationale

The committed mode was chosen based on the limitations identified in the initial phase.
It allows Iteration 1 to remain realistic while leaving room for improvements in later iterations.

---

For Iteration 1, the project commits to the following approach.

### Baseline Vessel Detections

- An open Sentinel-1–derived vessel detection product is used as the sole source of SAR detections.
- The project does not develop or run a custom SAR vessel detection algorithm.
- Vessel detections are treated as given inputs, including their spatial and temporal properties.

### Matched / Unmatched Handling

- We use the information that already comes with the detections to see whether a vessel has identity details or not.
- The main indicator of whether a detection is matched or unmatched is the decision already provided by the dataset.
- No additional hard classification or labeling is introduced.

### AIS Usage Scope

- The project does not promise real-time AIS ingestion.
- The project does not attempt global or complete AIS coverage.
- AIS-related information is used only as available through open data sources and limited
  supplementary inputs, with known coverage constraints.

### SAR Usage Scope

- The project does not process raw SAR imagery.
- The project does not generate vessel detections from SAR data.
- SAR-related information is used only as provided by existing open vessel detection datasets, with known coverage and revisit limitations.

### Interpretation and Outputs

- The results are meant for exploring the data, not for giving final answers.
- The system helps users look at and understand the data, not make decisions.
- Any uncertainty or unclear information in the data is shown to the user and not hidden.

---

### Explicit Non-Goals for Iteration 1

To prevent scope drift, the following are explicitly out of scope for Iteration 1:

- Real-time or near-real-time vessel monitoring.
- Global AIS ingestion or historical AIS completeness.
- Custom SAR–AIS association algorithms producing hard matches.
- Operational claims about vessel behavior or intent.
