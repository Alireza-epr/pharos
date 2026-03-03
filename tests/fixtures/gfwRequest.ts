import { EFetchMethods } from '../../src/enum/gfwEnum';
import { IConfigJSON } from '../../src/types/eventTypes';

export const sarConfig: IConfigJSON = {
  source: 'public-global-sar-presence:v3.0',
  base_url: 'https://gateway.api.globalfishingwatch.org/v3/4wings/report/',
  method: EFetchMethods.post,
  url_params: {
    'spatial-resolution': 'HIGH',
    'temporal-resolution': 'HOURLY',
    'datasets[0]': 'public-global-sar-presence:v3.0',
    'date-range': '2025-12-04T00:00:00Z,2025-12-06T23:59:59Z',
    format: 'JSON',
    'group-by': 'VESSEL_ID',
  },
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
};

export const sarConfig_diff_sorted: IConfigJSON = {
  url_params: {
    'spatial-resolution': 'HIGH',
    'temporal-resolution': 'HOURLY',
    'datasets[0]': 'public-global-sar-presence:v3.0',
    'date-range': '2025-12-04T00:00:00Z,2025-12-06T23:59:59Z',
    format: 'JSON',
    'group-by': 'VESSEL_ID',
  },
  source: 'public-global-sar-presence:v3.0',
  base_url: 'https://gateway.api.globalfishingwatch.org/v3/4wings/report/',
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
  method: EFetchMethods.post,
};

export const eventConfig: IConfigJSON = {
  source: 'public-global-port-visits-events:v3.0',
  base_url: 'https://gateway.api.globalfishingwatch.org/v3/events',
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

export const eventConfig_diff_sorted: IConfigJSON = {
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
  base_url: 'https://gateway.api.globalfishingwatch.org/v3/events',
  url_params: {
    limit: 2,
    offset: 0,
  },
  method: EFetchMethods.post,
  source: 'public-global-port-visits-events:v3.0',
};
