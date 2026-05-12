# Event Sorting Configuration

The canonical event sorting system supports flexible multi-field sorting through the [pilot configuration file](../../apps/backend/src/config/pilot.json).

Users can define:

- which fields should be used for sorting
- sorting priority
- sorting direction (`asc` or `desc`)

---

## Sortable Fields

Any field within the canonical event schema is sortable, including nested object properties and array elements accessed through dot (`.`) and bracket (`[index]`) notation. Here are some examples:

### Temporal Fields

Useful for chronological ordering.

| Field | Description |
|---|---|
| `timestamp_utc` | Canonical event timestamp (recommended primary sort field) |
| `raw_metadata.entryTimestamp` | Detection entry time |
| `raw_metadata.exitTimestamp` | Detection exit time |
| `raw_metadata.date` | Source dataset date |
| `raw_metadata.firstTransmissionDate` | First vessel transmission |
| `raw_metadata.lastTransmissionDate` | Last vessel transmission |


---

### Spatial Fields

Useful for geographic clustering and spatial analysis.

| Field | Description |
|---|---|
| `lat` | Latitude |
| `lon` | Longitude |
| `distance_to_coast_km` | Distance from nearest coastline |

---

### Scoring Fields

Useful for ranking, triage, and prioritization.

| Field | Description |
|---|---|
| `scoring.triage_score` | Event triage score |
| `scoring.uncertainty_score` | Uncertainty score |
| `confidence_proxy` | Confidence proxy value |
| `confidence_tier` | Confidence tier (`low`, `medium`, `high`) |
| `hotspot.signals.recurrence_count` | Hotspot recurrence count |
| `hotspot.signals.hotspot_strength` | Hotspot strength |

---

### Identity Fields

Useful for deterministic ordering and pagination.

| Field | Description |
|---|---|
| `event_id` | Unique canonical event identifier |
| `raw_metadata.vesselId` | Vessel UUID |
| `raw_metadata.imo` | IMO number |
| `raw_metadata.mmsi` | MMSI number |

---

### Boolean / Classification Fields

| Field | Description |
|---|---|
| `matched_flag` | Indicates matched event |
| `rejected` | Indicates rejected event |

---

## Configuration

Sorting behavior is configured through the `sort` section.

### Example

```json
{
  "sort": [
    {
      "sortBy": "timestamp_utc",
      "direction": "asc"
    },
    {
      "sortBy": "event_id",
      "direction": "asc"
    }
  ]
}
```

---
### Sort Configuration Schema

| Property | Type | Required | Description |
|---|---|---|---|
| `sortBy` | `string` | Yes | Canonical schema field path |
| `direction` | `"asc"` \| `"desc"` | No | Sorting direction (default: `asc`) |

---

### Multi-Field Sorting

Sorting is applied in order.

Example:

```json
{
  "sort": [
    {
      "sortBy": "scoring.triage_score",
      "direction": "desc"
    },
    {
      "sortBy": "timestamp_utc",
      "direction": "asc"
    }
  ]
}
```

Behavior:

1. Events are sorted by highest `triage_score`
2. Events with identical scores are then sorted by `timestamp_utc`

---

### Nested Field Support

Nested fields use dot notation.

Example:

```json
"scoring.triage_score"
```

---

### Array Index Support

Array elements can also be accessed using bracket notation.

Example:

```json
"context_layers.Bathymetry.enrichments[0].value"
```

This allows sorting on nested array values inside the canonical schema.

---

### Default Sorting

If no sorting configuration is provided, the system uses:

```json
{
  "sort": [
    {
      "sortBy": "timestamp_utc",
      "direction": "asc"
    },
    {
      "sortBy": "event_id",
      "direction": "asc"
    }
  ]
}
```

---

## Notes

- Rejected events are always appended after accepted events.

