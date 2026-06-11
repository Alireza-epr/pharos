import { EFetchMethods } from '@packages/enum';
import { IConfigJSON } from '@packages/types';

export const sarConfig: any = {
  URL: 'https://gateway.api.globalfishingwatch.org/v3/4wings/report/',
  method: 'POST',
  body_params: {
    geojson: {
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
  url_params: {
    'spatial-resolution': 'HIGH',
    'temporal-resolution': 'HOURLY',
    'datasets[0]': 'public-global-sar-presence:v3.0',
    'date-range': '2025-12-01T00:00:00Z,2025-12-07T23:59:59Z',
    format: 'JSON',
    'group-by': 'VESSEL_ID',
    'filters[0]': '',
  },
  threshold: {
    near_coast_threshold: 10,
    low_confidence_proxy_threshold: 2,
    shallow_water_threshold: -50,
    deep_water_threshold: -200,
    low_triage_score_threshold: 0.3,
    medium_triage_score_threshold: 0.6,
    high_triage_score_threshold: 0.85,
    base_uncertainty_weight: 0.1,
    missing_field_weight: 0.08,
    noisy_weight: 0.15,
    unmatched_weight: 0.2,
    near_coast_importance_weight: 0.3,
    eez_importance_weight: 0.2,
    mpa_importance_weight: 0.5,
    missing_confidence_proxy_weight: 0.25,
    low_confidence_proxy_weight: 0.2,
    low_confidence_tier_weight: 0.08,
    medium_confidence_tier_weight: 0.0,
    high_confidence_tier_weight: -0.05,
  },
  hotspot: {
    resolution: 5,
    timeBin: 'HOURLY',
  },
  output: 'data/out/pilot/',
  sort: [
    {
      sortBy: 'scoring.triage_score',
      direction: 'desc',
    },
    {
      sortBy: 'scoring.uncertainty_score',
      direction: 'asc',
    },
    {
      sortBy: 'timestamp_utc',
      direction: 'desc',
    },
  ],
  filter: {},
};

export const sarConfig_with_hidden_config: any = {
  ...sarConfig,
  gitCommitSHA: 'e92b190f96c4a51f5b99fe9a0107a575b6070506',
  export: {
    'canonicalSchema.json': true,
    'event.geojson': true,
    'event.parquet': true,
    'events.csv': true,
    'stats.json': true,
    'hotspots.geojson': true,
    'hotspots.parquet': true,
    'run_metadata.json': true,
  },
};

export const sarConfig_invalid_sort_sortBy: any = {
  ...sarConfig,
  sort: [
    {
      sortBy: 'timestamp',
      direction: 'asc',
    },
    {
      sortBy: 'event_id',
      direction: 'asc',
    },
  ],
};

export const sarConfig_invalid_sort_direction: any = {
  ...sarConfig,
  sort: [
    {
      sortBy: 'timestamp_utc',
      direction: 'asc',
    },
    {
      sortBy: 'event_id',
      direction: 'descend',
    },
  ],
};

export const sarConfig_diff_sorted: any = {
  method: 'POST',
  body_params: {
    geojson: {
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
  URL: 'https://gateway.api.globalfishingwatch.org/v3/4wings/report/',
  filter: {},
  threshold: {
    near_coast_threshold: 10,
    low_confidence_proxy_threshold: 2,
    shallow_water_threshold: -50,
    deep_water_threshold: -200,
    low_triage_score_threshold: 0.3,
    medium_triage_score_threshold: 0.6,
    high_triage_score_threshold: 0.85,
    base_uncertainty_weight: 0.1,
    missing_field_weight: 0.08,
    noisy_weight: 0.15,
    unmatched_weight: 0.2,
    near_coast_importance_weight: 0.3,
    eez_importance_weight: 0.2,
    mpa_importance_weight: 0.5,
    missing_confidence_proxy_weight: 0.25,
    low_confidence_proxy_weight: 0.2,
    low_confidence_tier_weight: 0.08,
    medium_confidence_tier_weight: 0.0,
    high_confidence_tier_weight: -0.05,
  },
  url_params: {
    'spatial-resolution': 'HIGH',
    'temporal-resolution': 'HOURLY',
    'datasets[0]': 'public-global-sar-presence:v3.0',
    'date-range': '2025-12-01T00:00:00Z,2025-12-07T23:59:59Z',
    format: 'JSON',
    'group-by': 'VESSEL_ID',
    'filters[0]': '',
  },
  hotspot: {
    resolution: 5,
    timeBin: 'HOURLY',
  },
  sort: [
    {
      sortBy: 'scoring.triage_score',
      direction: 'desc',
    },
    {
      sortBy: 'scoring.uncertainty_score',
      direction: 'asc',
    },
    {
      sortBy: 'timestamp_utc',
      direction: 'desc',
    },
  ],
  output: 'data/out/pilot/',
};

export const sarConfig_bad_threshold: any = {
  ...sarConfig,
  threshold: {
    base_uncertainty_weight: undefined,
    missing_field_weight: NaN,
    noisy_weight: '0.15',
    unmatched_weight: 'two',
    near_coast_importance_weight: 'negative',
    eez_importance_weight: '0.2',
    mpa_importance_weight: NaN,
    missing_confidence_proxy_weight: {},
    low_confidence_proxy_weight: [],
    low_confidence_tier_weight: '0.08',
    medium_confidence_tier_weight: '0.0',
    high_confidence_tier_weight: '-0.05',
  },
};

export const sarConfig_empty_threshold: any = {
  ...sarConfig,
  threshold: {},
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

export const multiDatasetConfig: any = {
  ...sarConfig,
  url_params: {
    'datasets[0]': 'public-global-sar-presence:v3.0',
    'datasets[1]': 'public-global-presence:v3.0',
    'datasets[2]': 'public-global-fishing-effort:v3.0',
    'date-range': '2025-04-01T00:00:00Z,2025-04-01T23:59:59Z',
    'filters[0]': '',
    format: 'JSON',
    'group-by': 'VESSEL_ID',
    'spatial-resolution': 'HIGH',
    'temporal-resolution': 'HOURLY',
  },
};

export const aisConfig: any = {
  ...sarConfig,
  url_params: {
    'spatial-resolution': 'HIGH',
    'temporal-resolution': 'HOURLY',
    'datasets[0]': 'public-global-presence:v3.0',
    'date-range': '2025-12-01T00:00:00Z,2025-12-07T23:59:59Z',
    format: 'JSON',
    'group-by': 'VESSEL_ID',
    'filters[0]': '',
  },
};

export const fishingConfig: any = {
  ...sarConfig,
  url_params: {
    'spatial-resolution': 'HIGH',
    'temporal-resolution': 'HOURLY',
    'datasets[0]': 'public-global-fishing-effort:v3.0',
    'date-range': '2025-12-01T00:00:00Z,2025-12-07T23:59:59Z',
    format: 'JSON',
    'group-by': 'VESSEL_ID',
    'filters[0]': '',
  },
};
