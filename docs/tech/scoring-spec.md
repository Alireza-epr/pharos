# Scoring and Definitions Specification (Iteration 1)

This document defines how triage scoring, uncertainty, and reason codes
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

The triage score is a deterministic value that **always represents the priority for analyst review**

### Inputs

Field used in Iteration 1:

- **detection_confidence**
  Provided by the detection source events API (only in port-related events)
  Reference: https://globalfishingwatch.org/our-apis/documentation#port-visit-events

Fallback: If detection confidence is missing, use a default base score (e.g., 1).

### Base Score

- Use `detection_confidence` if available (2, 3, 4).
- If confidence is missing: null (meaning "not applicable")

### Final Triage

```text
triage_score = detection_confidence
```

---

## Uncertainty Score

### Overview

Uncertainty represents how ambiguous the event context is.
It does not measure detection correctness or intent.

### Base Uncertainty

- base_uncertainty = 0.2

### Deterministic Modifiers

- near_coast = true then modifier = +0.3
- low_detection_confidence = true then modifier = +0.3
  or 
  missing_confidence_proxy = true then modifier = +0.3

A modifier is applied only if its required input field is present.

### Final Uncertainty

```text
uncertainty = clamp(base_uncertainty + sum(modifiers), 0, 1)
```

---

## Reason Codes

Reason codes are labels that provide **additional context for analysts**. They can indicate:

1. **Modifiers applied** to the uncertainty score (e.g., near_coast, low_detection_confidence).
2. **Contextual information** about the event, even if no modifier was applied (e.g., inside_eez, inside_mpa).

Reason codes **do not represent claims** about legality, intent, or detection correctness. They are purely informational to help analysts understand why uncertainty is higher or to provide context for the event.

### Fixed Vocabulary (Iteration 1)

- near_coast  
  Detection is close to coastline; coastal clutter risk exists.

- low_detection_confidence or missing_confidence_proxy
  Detection confidence is low or undefined according to source metadata.

- inside_eez  
  Detection is inside an Exclusive Economic Zone (context only).

- inside_mpa  
  Detection is inside a Marine Protected Area (context only).

- unmatched_detection
  Detection is AIS-Unmatched according to source metadata.

---

## Output Fields

Each event may include:

- triage_score (null or 2 - 4, higher = more important)
- uncertainty_score (0.2 - 0.8, higher = more ambiguous)
- reason_codes (list of applied reasons)

---

## Configuration Knobs

Values may be adjusted in later iterations:

- **near_coast_threshold = 10 km**  
  This sets the distance from the coastline at which a detection is considered “near coast.”  
  It was chosen as a moderate value to flag coastal clutter while avoiding excessive false positives in Iteration 1.
  Analysts can adjust this based on operational feedback.

- **low_detection_confidence_threshold = 2**  
  This defines the confidence level below which a port_visit detection is considered low confidence.  
  It was set to 2 because provider confidence values range from 2–4, and 2 represents the weakest reliable signal.
  This ensures only genuinely low-confidence events increase uncertainty.

---

## Explicit Non-Claims

This framework does not:

- identify illegal activity
- confirm dark vessels
- infer intent or behavior
- replace human review

It supports transparent and reproducible inspection only.
