# Scoring and Definitions Specification

This document defines triage scoring, importance, uncertainty, and reason codes.
The purpose is to remove ambiguity and prevent over-claiming.

AIS-unmatched does not imply illegal activity.  
AIS-unmatched does not imply intentional AIS disabling.  
AIS-unmatched does not imply a confirmed dark vessel.

The unmatched label reflects data availability and matching limitations only.

---

## Definition: AIS-Unmatched

A SAR detection is considered **AIS-unmatched** if it is marked as unmatched by the detection
provider, based on comparison with **publicly available AIS data used by that provider**.

AIS-unmatched does not imply illegal activity.  
AIS-unmatched does not imply intentional AIS disabling.  
AIS-unmatched does not imply a confirmed dark vessel.

The unmatched label reflects data availability and matching limitations only.

---

## Core Concepts

### 1. Importance (Domain Value)

Importance answers:

> "If this event is real, how important is it?"

It is based on environmental and contextual factors such as:

- inside EEZ
- inside MPA
- near coast
- bathymetry context
- vessel-context combinations (e.g., cargo in sensitive zones)

Importance is independent of data quality.

---

### 2. Uncertainty (Data Quality)

Uncertainty answers:

> "How unreliable or incomplete is this event?"

It is based on:

- missing required fields
- noisy vessel signals
- AIS matching status
- missing or low confidence proxy

Uncertainty reflects data ambiguity, not behavior.

---

### 3. Triage Score (Operational Priority)

Triage answers:

> "What should be reviewed first?"

Triage is a deterministic value in the range **[0, 1]**.

This ensures:

- Important events are always prioritized
- Uncertainty increases urgency without overpowering importance

---

## Importance Score

### Inputs

- inside_eez
- inside_mpa
- near_coast
- bathymetry
- vessel type combinations

### Example Contributions

- inside_eez → +0.2
- inside_mpa → +0.5
- near_coast → +0.3
- shallow water + EEZ → +0.25
- shallow water + MPA → +0.3
- cargo vessel in fishing/shallow zone → +0.2

Final importance is clamped:

importance_score = clamp(importance_score, 0, 1)

---

## Uncertainty Score

### Base

base_uncertainty = 0.1

### Modifiers

- missing_required_field → +0.08 per field (max 0.4)
- noisy_vessel → +0.15
- unmatched_to_public_ais → +0.2
- matched_to_public_ais → -0.05
- missing_confidence_proxy → +0.25
- low_detection_confidence → +0.2

Final uncertainty is clamped:

uncertainty_score = clamp(base + modifiers, 0, 1)

---

## Reason Codes

Reason codes provide explainability.

They include:

- `inside_eez`  
  Detection is inside an Exclusive Economic Zone.

- `inside_mpa`  
  Detection is inside a Marine Protected Area.

- `near_coast`  
  Detection is close to coastline

- `bathymetry_fishing_zone`  
  Detection is located in a depth range commonly associated with fishing activity.

- `bathymetry_shallow_eez_hotspot`  
  Detection is in shallow waters within an EEZ, where human maritime activity is typically higher.

- `bathymetry_mpa_shallow_zone`  
  Detection is in shallow waters within a Marine Protected Area, indicating a sensitive ecological zone.

- `bathymetry_cargo_anomaly_zone`  
  Detection is a cargo vessel operating in shallow or fishing-relevant waters where such behavior is less typical.

- `bathymetry_deep_mpa`  
  Detection is in deep waters within a Marine Protected Area, where activity is generally lower.

- `unmatched_to_public_ais`  
  Detection is AIS-unmatched according to source metadata.

- `matched_to_public_ais`  
  Detection is AIS-matched according to the source metadata.

- `noisy_vessel`  
  Detection is flagged as noisy according to the source metadata.
  Reference: https://globalfishingwatch.org/our-apis/documentation#example-9-report-indonesia-filter-by-matched-detections-example-of-noisy-vessel

- `missing_confidence_proxy`  
  `low_detection_confidence`  
  Detection confidence is low or undefined according to source metadata.

- `missing_required_field:<fieldname>`  
  Indicates a missing required field.
  Required fields: dataset, date, lat, lon, vesselId, mmsi, shipName, vesselType

They do not imply legality or intent.

---

## Output Fields

Each event includes:

- triage_score (0–1)
- uncertainty_score (0–1)
- reason_codes (list)

---

## Thresholds for Usage

Default thresholds used to calculate scoring(configurable):

- near_coast_threshold = 10,
- shallow_water_threshold = -50,
- deep_water_threshold = -200,
- low_detection_confidence_threshold = 2

These values are **defaults only** and can be adjusted via configuration:

`apps/backend/src/config/pilot.json`

---

## Explicit Non-Claims

This framework does not:

- detect illegal activity
- infer intent
- confirm dark vessels
- replace human analysis

It is designed for prioritization and transparency only.
