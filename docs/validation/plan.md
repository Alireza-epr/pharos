# Validation Plan (Iteration 1 – Simplified)

## 1. What Is Being Checked

This validation checks whether **AIS-unmatched SAR events make sense to a human reviewer**.

Only events marked as **AIS-unmatched** by the system are included in the main validation.

The main question is:

> When the system marks an event as AIS-unmatched, does this look reasonable based on basic map and timing checks?

Each event is reviewed using the **same simple rules**.

If a reviewer cannot clearly decide, the event is marked as **Ambiguous** instead of forcing a yes/no decision.

This validation **does NOT check**:

- whether the system finds all vessels (recall)
- whether the SAR detection itself is correct
- legality, compliance, or intent
- vessel behavior or threat level

The goal is **only** to check whether AIS-unmatched events look reasonable to a person.

---

## 2. Validation Setup

Validation is done in two parts.

### Part A - Quick Sanity Check (Small)

A small number of **AIS-matched** events are reviewed first to confirm that:

- the review tools work
- locations and timestamps are readable
- reviewers understand the rules

These results are **not reported** and are only used to make sure the process works.

### Part B - Main Validation

The main validation uses **only AIS-unmatched events**.
These results are what matter.

---

## 3. Grouping the Events (Stratification)

To avoid reviewing only similar cases, AIS-unmatched events are grouped using **fields we compute ourselves**.

### 3.1 Near-Coast vs Offshore

Each event is grouped based on how close it is to land.

**How**

- Distance to the coastline is calculated from the event latitude and longitude.

**Groups**

- **near_coast**  
  distance_to_coast_km < threshold

- **offshore**  
  distance_to_coast_km ≥ threshold

This is applied to all AIS-unmatched events.

---

### 3.2 Signal Strength Group (Confidence Tier)

The provider does not give a real confidence score.
So we group events by **how strong the detection looks**, based on simple signals.

**Signals used**

- how recent the event is

**Groups**

- **strong_signal**  
  recent events

- **weak_signal**  
  old events

These groups are **not probabilities**.
They only help us sample different types of events.

---

## 4. Sample Size and Selection

The validation is designed for **one reviewer**.

- Total sample size: **20–30 AIS-unmatched events**

Events are selected across:

- near-coast and offshore groups
- strong-signal and weak-signal groups

If a group has only a few events, all of them may be reviewed.

The exact number per group may vary, but the total stays within the target range.

---

## 5. Review Labels

Each AIS-unmatched event gets **one label**.

### 5.1 TP — True Positive

**Meaning**  
The system flagged this event as AIS-unmatched, and this decision makes sense.

**Example**  
A SAR detection offshore.

---

### 5.2 FP — False Positive

**Meaning**  
The system flagged this event as AIS-unmatched, but it should not have.

**Example**  
A detection on a pier, platform, or known fixed structure.

---

### 5.3 Ambiguous — Cannot Decide

**Meaning**  
There is not enough information to make a clear decision.

**Example**  
A detection very close to shore where both small vessels and coastal clutter are possible.

---

## 6. Reason Tags

For events marked **FP** or **Ambiguous**, one reason is added.

Allowed values:

- **coast_clutter**  
  Likely noise near the shoreline.

- **static_structure**  
  Likely a fixed object (pier, platform, turbine).

- **on_land** 
  The coordinate is located on solid ground, not water.

- **unknown**  
  No clear reason identified.

These tags are descriptive only.

---

## 7. Results

Results are summarized by:

- number of TP / FP / Ambiguous events
- breakdown by near-coast vs offshore
- breakdown by strong vs weak signal
- common reason tags

Results are used as a **human sanity check**, not as a performance score.
