# Scoring and Definitions Specification (Iteration 1)

This document defines how **AIS-unmatched**, triage scoring, uncertainty, and reason codes
are interpreted in Iteration 1. The purpose is to remove ambiguity and prevent over-claiming.

---

## Definition: AIS-Unmatched (Iteration 1)

A SAR detection is considered **AIS-unmatched** if it is marked as unmatched by the detection
provider, based on comparison with **publicly available AIS data used by that provider**.

AIS-unmatched does not imply illegal activity.  
AIS-unmatched does not imply intentional AIS disabling.  
AIS-unmatched does not imply a confirmed dark vessel.

The unmatched label reflects data availability and matching limitations only.

---

## Purpose of Scoring

The score is only used to decide which events to look at first.

The score:

- does not mean the chance of something happening
- does not indicate risk, wrongdoing, or compliance
- does not try to guess vessel intent or behavior

---

## Triage Score

### Overview

The triage score is a deterministic value in the range **[0, 1]**.
It is used only to prioritize which events to inspect first.

### Inputs

Only fields available in Iteration 1 are used:

- **matched_flag**  
  Provided by the detection source.

- **distance_from_shore**  
  Provided by the detection source events API  
  (e.g. `startDistanceFromShoreKm`, `endDistanceFromShoreKm`).

- **detection_confidence**
  Provided by the detection source events API (only in in port-related events)
  Reference: https://globalfishingwatch.org/our-apis/documentation#port-visit-events

Fallback: If an input field is not present for a given event, it is ignored and no corresponding
modifier or reason code is applied.

---

### Base Score

- matched_flag = false then base_score = 0.6
- matched_flag = true then base_score = 0.2

---

### Deterministic Modifiers

distance_from_shore input is availabe:

- near_coast = true then modifier = −0.2
- near_coast = false then modifier = 0

detection_confidence input is availabe:

- low_detection_confidence = true then modifier = −0.2
- low_detection_confidence = false then modifier = 0

A modifier is applied only if its required input field is present.

---

### Final Score

The final triage score starts from a base value derived from matched status and is adjusted
by simple additive modifiers based on available context, with the result bounded to [0, 1].

triage_score = clamp(base_score + sum(modifiers), 0, 1)

---

## Uncertainty

### Overview

Uncertainty represents how ambiguous the event context is.
It does not measure detection correctness or intent.

---

### Base Uncertainty

- base_uncertainty = 0.2

---

### Deterministic Modifiers

- near_coast = true then modifier = +0.3
- near_coast = false then modifier = 0

- low_detection_confidence = true then modifier = +0.3
- low_detection_confidence = false then modifier = 0

A modifier is applied only if its required input field is present.

---

### Final Uncertainty

uncertainty = clamp(base_uncertainty + sum(modifiers), 0, 1)

---

## Reason Codes

Reason codes explain why score or uncertainty modifiers were applied.
They are labels only and do not represent claims.

### Fixed Vocabulary (Iteration 1)

- near_coast  
  Detection is close to coastline; coastal clutter risk exists.

- low_detection_confidence  
  Detection confidence is low according to source metadata.

- inside_eez  
  Detection is inside an Exclusive Economic Zone (context only).

- inside_mpa  
  Detection is inside a Marine Protected Area (context only).

---

## Output Fields

Each event may include:

- triage_score (number in [0, 1])
- uncertainty (number in [0, 1])
- reason_codes (list of strings)

---

## Configuration Knobs

The following values are fixed for Iteration 1 but may be adjusted in later iterations:

- base_score_unmatched = 0.6
- base_score_matched = 0.2
- near_coast_threshold_km = [value to be defined]
- low_detection_confidence_threshold = [value to be defined]

---

## Explicit Non-Claims

This framework does not:

- identify illegal activity
- confirm dark vessels
- infer intent or behavior
- replace human review

It supports transparent and reproducible inspection only.
