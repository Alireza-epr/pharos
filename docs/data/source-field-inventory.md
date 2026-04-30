# Source Field Inventory

## Source

Dataset observed from upstream API responses:

- `public-global-vessel-identity:v3.0`
- Event data (e.g., `port_visit` events)

These fields were observed during pilot ingestion for the SAR–AIS pipeline.

---

# Top-Level Fields

| Field                 | Type             | Description                                                  | Notes / Quirks                                                                                                                    |
| --------------------- | ---------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| callsign              | string           | Vessel radio callsign                                        | May be missing or empty for some vessels                                                                                          |
| dataset               | string           | Dataset identifier and version                               | Example: `public-global-vessel-identity:v3.0`                                                                                     |
| date                  | string           | aggregated timestamp                                         | Not ISO. Format depends on temporal resolution; if ‘Entire’, use date-range query parameter value                                 |
| detections            | integer          | Number of SAR detections in the grid cell within time bucket | If ‘Matched’, count detections of the same vessel multiple times. If ‘Unmatched’, identity is unknown (same or different object). |
| entryTimestamp        | string (ISO8601) | Detection entry time                                         | The earliest timestamp at which the vessel appears in any of the returned records for the selected query.                         |
| exitTimestamp         | string (ISO8601) | Detection exit time                                          | The latest timestamp at which the vessel appears in any of the returned records for the selected query.                           |
| firstTransmissionDate | string (ISO8601) | First AIS transmission observed                              | Historical vessel metadata                                                                                                        |
| flag                  | string           | Vessel flag state (ISO country code)                         | Example: `DNK`                                                                                                                    |
| geartype              | string           | Vessel gear classification                                   | Example: `FISHING`                                                                                                            |
| imo                   | string           | IMO vessel identifier                                        | May be empty string                                                                                                               |
| lastTransmissionDate  | string (ISO8601) | Most recent AIS transmission                                 | May be far in the future relative to event                                                                                        |
| lat                   | number           | Latitude of the center of the grid cell                      | WGS84 coordinates. Format depends on spatial resolution                                                                           |
| lon                   | number           | Longitude of the center of the grid cell                     | WGS84 coordinates. Format depends on spatial resolution                                                                           |
| mmsi                  | string           | Maritime Mobile Service Identity                             | Numeric but stored as string                                                                                                      |
| shipName              | string           | Vessel name                                                  | Capitalization varies                                                                                                             |
| vesselId              | string           | Unique vessel identifier in GFW dataset                      | UUID-like format                                                                                                                  |
| vesselType            | string           | Vessel classification                                        | Example: `CARGO `                                                                                                          |

---

# Event data Fields

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

| Field    | Type   | Description                | Notes                 |
| -------- | ------ | -------------------------- | --------------------- |
| id       | string | Vessel identifier          | Same as `vesselId`    |
| name     | string | Vessel name                |                       |
| ssvid    | string | Vessel MMSI identifier     |                       |
| flag     | string | Vessel flag country        |                       |
| type     | string | Vessel type classification |                       |
| nextPort | string | null                       | Next port destination |

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

# Examples

- Multiple detections — unmatched (hourly)

```json
{
  "callsign": "",
  "dataset": "",
  "date": "2025-10-15 05:00",
  "detections": 2,
  "entryTimestamp": "2025-01-01T17:49:54Z",
  "exitTimestamp": "2025-12-31T06:07:20Z",
  "firstTransmissionDate": "",
  "flag": "",
  "geartype": "",
  "imo": "",
  "lastTransmissionDate": "",
  "lat": 51.1,
  "lon": 2.440000057220459,
  "mmsi": "",
  "shipName": "",
  "vesselId": "",
  "vesselType": ""
}
```

interpretation:
During the time bucket 2025-10-15 05:00–05:59, within the grid cell centered at (51.1, 2.44), the system recorded 2 SAR detection events. No AIS match was found, so vessel identity cannot be determined. The detections may correspond to one or multiple vessels.
For unmatched records, entryTimestamp and exitTimestamp do not describe the specific record. They represent the overall temporal bounds of the query results, and therefore are identical across all unmatched records in the same response.

- Multiple detections — matched (hourly)

```json
{
  "callsign": "FOBQ",
  "dataset": "public-global-vessel-identity:v3.0",
  "date": "2025-10-15 05:00",
  "detections": 2,
  "entryTimestamp": "2025-01-08T17:41:50Z",
  "exitTimestamp": "2025-12-19T06:07:21Z",
  "firstTransmissionDate": "2012-01-01T02:35:28Z",
  "flag": "FRA",
  "geartype": "PASSENGER",
  "imo": "9232527",
  "lastTransmissionDate": "2026-04-27T23:59:58Z",
  "lat": 50.97,
  "lon": 1.7599999904632568,
  "mmsi": "227022800",
  "shipName": "COTE DES DUNES",
  "vesselId": "6bf433ccd-dd6f-16f3-6b7d-5594faae8e72",
  "vesselType": "PASSENGER"
}
```

interpretation:
During the time bucket 2025-10-15 05:00–05:59, within the grid cell centered at (50.97, 1.76), 2 SAR detection events were recorded and matched to the AIS-tracked vessel “COTE DES DUNES” (MMSI: 227022800). The exact detection timestamps within the time bucket are not available.
Since entryTimestamp and exitTimestamp are not identical, this indicates that the vessel appears in multiple records within the query results.
Multiple records for the same vessel may appear because the data is aggregated by both time (temporal buckets - hourly here) and space (grid cells).
Each record represents a unique combination of a time bucket and a grid cell.
entryTimestamp represents the earliest observation time of this vessel across all returned records, while exitTimestamp represents the latest observation time.

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
