import { EFetchMethods } from '@packages/enum';
import { IConfigJSON } from '@packages/types';

export const sarConfig: any = {
  "URL": "https://gateway.api.globalfishingwatch.org/v3/4wings/report/",
  "method": "POST",
  "body_params": {
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
  },
  "url_params": {
    "spatial-resolution": "HIGH",
    "temporal-resolution": "HOURLY",
    "datasets[0]": "public-global-sar-presence:v3.0",
    "date-range": "2025-12-01T00:00:00Z,2025-12-07T23:59:59Z",
    "format": "JSON",
    "group-by": "VESSEL_ID",
    "filters[0]": ""
  },
  "threshold": {
    "near_coast_threshold": 10,
    "low_detection_confidence_threshold": 2,
    "shallow_water_threshold": -50,
    "deep_water_threshold": -200,
    "low_triage_score_threshold": 0.3,
    "medium_triage_score_threshold": 0.6,
    "high_triage_score_threshold": 0.85
  },
  "hotspot": {
    "resolution": 5,
    "timeBin": "HOURLY"
  },
  "output": "data/out/"
};

export const sarConfig_diff_sorted: any = {
  "url_params": {
    "spatial-resolution": "HIGH",
    "temporal-resolution": "HOURLY",
    "datasets[0]": "public-global-sar-presence:v3.0",
    "date-range": "2025-12-01T00:00:00Z,2025-12-07T23:59:59Z",
    "format": "JSON",
    "group-by": "VESSEL_ID",
    "filters[0]": ""
  },
  "hotspot": {
    "resolution": 5,
    "timeBin": "HOURLY"
  },
  "method": "POST",
  "body_params": {
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
  },
  "URL": "https://gateway.api.globalfishingwatch.org/v3/4wings/report/",
  "output": "data/out/",
  "threshold": {
    "near_coast_threshold": 10,
    "low_detection_confidence_threshold": 2,
    "shallow_water_threshold": -50,
    "deep_water_threshold": -200,
    "low_triage_score_threshold": 0.3,
    "medium_triage_score_threshold": 0.6,
    "high_triage_score_threshold": 0.85
  },
};

export const eventConfig = {
  source: 'public-global-port-visits-events:v3.0',
  URL: 'https://gateway.api.globalfishingwatch.org/v3/events',
  method: EFetchMethods.post,
  url_params: {
    limit: 2,
    offset: 0,
  },
  body_params: {
    vessels: ['403dc1002-210e-de4b-331d-b4012153dfa4'],
    startDate: '2025-12-04T00:00:00Z',
    endDate: '2025-12-06T23:59:59Z',
    datasets: ['public-global-port-visits-events:v3.0'],
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [14.11, 55.26],
          [14.68, 55.27],
          [14.69, 55.11],
          [14.09, 55.08],
          [14.11, 55.26],
        ],
      ],
    },
  },
};

export const eventConfig_diff_sorted = {
  body_params: {
    vessels: ['403dc1002-210e-de4b-331d-b4012153dfa4'],
    startDate: '2025-12-04T00:00:00Z',
    endDate: '2025-12-06T23:59:59Z',
    datasets: ['public-global-port-visits-events:v3.0'],
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [14.11, 55.26],
          [14.68, 55.27],
          [14.69, 55.11],
          [14.09, 55.08],
          [14.11, 55.26],
        ],
      ],
    },
  },
  URL: 'https://gateway.api.globalfishingwatch.org/v3/events',
  url_params: {
    limit: 2,
    offset: 0,
  },
  method: EFetchMethods.post,
  source: 'public-global-port-visits-events:v3.0',
};
