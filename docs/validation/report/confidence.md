# Validation Report (Iteration 1)

This document reports the results of the manual validation of unmatched events provided by the source.
All values will be filled after validation is completed.

---

## Validation Scope

- Area of Interest:
  - German Exclusive Economic Zone
- Time Window:
  - Recent:

  ```js
  {
      "startDate": "2025-12-07T00:00:00Z",
      "endDate": "2025-12-07T23:59:59Z",
  }
  ```

  - Old:

  ```js
  {
      "startDate": "2018-12-07T00:00:00Z",
      "endDate": "2018-12-07T23:59:59Z",
  }
  ```

- Total Events Reviewed:
  - Recent: 25
  - Old: 25

---

## Label Summary

| Label     | Count |
| --------- | ----- |
| TP        | 46    |
| FP        | 0     |
| Ambiguous | 4     |

---

## Precision

| Metric                     | Value |
| -------------------------- | ----- |
| Precision (TP / (TP + FP)) | 1     |

---

## Breakdown by Context

### Low Confidence vs High Confidence

| Area            | TP  | FP  | Ambiguous |
| --------------- | --- | --- | --------- |
| Low Confidence  | 25  | 0   | 0         |
| High Confidence | 21  | 0   | 4         |

---

## Failure Modes

| Failure Mode      | Count |
| ----------------- | ----- |
| coast_clutter     | 0     |
| static_structure  | 0     |
| density_ambiguity | 0     |
| on_land           | 4     |
| unknown           | 0     |

---

## Notes

Free-text observations from manual review.
