# Validation Plan (Iteration 1)

## What Is Being Validated

This validation evaluates the precision of AIS-unmatched triage events produced by the system.

Only events marked as AIS-unmatched by the detection provider are included in the validation set.

The validation answers the following question:

When the system flags an AIS-unmatched event, does this classification make sense based on basic
spatial and contextual inspection?

Validation is performed using a fixed labeling rubric applied consistently across all sampled events.

Ambiguous cases, where a clear decision cannot be made, are explicitly labeled and tracked
separately, rather than being forced into correct or incorrect categories.

The validation does not assess:

- recall or completeness
- detection accuracy
- legality or compliance
- vessel intent or behavior

The purpose is only to check whether AIS-unmatched events make sense to a human reviewer.

---

## Stratification

To ensure validation covers different event contexts, AIS-unmatched events are
automatically stratified using provider-supplied fields.

The following stratifications are locked for Iteration 1.

### Near-Coast vs Offshore

Events are split based on provider-supplied distance-to-shore values:

- **near_coast**  
  distance_from_shore_km < [configured threshold]

- **offshore**  
  distance_from_shore_km ≥ [configured threshold]

This stratification is computed automatically for all events where distance
information is available.

### High vs Low Confidence Tier

For events where a detection confidence field is provided by the data source
(e.g. port-related events), confidence is stratified as:

- **low_confidence**  
  detection_confidence < [configured threshold]

- **high_confidence**  
  detection_confidence ≥ [configured threshold]

If detection confidence is not provided for an event, this stratification is
not applied.

Traffic-density-based stratification is not included in Iteration 1, as no
provider-supplied traffic proxy is available.

---

## Sample Size and Stratified Selection

Validation is designed to be executable by a single reviewer.

A target sample size of **20-30 AIS-unmatched events** is selected for manual review.
This range is chosen so that one person can complete the review in a reasonable amount of time.

To avoid reviewing only similar cases, events are selected across automatically
computable strata:

- near-coast events
- offshore events
- low-confidence events (only where confidence data is available)
- high-confidence events (only where confidence data is available)

The sample is split approximately evenly across available strata when possible.
If a stratum contains too few events, all available events from that stratum may be included.

Exact counts per stratum may vary depending on data availability, but the overall
sample size remains within the defined range.

---

## Labeling Rubric

Each AIS-unmatched event is reviewed manually and assigned one primary label.
The same rubric is applied consistently to all events.

Exactly one of the following labels is assigned to each event.

### TP (True Positive)

**Definition:**  
The AIS-unmatched classification appears reasonable based on spatial and contextual inspection.
There is no clear reason to think it is not a vessel.

**Example:**  
A SAR detection is located offshore, away from the coastline and known static structures.
Label: TP

---

### FP (False Positive)

**Definition:**  
The detection clearly does not represent a vessel, or there is an obvious non-vessel explanation.

**Example:**  
A SAR detection is located directly on the coastline or aligned with a known pier or offshore platform.
Label: FP  
Failure mode: static_structure or coast_clutter

---

### Ambiguous

**Definition:**  
There is insufficient information to confidently classify the detection as a vessel or non-vessel.

**Example:**  
A SAR detection is near the coast in shallow water.
It could represent a small vessel or coastal clutter, and available information is not enough to decide.
Label: Ambiguous  
Failure mode: coast_clutter or unknown

---

### Failure Mode Tag

For events labeled FP or Ambiguous, one failure mode tag is assigned to describe the primary reason.

Allowed values:

- **coast_clutter**  
  Likely SAR noise or reflections near the coastline.

- **static_structure**  
  Detection likely corresponds to a fixed structure (e.g. platform, pier, wind turbine).

- **density_ambiguity**  
  Used when several AIS vessels are present near the SAR detection at similar times, making it unclear which vessel, if any, corresponds to the detection.

- **time_offset**  
  Used when nearby AIS vessel activity exists, but the AIS timestamps do not clearly align with the SAR detection time.

- **unknown**  
  No clear explanation can be identified.

Failure mode tags are descriptive only and do not represent claims.
