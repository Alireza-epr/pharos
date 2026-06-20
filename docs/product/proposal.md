# PHAROS - Open-Data AIS–SAR Alignment Prototype

---

## 1. Purpose

PHAROS is a web-based prototype for **manual inspection of open SAR vessel detections against public AIS context**. It lets an analyst pull SAR detections for a fixed area and time window, see which ones the data provider could not match to public AIS, prioritise which are worth a closer look, and export a reproducible packet for review.

The aim is **not** real-time monitoring or enforcement. It is to make explicit **what can and cannot be inferred** from open data - with uncertainty and limitations stated on every result, in a way that is transparent and reproducible.

---

## 2. Problem Statement

Open SAR products (e.g. Sentinel-1, distributed via Global Fishing Watch) report vessel detections together with a flag for whether each detection was matched to public AIS. An **"unmatched"** flag has many ordinary causes - AIS coverage gaps, timing offset between the SAR acquisition and AIS reports, position error, and coastal or dense-lane clutter - and the open data on its own gives no way to tell these apart.

As a result, an analyst today has no transparent, reproducible way to:

- **(a)** retrieve unmatched detections for a chosen area and time window,
- **(b)** prioritise which of them justify a human's limited attention, and
- **(c)** hand a colleague or reviewer a packet they can independently reproduce and check.

PHAROS provides exactly that loop. Throughout, **"unmatched" is treated as a triage signal, not a conclusion**: it does not imply illegal activity, intentional AIS disablement, or a "dark vessel." A difference between SAR and AIS may be caused by data gaps or by the limits of the matching process. The prototype's job is to surface these candidates for manual review and to be honest about the uncertainty involved.

---

## 3. Objectives and Success Criteria

### 3.1 Primary Objective

Build a small, working prototype that:

- Retrieves open SAR vessel detections
- Exposes whether detections are matched or unmatched to publicly available AIS (as provided by the source)
- Supports manual review through a simple web interface
- Makes uncertainty and limitations explicit

### 3.2 Measurable Objectives (Iteration 1)

| Objective | Success Criteria |
|---------|----------------|
| Data access | At least one open SAR vessel detection dataset ingested |
| Scope control | One pilot AOI and one fixed time window |
| Transparency | Clear definition of matched vs unmatched |
| Scoring | Deterministic triage score and uncertainty values defined |
| UI | Map-based visualization with basic filters |
| Validation | Manual review plan documented and executable by one person |

---

## 4. Locked Scope (Iteration 1)

### Included

- Open Sentinel-1–derived SAR vessel detections
- Matched / unmatched AIS metadata provided by the detection source
- Fixed pilot area and time window
- Simple triage scoring for inspection prioritization
- Manual validation on a small sample

### Explicit Non-Goals

- No real-time processing
- No global AIS ingestion
- No custom SAR–AIS matching
- No claims about vessel intent, legality, or "dark vessels"
- No advanced geospatial analysis

---

## 5. Data Sources

All data sources are open and publicly accessible.

- **SAR detections**: Open Sentinel-1 vessel detection products (e.g. Global Fishing Watch)
- **AIS context**: Public AIS used by the detection provider (matched / unmatched flag only)
- **Context layers** (for reference only):
  - EEZ boundaries
  - Marine Protected Areas
  - Regional Fisheries Management Organization

No proprietary data is used.

---

## 6. Event Definition and Scoring

### 6.1 AIS-Unmatched Definition

An event is considered **AIS-unmatched** if it is **not matched to publicly available AIS by the detection provider**. This does **not** imply illegal activity or intentional AIS deactivation.

### 6.2 Triage Scoring (Inspection Only)

- **Base score** is derived from matched vs unmatched status
- Simple deterministic modifiers may be applied when relevant metadata exists
- Output (as persisted in `events_scored.parquet` and the exported GeoJSON):
  - `triage_score` - numeric, clamped to **[0, 1]** and deterministic; higher = higher inspection priority; may be null where no base score applies
  - `uncertainty_score` - numeric, clamped to **[0, 1]** and deterministic; higher = more ambiguous
  - `reason_codes` - fixed vocabulary, exported as a stringified JSON list

Scores are **not probabilities** and are **not risk indicators**. They exist only to order events for human review.

---

## 7. Validation Plan

Validation focuses on **precision of AIS-unmatched triage events** under a fixed, documented rubric.

- One pilot AOI and time window
- Stratified sampling (e.g. near-coast vs offshore)
- Manual labeling by a single reviewer:
  - True Positive
  - False Positive
  - Ambiguous
- Failure modes are tagged (e.g. coastal clutter, timing ambiguity)

Results are reported with uncertainty and limitations clearly stated.

---

## 8. System Architecture (High Level)

Open Data → Ingestion → Normalization → Context Enrichment → Scoring → Export → UI → Evidence Bundle

The architecture emphasizes:

- Simplicity
- Reproducibility
- Clear data lineage

---

## 9. Phased Plan

### Iteration 1 (Current)

- Data access and normalization
- Locked scope and definitions
- Simple UI and scoring
- Manual validation

### Future Iterations (Out of Scope)

- Expanded regions or time windows
- Additional AIS sources
- More advanced analysis
- Automation or scaling

---

## 10. Risks and Mitigations

| Risk | Mitigation |
|-----|-----------|
| Coastal false detections | Lower confidence and explicit reason codes |
| AIS gaps | Results framed as uncertainty, not conclusions |
| Data freshness limits | Last update time clearly shown |
| Over-interpretation | Explicit non-claims documented |

---

## 11. Conclusion

The prototype delivers a **realistic, open-data-based prototype** focused on clarity rather than claims. By locking scope, defining uncertainty, and documenting validation, it provides a solid and funder-ready foundation for future exploration without overstating results.
