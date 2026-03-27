# Data Layer – Known Limitations

This document outlines important limitations and caveats of the data layer used in Pharos project. These should be considered when interpreting results.

The system relies on AIS-based datasets and derived analytics from external providers such as Global Fishing Watch. These sources come with inherent uncertainties and methodological constraints.

For full provider details, see:
https://globalfishingwatch.org/our-apis/documentation#data-caveat

---

## 1. “Unmatched” as a Triage Indicator (`matched_flag = false`)

The `unmatched` tag is used as a **triage indicator only** and must not be interpreted as a claim or conclusion.

- The tag originates from the **initial data provided by upstream sources (iteration 1)** and is not the result of additional classification, manipulation, or inference performed within this system
- It indicates that a SAR detection could not be associated with an AIS record under the given conditions
- It does not imply illegal activity, suspicious behavior, or the presence of a “dark vessel”

Several non-critical factors may lead to an unmatched result, including:

- AIS transmission gaps
- Temporal misalignment between SAR acquisition and AIS signals
- Position inaccuracies

All unmatched cases should be treated as candidates for further review rather than final assessments.

---

## 2. Coastal and Dense-Lane Caveats

Accuracy may be reduced in complex maritime environments.

### Coastal Areas

- Proximity to land and infrastructure can introduce noise in SAR detections
- Increased likelihood of false positives or positional uncertainty

### Dense Shipping Lanes

- High vessel density may result in:
  - Overlapping AIS tracks
  - Ambiguous or multiple potential matches
  - Increased probability of missed or incorrect associations

Outputs generated in these regions inherently carry higher uncertainty.

---

## 3. Upstream Data Gaps and Coverage Limitations

The pipeline depends on AIS data and derived datasets (e.g., Global Fishing Watch), which have known limitations.

### AIS Coverage

- Not all vessels transmit AIS (e.g., smaller vessels or disabled transponders)
- Coverage varies by geographic region and reception conditions (satellite vs. terrestrial)

### Temporal Availability

- AIS data is not guaranteed to be real-time
- Data ingestion and processing delays may occur, leading to temporal gaps

### Sampling Resolution

- Some datasets are temporally downsampled (e.g., one position per vessel per hour)
- Only approximate vessel positions are recorded, not every movement

### Data Quality

- AIS records may be incomplete, inconsistent, or noisy
- Position inaccuracies and missing transmissions are possible

These limitations directly affect matching performance and completeness of results.

---

## 4. Model-Based and Derived Data

Certain upstream datasets (including Global Fishing Watch outputs) are generated through algorithmic processing of AIS data.

- Activity classifications and derived attributes are **model-based interpretations**
- These outputs represent probabilistic estimates rather than verified ground truth
- Boundary-related classifications (e.g., near maritime borders) may contain inaccuracies

---

## 5. Data Freshness and Completeness

- Datasets may be subject to delays, partial coverage, or asynchronous updates
- Some data products may be evolving or experimental in nature and not fully validated

Users should ensure that the selected data is appropriate for their temporal and operational context.

---

## 6. AIS Data Characteristics

AIS information is primarily **broadcast automatically** by a vessel’s transponder, including position, speed, and heading. Some fields, such as vessel name, type, or cargo, are **manually entered** by the crew and may contain errors. While most AIS signals are reliable, they can be affected by GPS inaccuracies or, in rare cases, intentional manipulation. This is why unmatched or missing positions in the pipeline should not be interpreted as system errors or claims.

---

## 7. Summary

- The `unmatched` tag is an upstream-provided triage indicator and not a system-generated claim
- Coastal and high-density maritime regions introduce increased uncertainty
- AIS data is subject to coverage gaps, delays, and sampling limitations
- Upstream datasets may include model-based interpretations rather than direct observations
- Data completeness and freshness are not guaranteed

All outputs should be interpreted within these constraints.
