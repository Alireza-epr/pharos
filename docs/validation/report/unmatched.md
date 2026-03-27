# Validation Report (Iteration 1)

This document reports the results of the manual validation of unmatched events provided by the source.
All values will be filled after validation is completed.

---

## Validation Scope

- Area of Interest:
  - Offshore

  ```js
  {
      "geojson": {
      "type": "Polygon",
      "coordinates": [
              [
                  [14.11, 55.26],
                  [14.68, 55.27],
                  [14.69, 55.11],
                  [14.09, 55.08],
                  [14.11, 55.26]
              ]
          ]
      }
  }
  ```

  - Near Coast

  ```js
  {
      "geojson": {
      "type": "Polygon",
      "coordinates": [
              [
                  [32.494, 29.880],
                  [32.609, 29.862],
                  [32.486, 31.230],
                  [32.271, 31.316],
                  [32.494, 29.880]
              ]
          ]
      }
  }
  ```

- Time Window:
  ```js
  {
      "startDate": "2025-09-06T00:00:00Z",
      "endDate": "2025-12-06T23:59:59Z",
  }
  ```
  ```js
  {
      "startDate": "2023-09-06T00:00:00Z",
      "endDate": "2023-11-06T23:59:59Z",
  }
  ```
- Total Events Reviewed:
  - Near Coast AOI: 25
  - Offshore AOI: 22

---

## Label Summary

| Label     | Count |
| --------- | ----- |
| TP        | 46    |
| FP        | 0     |
| Ambiguous | 1     |

---

## Precision

| Metric                     | Value |
| -------------------------- | ----- |
| Precision (TP / (TP + FP)) | 1     |

---

## Breakdown by Context

### Near-Coast vs Offshore

| Area       | TP  | FP  | Ambiguous |
| ---------- | --- | --- | --------- |
| Near Coast | 24  | 0   | 1         |
| Offshore   | 22  | 0   | 0         |

---

## Failure Modes

| Failure Mode      | Count |
| ----------------- | ----- |
| coast_clutter     | 0     |
| static_structure  | 0     |
| density_ambiguity | 0     |
| time_offset       | 0     |
| unknown           | 1     |

---

## Notes

Free-text observations from manual review.
