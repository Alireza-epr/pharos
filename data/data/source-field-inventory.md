# Source Field Inventory

## Source

Dataset observed from upstream API responses:

* `public-global-vessel-identity:v3.0`
* Event data embedded under `event_metadata` (e.g., `port_visit` events)

These fields were observed during pilot ingestion for the SAR–AIS pipeline.

---

# Top-Level Fields

| Field                 | Type             | Description                             | Notes / Quirks                                |
| --------------------- | ---------------- | --------------------------------------- | --------------------------------------------- |
| callsign              | string           | Vessel radio callsign                   | May be missing or empty for some vessels      |
| dataset               | string           | Dataset identifier and version          | Example: `public-global-vessel-identity:v3.0` |
| date                  | string           | Hourly aggregated timestamp             | Format `"YYYY-MM-DD HH:mm"` (not ISO)         |
| detections            | integer          | Number of detections within time bucket | Usually `1` in pilot observations             |
| entryTimestamp        | string (ISO8601) | Detection entry time                    | Example: `2025-12-04T16:53:26Z`               |
| exitTimestamp         | string (ISO8601) | Detection exit time                     | Often identical to `entryTimestamp`           |
| firstTransmissionDate | string (ISO8601) | First AIS transmission observed         | Historical vessel metadata                    |
| flag                  | string           | Vessel flag state (ISO country code)    | Example: `DNK`                                |
| geartype              | string           | Vessel gear classification              | Observed value `OTHER`                        |
| imo                   | string           | IMO vessel identifier                   | May be empty string                           |
| lastTransmissionDate  | string (ISO8601) | Most recent AIS transmission            | May be far in the future relative to event    |
| lat                   | number           | Latitude of detection                   | WGS84 coordinates                             |
| lon                   | number           | Longitude of detection                  | High floating precision                       |
| mmsi                  | string           | Maritime Mobile Service Identity        | Numeric but stored as string                  |
| shipName              | string           | Vessel name                             | Capitalization varies                         |
| vesselId              | string           | Unique vessel identifier in GFW dataset | UUID-like format                              |
| vesselType            | string           | Vessel classification                   | Observed value `OTHER`                        |
| event_metadata        | object           | Nested event information                | Contains port visit and region context        |

---

# `event_metadata` Fields

| Field       | Type             | Description                                 | Notes                                |
| ----------- | ---------------- | ------------------------------------------- | ------------------------------------ |
| start       | string (ISO8601) | Event start time                            |                                      |
| end         | string (ISO8601) | Event end time                              |                                      |
| id          | string           | Unique event identifier                     |                                      |
| type        | string           | Event type                                  | Example: `port_visit`                |
| position    | object           | Event geographic position                   | Contains `lat`, `lon`                |
| regions     | object           | Geographic region classifications           | Contains FAO, EEZ, RFMO, etc.        |
| boundingBox | array[number]    | Bounding box coordinates                    | `[minLon, minLat, maxLon, maxLat]`   |
| distances   | object           | Distance metrics relative to shore and port | Numeric values in kilometers         |
| vessel      | object           | Vessel metadata snapshot                    | Includes vessel ID, name, flag       |
| port_visit  | object           | Port visit specific information             | Only present for `port_visit` events |

---

# `regions` Subfields

| Field            | Type          | Description                                 | Notes                       |
| ---------------- | ------------- | ------------------------------------------- | --------------------------- |
| mpa              | array[string] | Marine protected area identifiers           | May contain multiple values |
| eez              | array[string] | Exclusive Economic Zone IDs                 |                             |
| rfmo             | array[string] | Regional Fisheries Management Organizations |                             |
| fao              | array[string] | FAO fishing area identifiers                |                             |
| majorFao         | array[string] | High-level FAO region codes                 |                             |
| eez12Nm          | array[string] | 12 nautical mile EEZ boundaries             |                             |
| highSeas         | array[string] | High seas regions                           | Often empty                 |
| mpaNoTakePartial | array[string] | Partial no-take MPAs                        | Often empty                 |
| mpaNoTake        | array[string] | No-take MPAs                                | Often empty                 |

---

# `distances` Subfields

| Field                    | Type   | Description                        | Notes                 |
| ------------------------ | ------ | ---------------------------------- | --------------------- |
| startDistanceFromShoreKm | number | Distance from shore at event start | May be `0` if at port |
| endDistanceFromShoreKm   | number | Distance from shore at event end   |                       |
| startDistanceFromPortKm  | number | Distance from port at event start  |                       |
| endDistanceFromPortKm    | number | Distance from port at event end    |                       |

---

# `vessel` Subfields

| Field    | Type          | Description                | Notes              |
| -------- | ------------- | -------------------------- | ------------------ |
| id       | string        | Vessel identifier          | Same as `vesselId` |
| name     | string        | Vessel name                |                    |
| ssvid    | string        | Vessel MMSI identifier     |                    |
| flag     | string        | Vessel flag country        |                    |
| type     | string        | Vessel type classification |                    |
| nextPort | string | null | Next port destination      | Often null         |

---

# `port_visit` Subfields

| Field                 | Type   | Description                         | Notes                    |
| --------------------- | ------ | ----------------------------------- | ------------------------ |
| visitId               | string | Unique port visit identifier        |                          |
| confidence            | string | Confidence level of visit detection | Numeric stored as string |
| durationHrs           | number | Duration of port visit in hours     | Floating point           |
| startAnchorage        | object | Anchorage where visit began         |                          |
| intermediateAnchorage | object | Intermediate anchorage data         | Often same as start      |
| endAnchorage          | object | Anchorage where visit ended         |                          |

---

# Anchorage Subfields

| Field               | Type    | Description                | Notes                            |
| ------------------- | ------- | -------------------------- | -------------------------------- |
| anchorageId         | string  | Anchorage identifier       |                                  |
| atDock              | boolean | Whether vessel was docked  |                                  |
| distanceFromShoreKm | string  | Distance from shore        | Sometimes stored as string `"0"` |
| flag                | string  | Country flag of port       |                                  |
| id                  | string  | Port identifier            | Example: `dnk-roenne`            |
| lat                 | number  | Anchorage latitude         |                                  |
| lon                 | number  | Anchorage longitude        |                                  |
| name                | string  | Port name                  |                                  |
| topDestination      | string  | Destination classification |                                  |

---

# Observed Data Quirks

1. Some numeric values are stored as **strings** (e.g., `"distanceFromShoreKm": "0"`).
2. `imo` may be **empty string** rather than `null`.
3. `mmsi` appears numeric but is **stored as a string**.
4. `date` field is **not ISO8601**, unlike most other timestamps.
5. Region arrays may be **empty** when no matching region exists.
6. Anchorage information may be **duplicated across start, intermediate, and end**.

---

# Notes

This inventory reflects **fields observed during pilot ingestion runs** and may expand as additional upstream responses are processed.
