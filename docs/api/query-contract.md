# Pharos API Documentation

## Base URL

**Iteration 1 (Local):**
http://localhost:{API_PORT}/v1/

**Future Version (Production):**
https://{DOMAIN}/api/v1

---

## Rate Limit

The API relies on the source's rate-limiting policies. Requests may be rejected with HTTP `429 Too Many Requests` when daily or monthly usage limits are exceeded. The service validates the rate-limit headers returned by the provider and returns a violation error when the configured thresholds are reached.
For more information, see the API documentation https://globalfishingwatch.org/our-apis/documentation?utm_source=chatgpt.com#rate-limits

```json
{
  "error": [
    {
      "field": "x-ratelimit-monthly-remaining-requests",
      "message": "Monthly rate limit exceeded"
    },
    {
      "field": "x-ratelimit-daily-remaining-requests",
      "message": "Daily rate limit exceeded"
    }
  ],
  "success": false
}
```

---

## Table of Contents

- [System Health](#system-health)
- [Authentication Login](#authentication-login)
- [Authentication Refresh Token](#authentication-refresh-token)
- [Authentication Token Check](#authentication-token-check)
- [Events Report](#events-report)
- [Events Export](#events-export)
- [Regions](#regions)

---

## System Health

**GET** `/system/health`

**Description:**
`Liveness check endpoint used to verify that the API service is running and reachable`

**Authentication:**
`None (public)`

---

### 1. Request - URL Parameters

---

### 2. Request - Body

```json
{}
```

---

### 3. Response

| Field   | Description    | Format  |
| ------- | -------------- | ------- |
| success | Request status | boolean |

---

#### Example: Success Response (200 OK)

```json
{
  "success": true
}
```

---

### 4. Errors

- `503 Service Unavailable` – Service is running but currently unhealthy or not ready to serve requests
- `No response / timeout` – Service is down, unreachable, or not responding at all

---

### 5. Notes

- This is a liveness check only
- Should always be fast and lightweight
- Used by monitoring / load balancers
- Does not return internal error payloads when down (no response possible)

---

## Authentication Login

**POST** `/auth/login`

**Description:**
`Authenticates a user with a username and password and returns a short-lived access token and a long-lived refresh token used to authorize protected endpoints.`

**Authentication:**
`None (public)`

---

### 1. Request - URL Parameters

| Parameter | Description             | Required | Format | Param Type |
| --------- | ----------------------- | -------- | ------ | ---------- |
| username  | Username of the account | False    | string | query      |
| password  | Password of the account | False    | string | query      |

---

### 2. Request - Body

| Key      | Description             | Required | Format | Param Type |
| -------- | ----------------------- | -------- | ------ | ---------- |
| username | Username of the account | True     | string | body       |
| password | Password of the account | True     | string | body       |

Example:

```json
{
  "username": "user",
  "password": "user"
}
```

---

### 3. Response

| Field        | Description                                       | Format  |
| ------------ | ------------------------------------------------- | ------- |
| success      | Request status                                    | boolean |
| accessToken  | Short-lived JWT used to authorize protected calls | string  |
| refreshToken | Long-lived JWT used to obtain a new access token  | string  |

---

#### Example: Success Response (200 OK)

```json
{
  "success": true,
  "accessToken": "<jwt-access-token>",
  "refreshToken": "<jwt-refresh-token>"
}
```

---

### 4. Errors

- `400 Bad Request` – Credential is required (username or password missing)
- `401 Unauthorized` – Invalid credentials

---

### 5. Notes

- Credentials may be provided either in the JSON request body or as `username` / `password` query parameters
- The returned access token must be sent as `Authorization: Bearer <accessToken>` to call protected endpoints
- Access tokens are short-lived; use the refresh token to obtain a new access token without re-authenticating
- For local testing, log in with username `user` and password `user`
- For the full authentication flow, see [the authentication documentation](./authentication.md)

---

## Authentication Refresh Token

**POST** `/auth/refresh`

**Description:**
`Exchanges a valid, unexpired refresh token for a new short-lived access token without re-entering credentials.`

**Authentication:**
`None (public)`

---

### 1. Request - URL Parameters

| Parameter    | Description                                      | Required | Format | Param Type |
| ------------ | ------------------------------------------------ | -------- | ------ | ---------- |
| refreshToken | Refresh token previously issued by `/auth/login` | False    | string | query      |

---

### 2. Request - Body

| Key          | Description                                      | Required | Format | Param Type |
| ------------ | ------------------------------------------------ | -------- | ------ | ---------- |
| refreshToken | Refresh token previously issued by `/auth/login` | True     | string | body       |

Example:

```json
{
  "refreshToken": "<jwt-refresh-token>"
}
```

---

### 3. Response

| Field       | Description                               | Format  |
| ----------- | ----------------------------------------- | ------- |
| success     | Request status                            | boolean |
| accessToken | Newly issued short-lived JWT access token | string  |

---

#### Example: Success Response (200 OK)

```json
{
  "success": true,
  "accessToken": "<jwt-access-token>"
}
```

---

### 4. Errors

- `400 Bad Request` – Refresh token required (refreshToken missing)
- `401 Unauthorized` – Refresh token expired, please login again
- `401 Unauthorized` – Invalid or expired refresh token

---

### 5. Notes

- The refresh token may be provided either in the JSON request body or as a `refreshToken` query parameter
- An expired refresh token returns `401`; the client must log in again to obtain a new token pair
- For the full authentication flow, see [the authentication documentation](./authentication.md)

---

## Authentication Token Check

**POST** `/auth/check-token`

**Description:**
`Verifies that an access token is well-formed and unexpired. Returns success when the token is valid.`

**Authentication:**
`None (public)`

---

### 1. Request - URL Parameters

| Parameter    | Description               | Required | Format | Param Type |
| ------------ | ------------------------- | -------- | ------ | ---------- |
| accessToken  | Access token to validate  | False    | string | query      |
| refreshToken | Refresh token to validate | False    | string | query      |

---

### 2. Request - Body

| Key          | Description               | Required | Format | Param Type |
| ------------ | ------------------------- | -------- | ------ | ---------- |
| accessToken  | Access token to validate  | False    | string | body       |
| refreshToken | Refresh token to validate | False    | string | body       |

Example:

```json
{
  "accessToken": "<jwt-access-token>"
}
```

---

### 3. Response

| Field   | Description    | Format  |
| ------- | -------------- | ------- |
| success | Request status | boolean |

---

#### Example: Success Response (200 OK)

```json
{
  "success": true
}
```

---

### 4. Errors

- `400 Bad Request` – Invalid or expired token (token missing, malformed, or expired)

---

### 5. Notes

- Provide either an `accessToken` or a `refreshToken` to validate; it may be supplied in the JSON request body or as a matching query parameter
- At least one token must be provided; a missing, malformed, or expired token all return `400` with the same error message
- For the full authentication flow, see [the authentication documentation](./authentication.md)

---

## Events Report

**POST** `/events`

**Description:**
`Returns filtered, sorted, and paginated event report data based on geospatial configuration, thresholds, and filtering rules.`

**Authentication:**
`Bearer access token required`

---

### 1. Request - URL Parameters

| Parameter           | Description                                                                    | Required | Format                                                               | Param Type |
| ------------------- | ------------------------------------------------------------------------------ | -------- | -------------------------------------------------------------------- | ---------- |
| datasets[i]         | Indexed dataset identifier(s) to query (e.g. `datasets[0]`, `datasets[1]`)     | True     | string                                                               | query      |
| filters[i]          | Indexed filter expression(s) applied to the upstream query (e.g. `filters[0]`) | False    | string                                                               | query      |
| format              | Output format of the upstream report                                           | True     | Enum: ['CSV', 'TIF', 'JSON']                                         | query      |
| temporal-resolution | Time aggregation granularity of the report                                     | True     | Enum: ['HOURLY', 'DAILY', 'MONTHLY', 'YEARLY', 'ENTIRE']             | query      |
| spatial-resolution  | Spatial granularity of the report                                              | False    | Enum: ['LOW', 'HIGH']                                                | query      |
| group-by            | Field used to group report results                                             | False    | Enum: ['VESSEL_ID', 'FLAG', 'GEARTYPE', 'FLAGANDGEARTYPE', 'MMSI']   | query      |
| spatial-aggregation | Whether to spatially aggregate report results                                  | False    | boolean                                                              | query      |
| region-dataset      | Dataset used to resolve region context (e.g. EEZ / MPA datasets)               | False    | string                                                               | query      |
| region-id           | Identifier of the selected region                                              | False    | string                                                               | query      |
| buffer-operation    | Operation applied to region buffering logic (if used)                          | False    | string                                                               | query      |
| buffer-unit         | Unit used for buffer distance calculation                                      | False    | Enum: ['MILES', 'NAUTICALMILES', 'KILOMETERS', 'RADIANS', 'DEGREES'] | query      |
| buffer-value        | Numeric buffer distance applied to region                                      | False    | string                                                               | query      |

---

### 2. Request - Body

| Key                                | Description                                                         | Required | Format                | Param Type |
| ---------------------------------- | ------------------------------------------------------------------- | -------- | --------------------- | ---------- |
| URL                                | Upstream 4Wings report endpoint URL used as the data source         | False    | string                | body       |
| method                             | HTTP method used for the upstream report request (defaults to POST) | False    | Enum: ['GET', 'POST'] | body       |
| [body_params](#body_params-object) | Spatial and external request configuration object                   | False    | object                | body       |
| [filter](#filter-object)           | Filtering rules applied before pagination                           | False    | object                | body       |
| [sort](#sort-array)                | Array of sorting rules applied to result set                        | False    | array                 | body       |
| [hotspot](#hotspot-object)         | Configuration object defining hotspot calculation rules             | False    | object                | body       |
| [threshold](#threshold-object)     | Configuration object defining scoring and classification thresholds | False    | object                | body       |
| [pagination](#pagination-object)   | Pagination parameters (page size and offset)                        | False    | object                | body       |

---

#### body_params Object

| Key     | Description                               | Required | Format | Param Type |
| ------- | ----------------------------------------- | -------- | ------ | ---------- |
| geojson | Geometry used to spatially filter events  | False    | object | body       |
| region  | Region-based spatial filter configuration | False    | object | body       |

- geojson

| Key         | Description                                                    | Required | Format                                                                               | Param Type |
| ----------- | -------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------ | ---------- |
| type        | Geometry type (Point, Polygon, LineString, MultiPolygon, etc.) | True     | Enum: ['Point','LineString','Polygon','MultiPoint','MultiLineString','MultiPolygon'] | body       |
| coordinates | GeoJSON coordinates defining the geometry                      | True     | array                                                                                | body       |

- region

| Key             | Description                                 | Required | Format                                                           | Param Type |
| --------------- | ------------------------------------------- | -------- | ---------------------------------------------------------------- | ---------- |
| dataset         | Dataset used for region selection           | False    | Enum: ['public-eez-areas','public-mpa-all']                      | body       |
| id              | Region identifier                           | False    | string                                                           | body       |
| bufferOperation | Buffer operation applied to region geometry | False    | string                                                           | body       |
| bufferUnit      | Unit for buffer distance                    | False    | Enum: ['MILES','NAUTICALMILES','KILOMETERS','RADIANS','DEGREES'] | body       |
| bufferValue     | Buffer distance value applied to region     | False    | string                                                           | body       |

Default:

```json
{
  "body_params": null
}
```

---

#### Filter Object

| Key                      | Description                      | Required | Format  | Param Type |
| ------------------------ | -------------------------------- | -------- | ------- | ---------- |
| triage_score_min         | Minimum triage score filter      | False    | number  | body       |
| triage_score_max         | Maximum triage score filter      | False    | number  | body       |
| uncertainty_score_min    | Minimum uncertainty score filter | False    | number  | body       |
| uncertainty_score_max    | Maximum uncertainty score filter | False    | number  | body       |
| distance_to_coast_km_min | Minimum distance to coast (km)   | False    | number  | body       |
| distance_to_coast_km_max | Maximum distance to coast (km)   | False    | number  | body       |
| reason_codes_include     | Include specific reason codes    | False    | array   | body       |
| reason_codes_exclude     | Exclude specific reason codes    | False    | array   | body       |
| only_inside_eez          | Keep only events inside EEZ      | False    | boolean | body       |
| only_inside_mpa          | Keep only events inside MPA      | False    | boolean | body       |
| bathymetry_min           | Minimum bathymetry value         | False    | number  | body       |
| bathymetry_max           | Maximum bathymetry value         | False    | number  | body       |

Default:

```json
{
  "filter": {}
}
```

---

#### Sort Array

| Key       | Description                    | Required | Format               | Param Type |
| --------- | ------------------------------ | -------- | -------------------- | ---------- |
| sortBy    | Field used for sorting results | True     | string               | body       |
| direction | Sort direction                 | False    | Enum: ['asc','desc'] | body       |

For more information, please refer to [the sort documentation](../data/sort-events.md).

Default:

```json
{
  "sort": [
    {
      "sortBy": "scoring.triage_score",
      "direction": "desc"
    },
    {
      "sortBy": "scoring.uncertainty_score",
      "direction": "asc"
    },
    {
      "sortBy": "timestamp_utc",
      "direction": "desc"
    }
  ]
}
```

---

#### Hotspot Object

| Key        | Description                           | Required | Format                   | Param Type |
| ---------- | ------------------------------------- | -------- | ------------------------ | ---------- |
| resolution | Spatial resolution level (0–15 scale) | True     | number                   | body       |
| timeBin    | Time aggregation bin                  | True     | Enum: ['HOURLY','DAILY'] | body       |

For more information, please refer to [the hotspot documentation](../tech/hotspots.md).

Default:

```json
{
  "hotspot": {
    "resolution": 5,
    "timeBin": "HOURLY"
  }
}
```

---

#### Threshold Object

| Key                            | Description                                    | Required | Format | Param Type |
| ------------------------------ | ---------------------------------------------- | -------- | ------ | ---------- |
| near_coast_threshold           | Threshold for coastal proximity classification | False    | number | body       |
| low_confidence_proxy_threshold | Low confidence proxy threshold                 | False    | number | body       |
| shallow_water_threshold        | Shallow water classification threshold         | False    | number | body       |
| deep_water_threshold           | Deep water classification threshold            | False    | number | body       |
| low_triage_score_threshold     | Low triage score threshold                     | False    | number | body       |
| medium_triage_score_threshold  | Medium triage score threshold                  | False    | number | body       |
| high_triage_score_threshold    | High triage score threshold                    | False    | number | body       |

For more information, please refer to [the scoring documentation](../tech/scoring-spec.md).

Default:

```json
{
  "threshold": {
    "near_coast_threshold": 10,
    "low_confidence_proxy_threshold": 2,
    "shallow_water_threshold": -50,
    "deep_water_threshold": -200,
    "low_triage_score_threshold": 0.3,
    "medium_triage_score_threshold": 0.6,
    "high_triage_score_threshold": 0.85
  }
}
```

---

#### Pagination Object

| Key    | Description                                       | Required | Format | Param Type |
| ------ | ------------------------------------------------- | -------- | ------ | ---------- |
| limit  | Number of items per page returned in the response | False    | number | body       |
| offset | Number of items to skip before collecting results | False    | number | body       |

If the pagination object is omitted, it defaults to `limit: 100` and `offset: 0`. When the object is provided, both `limit` and `offset` are required.

Default:

```json
{
  "pagination": {
    "limit": 100,
    "offset": 0
  }
}
```

---

### 3. Response

| Field                                     | Description                                                                                                      | Format  |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------- |
| success                                   | Request status                                                                                                   | boolean |
| [pagination](#pagination-response-object) | Pagination information                                                                                           | object  |
| metadata                                  | Execution metadata                                                                                               | object  |
| stats                                     | Aggregated statistics for returned events                                                                        | object  |
| entries                                   | List of event records. For more information, please refer to [the event documentation](../data/event-schema.md). | array   |

---

#### Pagination Response Object

| Field       | Description                      | Format         |
| ----------- | -------------------------------- | -------------- |
| total       | Total number of matching records | number         |
| limit       | Page size limit                  | number         |
| offset      | Current offset                   | number         |
| nextOffset  | Next page offset                 | number or null |
| prevOffset  | Previous page offset             | number or null |
| pageSize    | Number of items in current page  | number         |
| totalPages  | Total number of pages            | number         |
| currentPage | Current page index               | number         |

---

#### Example: Success Response (200 OK) - With data

```json
{
  "success": true,
  "metadata": {},
  "pagination": {},
  "stats": {},
  "entries": []
}
```

#### Example: Success Response (200 OK) - Empty dataset

```json
{
  "success": true,
  "metadata": {},
  "pagination": {},
  "entries": []
}
```

---

### 4. Errors

- `400 Bad Request` – Invalid query parameters
- `400 Bad Request` – Body validation failed
- `400 Bad Request` – Offset exceeds total available items
- `401 Unauthorized` – Missing, invalid, or expired access token
- `500 Internal Server Error` – Unexpected server-side failure

---

### 5. Notes

- Filtering matched events must be specified in the URL query parameters using the filters[0] key.
  `Example: filters[0]=matched='false'`
- Filtering is applied before pagination
- Sorting is applied before pagination
- Empty results still return valid pagination structure
- Offset beyond total returns HTTP 400
- Stateless report generation endpoint
- Geospatial filtering supported via region + buffer config
- Offset-based pagination
- Sorting supports multiple fields
- Filters applied before pagination
- Intended for analytics workloads

---

## Events Export

**POST** `/exports/events`

**Description:**
`Builds a ZIP archive from the supplied items containing the files selected in the export configuration, and streams it back to the caller as a binary download.`

**Authentication:**
`Bearer access token required`

---

### 1. Request - URL Parameters

---

### 2. Request - Body

| Key                             | Description                                                                                                                                         | Required | Format | Param Type |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------ | ---------- |
| [config](#export-config-object) | Run configuration used to build the bundle and its run metadata. Same shape as the [Events Report](#events-report) body, plus an `export` selector. | True     | object | body       |
| events                          | Canonical event records to include in the bundle                                                                                                    | True     | array  | body       |
| hotspots                        | Hotspot records to include when hotspot files are selected                                                                                          | False    | array  | body       |

---

#### Export Config Object

The `config` object reuses the [Events Report](#events-report) request body (URL, method, body_params, filter, sort, hotspot, threshold, pagination) and adds an `export` object that selects which files are written into the archive.

- export

| Key                  | Description                             | Required | Format  | Param Type |
| -------------------- | --------------------------------------- | -------- | ------- | ---------- |
| canonicalSchema.json | Include the canonical event schema JSON | False    | boolean | body       |
| event.geojson        | Include events as GeoJSON               | False    | boolean | body       |
| event.parquet        | Include events as Parquet               | False    | boolean | body       |
| events.csv           | Include events as CSV                   | False    | boolean | body       |
| stats.json           | Include aggregated statistics JSON      | False    | boolean | body       |
| hotspots.geojson     | Include hotspots as GeoJSON             | False    | boolean | body       |
| hotspots.parquet     | Include hotspots as Parquet             | False    | boolean | body       |
| run_metadata.json    | Include run metadata JSON               | False    | boolean | body       |

When the `export` object is omitted it defaults to `events.csv`, `event.geojson`, and `run_metadata.json`.

Default:

```json
{
  "export": {
    "events.csv": true,
    "event.geojson": true,
    "run_metadata.json": true
  }
}
```

---

### 3. Response

On success the endpoint streams a binary ZIP archive (not a JSON envelope). The archive contains one file per selected `export` entry.

| Header              | Description                                          | Example                                 |
| ------------------- | ---------------------------------------------------- | --------------------------------------- |
| Content-Type        | Always `application/zip`                             | `application/zip`                       |
| Content-Disposition | Attachment carrying the generated export id filename | `attachment; filename="<exportId>.zip"` |

---

#### Example: Success Response (200 OK)

```
Binary ZIP archive (application/zip) — see Content-Disposition for the file name
```

---

### 4. Errors

- `400 Bad Request` – No events available (the `events` array is missing or empty)
- `401 Unauthorized` – Missing, invalid, or expired access token
- `500 Internal Server Error` – Export bundle could not be generated

---

### 5. Notes

- The success response is a binary ZIP download, not a JSON payload; error responses use the standard JSON error envelope
- The generated file name (`<exportId>.zip`) is returned in the `Content-Disposition` header, which is exposed to the browser via CORS
- The caller selects which files to include through `config.export`; hotspot files are written only when `hotspots` records are supplied in the request body
- Each export also writes a server-side audit log (`<exportId>_audit_log.json`) capturing the user, timestamp, configuration hash, and event count
- The archive is retained server-side in addition to being returned to the caller

---

## Regions

**GET** `/regions`

**Description:**
`Returns the selectable EEZ or MPA region options for building an Area of Interest query — one entry per region with its id, title, bounding box, and a centroid point (not the real boundary geometry).`

**Authentication:**
`Bearer access token required`

---

### 1. Request - URL Parameters

| Key     | Description                      | Required | Format               | Param Type |
| ------- | --------------------------------- | -------- | -------------------- | ---------- |
| dataset | Which region collection to list   | True     | Enum: ['EEZ', 'MPA'] | query      |

---

### 2. Request - Body

```json
{}
```

---

### 3. Response

| Field   | Description                                                                                                            | Format  |
| ------- | ----------------------------------------------------------------------------------------------------------------------- | ------- |
| success | Request status                                                                                                           | boolean |
| entries | One entry per region: a GeoJSON Feature with a centroid Point geometry, `bbox`, and `properties.id` / `properties.title` | array   |

---

#### Example: Success Response (200 OK)

```json
{
  "success": true,
  "entries": [
    {
      "type": "Feature",
      "properties": {
        "id": "8444",
        "title": "United States Exclusive Economic Zone (American Samoa)"
      },
      "bbox": [-173.77, -17.56, -165.2, -10.02],
      "geometry": { "type": "Point", "coordinates": [-170.2, -14.02] }
    }
  ]
}
```

---

### 4. Errors

- `400 Bad Request` – `dataset` is missing or not a recognized value
- `400 Bad Request` – `dataset` is a recognized value with no region list to serve (e.g. `Bathymetry` — it has no selectable regions)
- `401 Unauthorized` – Missing, invalid, or expired access token

---

### 5. Notes

- `dataset` uses the same `EEZ` / `MPA` values as the `region-dataset` field on [Events Report](#events-report); the `id` returned here is the same `region-id` that endpoint accepts
- Each feature's `geometry` is a cheap centroid point, not the real boundary polygon — the MPA dataset alone is 17,000+ features, so shipping full boundaries would be a much larger payload than a dropdown or a "zoom the map to this region" use case needs. `bbox` is what a client fits/zooms the map to; the centroid is enough to place a marker or fly to a point
- A small share of the source EEZ/MPA data (an overlapping-claim EEZ, and roughly a fifth of MPA sites) has no boundary geometry recorded upstream; those entries are silently excluded rather than returned with a broken bbox/centroid
- Options for a dataset are computed once per server process and memoized — repeat requests are served from the cached list, not recomputed

---

_End of Documentation_
