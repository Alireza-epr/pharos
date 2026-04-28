import {
  EReasonCodesStatic,
  EContextLayerDatasets,
  EFetchMethods,
} from '@packages/enum';
import { IEventSchema } from '@packages/types';

export const eventSchema_matched_near_coast: any = {
  version: '1.0.0',
  event_id: 'd4f97da2afb84fab4aad1f7d56bfaa765f65e2ea3f705be0868badce53fa724b',
  timestamp_utc: '2025-12-06T05:25:03Z',
  matched_flag: true,
  confidence_proxy: null,
  lat: 55.24,
  lon: 14.329999923706055,
  source:
    'public-global-sar-presence:v3.0, public-global-port-visits-events:v3.0',
  raw_metadata: {
    callsign: 'PBDI',
    dataset: 'public-global-vessel-identity:v3.0',
    date: '2025-12-06 05:00',
    detections: 1,
    entryTimestamp: '2025-12-06T05:25:03Z',
    exitTimestamp: '2025-12-06T05:25:03Z',
    firstTransmissionDate: '2025-10-14T12:26:31Z',
    flag: 'NLD',
    geartype: 'CARGO',
    imo: '1046104',
    lastTransmissionDate: '2026-03-22T23:59:00Z',
    lat: 55.24,
    lon: 14.329999923706055,
    mmsi: '244067000',
    shipName: 'BALTIC SAIL',
    vesselId: '43c5ec9e1-1026-c273-d280-f0c34b520f53',
    vesselType: 'CARGO',
  },
  raw_event_metadata: null,
  run_metadata: {
    code_version: '30d5cc0f3384e59e2ba80c1fc8b1aad14fa81bee',
    config_json: [
      {
        base_url:
          'https://gateway.api.globalfishingwatch.org/v3/4wings/report/',
        body_params: {
          geojson: {
            coordinates: [
              [
                [14.11, 55.26],
                [14.68, 55.27],
                [14.69, 55.11],
                [14.09, 55.08],
                [14.11, 55.26],
              ],
            ],
            type: 'Polygon',
          },
        },
        method: 'POST',
        source: 'public-global-sar-presence:v3.0',
        url_params: {
          'datasets[0]': 'public-global-sar-presence:v3.0',
          'date-range': '2025-12-01T00:00:00Z,2025-12-07T23:59:59Z',
          'filters[0]': '',
          format: 'JSON',
          'group-by': 'VESSEL_ID',
          'spatial-resolution': 'HIGH',
          'temporal-resolution': 'HOURLY',
        },
      },
      {
        base_url: 'https://gateway.api.globalfishingwatch.org/v3/events',
        body_params: {
          datasets: ['public-global-port-visits-events:v3.0'],
          endDate: '2025-12-07T23:59:59Z',
          geometry: {
            coordinates: [
              [
                [14.11, 55.26],
                [14.68, 55.27],
                [14.69, 55.11],
                [14.09, 55.08],
                [14.11, 55.26],
              ],
            ],
            type: 'Polygon',
          },
          startDate: '2025-12-01T00:00:00Z',
          vessels: ['43c5ec9e1-1026-c273-d280-f0c34b520f53'],
        },
        method: 'POST',
        source: 'public-global-port-visits-events:v3.0',
        url_params: {
          limit: 1,
          offset: 0,
        },
      },
    ],
    config_hash:
      '94d5ab42294a795532b7b49762f24dfeaf8f7ff56375a08c4e7cbb0715c3b4ea',
  },
  context_layers: {
    EEZ: {
      dataset: 'public-eez-areas',
      version: 'v3',
      enrichments: [],
    },
    MPA: {
      dataset: 'public-mpa-all',
      version: 'v3',
      enrichments: [],
    },
  },
  distance_to_coast_km: 2,
  scoring: {
    triage_score: null,
    uncertainty_score: null,
    reason_codes: [],
  },
  geom: {
    type: 'Point',
    coordinates: [14.329999923706055, 55.24],
  },
  rejected: false,
};
export const eventSchema_matched_offshore: any = {
  version: '1.0.0',
  event_id: 'd4f97da2afb84fab4aad1f7d56bfaa765f65e2ea3f705be0868badce53fa724b',
  timestamp_utc: '2025-12-06T05:25:03Z',
  matched_flag: true,
  confidence_proxy: null,
  lat: 55.24,
  lon: 14.329999923706055,
  source:
    'public-global-sar-presence:v3.0, public-global-port-visits-events:v3.0',
  raw_metadata: {
    callsign: 'PBDI',
    dataset: 'public-global-vessel-identity:v3.0',
    date: '2025-12-06 05:00',
    detections: 1,
    entryTimestamp: '2025-12-06T05:25:03Z',
    exitTimestamp: '2025-12-06T05:25:03Z',
    firstTransmissionDate: '2025-10-14T12:26:31Z',
    flag: 'NLD',
    geartype: 'CARGO',
    imo: '1046104',
    lastTransmissionDate: '2026-03-22T23:59:00Z',
    lat: 55.24,
    lon: 14.329999923706055,
    mmsi: '244067000',
    shipName: 'BALTIC SAIL',
    vesselId: '43c5ec9e1-1026-c273-d280-f0c34b520f53',
    vesselType: 'CARGO',
  },
  raw_event_metadata: null,
  run_metadata: {
    code_version: '30d5cc0f3384e59e2ba80c1fc8b1aad14fa81bee',
    config_json: [
      {
        base_url:
          'https://gateway.api.globalfishingwatch.org/v3/4wings/report/',
        body_params: {
          geojson: {
            coordinates: [
              [
                [14.11, 55.26],
                [14.68, 55.27],
                [14.69, 55.11],
                [14.09, 55.08],
                [14.11, 55.26],
              ],
            ],
            type: 'Polygon',
          },
        },
        method: 'POST',
        source: 'public-global-sar-presence:v3.0',
        url_params: {
          'datasets[0]': 'public-global-sar-presence:v3.0',
          'date-range': '2025-12-01T00:00:00Z,2025-12-07T23:59:59Z',
          'filters[0]': '',
          format: 'JSON',
          'group-by': 'VESSEL_ID',
          'spatial-resolution': 'HIGH',
          'temporal-resolution': 'HOURLY',
        },
      },
      {
        base_url: 'https://gateway.api.globalfishingwatch.org/v3/events',
        body_params: {
          datasets: ['public-global-port-visits-events:v3.0'],
          endDate: '2025-12-07T23:59:59Z',
          geometry: {
            coordinates: [
              [
                [14.11, 55.26],
                [14.68, 55.27],
                [14.69, 55.11],
                [14.09, 55.08],
                [14.11, 55.26],
              ],
            ],
            type: 'Polygon',
          },
          startDate: '2025-12-01T00:00:00Z',
          vessels: ['43c5ec9e1-1026-c273-d280-f0c34b520f53'],
        },
        method: 'POST',
        source: 'public-global-port-visits-events:v3.0',
        url_params: {
          limit: 1,
          offset: 0,
        },
      },
    ],
    config_hash:
      '94d5ab42294a795532b7b49762f24dfeaf8f7ff56375a08c4e7cbb0715c3b4ea',
  },
  context_layers: {
    EEZ: {
      dataset: 'public-eez-areas',
      version: 'v3',
      enrichments: [],
    },
    MPA: {
      dataset: 'public-mpa-all',
      version: 'v3',
      enrichments: [],
    },
    RFMO: {
      dataset: 'public-rfmo',
      version: 'v3',
      enrichments: [],
    },
  },
  distance_to_coast_km: 20,
  scoring: {
    triage_score: null,
    uncertainty_score: null,
    reason_codes: [],
  },
  geom: {
    type: 'Point',
    coordinates: [14.329999923706055, 55.24],
  },
  rejected: false,
};

export const eventSchema_matched_with_port_event: any = {
  version: '1.0.0',
  event_id: '874df96e65c6dc650d39eb98943ce25e7b3a82173e88f29c404609050a85c02e',
  timestamp_utc: '2025-12-04T16:53:26Z',
  matched_flag: true,
  confidence_proxy: 4,
  lat: 55.16,
  lon: 14.68,
  source:
    'public-global-sar-presence:v3.0, public-global-port-visits-events:v3.0',
  raw_metadata: {
    callsign: 'OVDN',
    dataset: 'public-global-vessel-identity:v3.0',
    date: '2025-12-04 16:00',
    detections: 1,
    entryTimestamp: '2025-12-04T16:53:26Z',
    exitTimestamp: '2025-12-04T16:53:26Z',
    firstTransmissionDate: '2018-09-13T16:47:49Z',
    flag: 'DNK',
    geartype: 'OTHER',
    imo: '',
    lastTransmissionDate: '2026-03-21T13:10:14Z',
    lat: 55.16,
    lon: 14.680000305175781,
    mmsi: '219000217',
    shipName: 'HDMS SOELOEVEN',
    vesselId: '22c7ca42d-df50-18b5-713a-a81e9115052c',
    vesselType: 'OTHER',
  },
  raw_event_metadata: {
    start: '2025-12-05T12:06:41.000Z',
    end: '2025-12-06T12:08:08.000Z',
    id: 'efc1703a86346486d884cbd5fc5aab74',
    type: 'port_visit',
    position: {
      lat: 55.1155,
      lon: 14.6758,
    },
    regions: {
      mpa: ['555790698', '555543143', '555522525'],
      eez: ['5674'],
      rfmo: ['NASCO', 'ACAP', 'NAMMCO', 'ICCAT', 'IWC', 'ICES'],
      fao: ['27.3.d.24', '27.3.d', '27.3', '27'],
      majorFao: ['27'],
      eez12Nm: ['5674'],
      highSeas: [],
      mpaNoTakePartial: [],
      mpaNoTake: [],
    },
    boundingBox: [
      14.693334446163684, 55.105045722833694, 14.693334446163684,
      55.105045722833694,
    ],
    distances: {
      startDistanceFromShoreKm: 0,
      endDistanceFromShoreKm: 0,
      startDistanceFromPortKm: 0,
      endDistanceFromPortKm: 0,
    },
    vessel: {
      id: '22c7ca42d-df50-18b5-713a-a81e9115052c',
      name: 'HDMS SOELOEVEN',
      ssvid: '219000217',
      flag: 'DNK',
      type: 'other',
      nextPort: null,
    },
    port_visit: {
      visitId: '22efc11c118fb011f640e6328d54744f',
      confidence: '4',
      durationHrs: 24.024166666666666,
      startAnchorage: {
        anchorageId: '46551b1d',
        atDock: true,
        distanceFromShoreKm: '0',
        flag: 'DNK',
        id: 'dnk-roenne',
        lat: 55.105045722833694,
        lon: 14.693334446163684,
        name: 'ROENNE',
        topDestination: 'BAY LIGHTER',
      },
      intermediateAnchorage: {
        anchorageId: '46551b1d',
        atDock: true,
        distanceFromShoreKm: '0',
        flag: 'DNK',
        id: 'dnk-roenne',
        lat: 55.105045722833694,
        lon: 14.693334446163684,
        name: 'ROENNE',
        topDestination: 'BAY LIGHTER',
      },
      endAnchorage: {
        anchorageId: '46551b1d',
        atDock: true,
        distanceFromShoreKm: '0',
        flag: 'DNK',
        id: 'dnk-roenne',
        lat: 55.105045722833694,
        lon: 14.693334446163684,
        name: 'ROENNE',
        topDestination: 'BAY LIGHTER',
      },
    },
  },
  run_metadata: {
    code_version: '12fab494d77b0976f03d6f077651259a5cdde44c',
    config_json: [
      {
        base_url:
          'https://gateway.api.globalfishingwatch.org/v3/4wings/report/',
        body_params: {
          geojson: {
            coordinates: [
              [
                [14.11, 55.26],
                [14.68, 55.27],
                [14.69, 55.11],
                [14.09, 55.08],
                [14.11, 55.26],
              ],
            ],
            type: 'Polygon',
          },
        },
        method: 'POST',
        source: 'public-global-sar-presence:v3.0',
        url_params: {
          'datasets[0]': 'public-global-sar-presence:v3.0',
          'date-range': '2025-12-01T00:00:00Z,2025-12-07T23:59:59Z',
          'filters[0]': '',
          format: 'JSON',
          'group-by': 'VESSEL_ID',
          'spatial-resolution': 'HIGH',
          'temporal-resolution': 'HOURLY',
        },
      },
      {
        base_url: 'https://gateway.api.globalfishingwatch.org/v3/events',
        body_params: {
          datasets: ['public-global-port-visits-events:v3.0'],
          endDate: '2025-12-07T23:59:59Z',
          geometry: {
            coordinates: [
              [
                [14.11, 55.26],
                [14.68, 55.27],
                [14.69, 55.11],
                [14.09, 55.08],
                [14.11, 55.26],
              ],
            ],
            type: 'Polygon',
          },
          startDate: '2025-12-01T00:00:00Z',
          vessels: ['22c7ca42d-df50-18b5-713a-a81e9115052c'],
        },
        method: 'POST',
        source: 'public-global-port-visits-events:v3.0',
        url_params: {
          limit: 1,
          offset: 0,
        },
      },
    ],
    config_hash:
      'c6d47bc157d41a2e4bb374be85ae2fff63ab79a26669398c69bfba174215b547',
  },
  context_layers: {
    EEZ: {
      dataset: 'public-eez-areas',
      version: 'v3',
      enrichments: [
        {
          id: '5674',
          label: 'Danish Exclusive Economic Zone',
        },
      ],
    },
    MPA: {
      dataset: 'public-mpa-all',
      version: 'v3',
      enrichments: [
        {
          id: '555790698',
          label: 'Rønne Banke - Special Protection Area (Birds Directive)',
        },
        {
          id: '555543143',
          label: 'Hvideodde Rev - Baltic Sea Protected Area (HELCOM)',
        },
        {
          id: '555522525',
          label:
            'Hvideodde Rev - Special Areas of Conservation (Habitats Directive)',
        },
      ],
    },
    RFMO: {
      dataset: 'public-rfmo',
      version: 'v3',
      enrichments: [
        {
          id: 'NASCO',
          label: 'NASCO',
        },
        {
          id: 'ACAP',
          label: 'ACAP',
        },
        {
          id: 'NAMMCO',
          label: 'NAMMCO',
        },
        {
          id: 'ICCAT',
          label: 'ICCAT',
        },
        {
          id: 'IWC',
          label: 'IWC',
        },
        {
          id: 'ICES',
          label: 'ICES',
        },
      ],
    },
  },
  distance_to_coast_km: 1.33,
  scoring: {
    triage_score: 4,
    uncertainty_score: 0.5,
    reason_codes: [
      'matched_to_public_ais',
      'near_coast',
      'inside_eez',
      'inside_mpa',
    ],
  },
  geom: {
    type: 'Point',
    coordinates: [14.68, 55.16],
  },
  rejected: false,
};

export const eventSchema_matched_with_port_event_confidence_2: any = {
  version: '1.0.0',
  event_id: '874df96e65c6dc650d39eb98943ce25e7b3a82173e88f29c404609050a85c02e',
  timestamp_utc: '2025-12-04T16:53:26Z',
  matched_flag: true,
  confidence_proxy: '2',
  lat: 55.16,
  lon: 14.68,
  source:
    'public-global-sar-presence:v3.0, public-global-port-visits-events:v3.0',
  raw_metadata: {
    callsign: 'OVDN',
    dataset: 'public-global-vessel-identity:v3.0',
    date: '2025-12-04 16:00',
    detections: 1,
    entryTimestamp: '2025-12-04T16:53:26Z',
    exitTimestamp: '2025-12-04T16:53:26Z',
    firstTransmissionDate: '2018-09-13T16:47:49Z',
    flag: 'DNK',
    geartype: 'OTHER',
    imo: '',
    lastTransmissionDate: '2026-03-21T13:10:14Z',
    lat: 55.16,
    lon: 14.680000305175781,
    mmsi: '219000217',
    shipName: 'HDMS SOELOEVEN',
    vesselId: '22c7ca42d-df50-18b5-713a-a81e9115052c',
    vesselType: 'OTHER',
  },
  raw_event_metadata: {
    start: '2025-12-05T12:06:41.000Z',
    end: '2025-12-06T12:08:08.000Z',
    id: 'efc1703a86346486d884cbd5fc5aab74',
    type: 'port_visit',
    position: {
      lat: 55.1155,
      lon: 14.6758,
    },
    regions: {
      mpa: ['555790698', '555543143', '555522525'],
      eez: ['5674'],
      rfmo: ['NASCO', 'ACAP', 'NAMMCO', 'ICCAT', 'IWC', 'ICES'],
      fao: ['27.3.d.24', '27.3.d', '27.3', '27'],
      majorFao: ['27'],
      eez12Nm: ['5674'],
      highSeas: [],
      mpaNoTakePartial: [],
      mpaNoTake: [],
    },
    boundingBox: [
      14.693334446163684, 55.105045722833694, 14.693334446163684,
      55.105045722833694,
    ],
    distances: {
      startDistanceFromShoreKm: 0,
      endDistanceFromShoreKm: 0,
      startDistanceFromPortKm: 0,
      endDistanceFromPortKm: 0,
    },
    vessel: {
      id: '22c7ca42d-df50-18b5-713a-a81e9115052c',
      name: 'HDMS SOELOEVEN',
      ssvid: '219000217',
      flag: 'DNK',
      type: 'other',
      nextPort: null,
    },
    port_visit: {
      visitId: '22efc11c118fb011f640e6328d54744f',
      confidence: '2',
      durationHrs: 24.024166666666666,
      startAnchorage: {
        anchorageId: '46551b1d',
        atDock: true,
        distanceFromShoreKm: '0',
        flag: 'DNK',
        id: 'dnk-roenne',
        lat: 55.105045722833694,
        lon: 14.693334446163684,
        name: 'ROENNE',
        topDestination: 'BAY LIGHTER',
      },
      intermediateAnchorage: {
        anchorageId: '46551b1d',
        atDock: true,
        distanceFromShoreKm: '0',
        flag: 'DNK',
        id: 'dnk-roenne',
        lat: 55.105045722833694,
        lon: 14.693334446163684,
        name: 'ROENNE',
        topDestination: 'BAY LIGHTER',
      },
      endAnchorage: {
        anchorageId: '46551b1d',
        atDock: true,
        distanceFromShoreKm: '0',
        flag: 'DNK',
        id: 'dnk-roenne',
        lat: 55.105045722833694,
        lon: 14.693334446163684,
        name: 'ROENNE',
        topDestination: 'BAY LIGHTER',
      },
    },
  },
  run_metadata: {
    code_version: 'dd74db4ef5f175802c660c4fc5879850cd02dd82',
    config_json: [
      {
        base_url:
          'https://gateway.api.globalfishingwatch.org/v3/4wings/report/',
        body_params: {
          geojson: {
            coordinates: [
              [
                [14.11, 55.26],
                [14.68, 55.27],
                [14.69, 55.11],
                [14.09, 55.08],
                [14.11, 55.26],
              ],
            ],
            type: 'Polygon',
          },
        },
        method: 'POST',
        source: 'public-global-sar-presence:v3.0',
        url_params: {
          'datasets[0]': 'public-global-sar-presence:v3.0',
          'date-range': '2025-12-01T00:00:00Z,2025-12-07T23:59:59Z',
          'filters[0]': '',
          format: 'JSON',
          'group-by': 'VESSEL_ID',
          'spatial-resolution': 'HIGH',
          'temporal-resolution': 'HOURLY',
        },
      },
      {
        base_url: 'https://gateway.api.globalfishingwatch.org/v3/events',
        body_params: {
          datasets: ['public-global-port-visits-events:v3.0'],
          endDate: '2025-12-07T23:59:59Z',
          geometry: {
            coordinates: [
              [
                [14.11, 55.26],
                [14.68, 55.27],
                [14.69, 55.11],
                [14.09, 55.08],
                [14.11, 55.26],
              ],
            ],
            type: 'Polygon',
          },
          startDate: '2025-12-01T00:00:00Z',
          vessels: ['22c7ca42d-df50-18b5-713a-a81e9115052c'],
        },
        method: 'POST',
        source: 'public-global-port-visits-events:v3.0',
        url_params: {
          limit: 1,
          offset: 0,
        },
      },
    ],
    config_hash:
      'c6d47bc157d41a2e4bb374be85ae2fff63ab79a26669398c69bfba174215b547',
  },
  context_layers: {
    EEZ: {
      dataset: 'public-eez-areas',
      version: 'v3',
      enrichments: [
        {
          id: '5674',
          label: 'Danish Exclusive Economic Zone',
        },
      ],
    },
    MPA: {
      dataset: 'public-mpa-all',
      version: 'v3',
      enrichments: [
        {
          id: '555790698',
          label: 'Rønne Banke - Special Protection Area (Birds Directive)',
        },
        {
          id: '555543143',
          label: 'Hvideodde Rev - Baltic Sea Protected Area (HELCOM)',
        },
        {
          id: '555522525',
          label:
            'Hvideodde Rev - Special Areas of Conservation (Habitats Directive)',
        },
      ],
    },
    RFMO: {
      dataset: 'public-rfmo',
      version: 'v3',
      enrichments: [
        {
          id: 'NASCO',
          label: 'NASCO',
        },
        {
          id: 'ACAP',
          label: 'ACAP',
        },
        {
          id: 'NAMMCO',
          label: 'NAMMCO',
        },
        {
          id: 'ICCAT',
          label: 'ICCAT',
        },
        {
          id: 'IWC',
          label: 'IWC',
        },
        {
          id: 'ICES',
          label: 'ICES',
        },
      ],
    },
  },
  distance_to_coast_km: 1.33,
  scoring: {
    triage_score: 0.5,
    uncertainty_score: 0.5,
    reason_codes: [
      'matched_to_public_ais',
      'near_coast',
      'inside_eez',
      'inside_mpa',
    ],
  },
  geom: {
    type: 'Point',
    coordinates: [14.68, 55.16],
  },
  rejected: false,
};

export const eventSchema_umatched_near_coast: any = {
  version: '1.0.0',
  event_id: 'umatchedee84562aa0d7b4a168e9f211771cb2b0f7b02398af7ef38e3f98ef04',
  timestamp_utc: '2025-12-04T16:53:26Z',
  matched_flag: false,
  confidence_proxy: null,
  lat: 36.1,
  lon: -5.43,
  source: 'public-global-sar-presence:v3.0',
  raw_metadata: {
    callsign: '',
    dataset: '',
    date: '2025-12-04 16:00',
    detections: 1,
    entryTimestamp: '2025-12-04T16:53:26Z',
    exitTimestamp: '2025-12-04T16:53:26Z',
    firstTransmissionDate: '',
    flag: '',
    geartype: '',
    imo: '',
    lastTransmissionDate: '',
    lat: 36.1,
    lon: -5.43,
    mmsi: '',
    shipName: '',
    vesselId: '',
    vesselType: '',
  },
  raw_event_metadata: null,
  run_metadata: {
    code_version: 'dd74db4ef5f175802c660c4fc5879850cd02dd82',
    config_json: [
      {
        base_url:
          'https://gateway.api.globalfishingwatch.org/v3/4wings/report/',
        body_params: {
          geojson: {
            coordinates: [
              [
                [14.11, 55.26],
                [14.68, 55.27],
                [14.69, 55.11],
                [14.09, 55.08],
                [14.11, 55.26],
              ],
            ],
            type: 'Polygon',
          },
        },
        method: 'POST',
        source: 'public-global-sar-presence:v3.0',
        url_params: {
          'datasets[0]': 'public-global-sar-presence:v3.0',
          'date-range': '2025-12-01T00:00:00Z,2025-12-07T23:59:59Z',
          'filters[0]': '',
          format: 'JSON',
          'group-by': 'VESSEL_ID',
          'spatial-resolution': 'HIGH',
          'temporal-resolution': 'HOURLY',
        },
      },
    ],
    config_hash:
      '1e9584ccfd82f114fda158e04431edd7188a905602984e70ced01f73d1f08689',
  },
  context_layers: {
    EEZ: {
      dataset: 'public-eez-areas',
      version: 'v3',
      enrichments: [],
    },
    MPA: {
      dataset: 'public-mpa-all',
      version: 'v3',
      enrichments: [],
    },
    RFMO: {
      dataset: 'public-rfmo',
      version: 'v3',
      enrichments: [],
    },
  },
  distance_to_coast_km: 4,
  scoring: {
    triage_score: null,
    uncertainty_score: null,
    reason_codes: [],
  },
  geom: {
    type: 'Point',
    coordinates: [14.21, 55.2],
  },
  rejected: false,
};

export const eventSchema_umatched_offshore: any = {
  version: '1.0.0',
  event_id: 'umatchedee84562aa0d7b4a168e9f211771cb2b0f7b02398af7ef38e3f98ef04',
  timestamp_utc: '2025-12-04T16:53:26Z',
  matched_flag: false,
  confidence_proxy: null,
  lat: 36.1,
  lon: -5.43,
  source: 'public-global-sar-presence:v3.0',
  raw_metadata: {
    callsign: '',
    dataset: '',
    date: '2025-12-04 16:00',
    detections: 1,
    entryTimestamp: '2025-12-04T16:53:26Z',
    exitTimestamp: '2025-12-04T16:53:26Z',
    firstTransmissionDate: '',
    flag: '',
    geartype: '',
    imo: '',
    lastTransmissionDate: '',
    lat: 36.1,
    lon: -5.43,
    mmsi: '',
    shipName: '',
    vesselId: '',
    vesselType: '',
  },
  raw_event_metadata: null,
  run_metadata: {
    code_version: 'dd74db4ef5f175802c660c4fc5879850cd02dd82',
    config_json: [
      {
        base_url:
          'https://gateway.api.globalfishingwatch.org/v3/4wings/report/',
        body_params: {
          geojson: {
            coordinates: [
              [
                [14.11, 55.26],
                [14.68, 55.27],
                [14.69, 55.11],
                [14.09, 55.08],
                [14.11, 55.26],
              ],
            ],
            type: 'Polygon',
          },
        },
        method: 'POST',
        source: 'public-global-sar-presence:v3.0',
        url_params: {
          'datasets[0]': 'public-global-sar-presence:v3.0',
          'date-range': '2025-12-01T00:00:00Z,2025-12-07T23:59:59Z',
          'filters[0]': '',
          format: 'JSON',
          'group-by': 'VESSEL_ID',
          'spatial-resolution': 'HIGH',
          'temporal-resolution': 'HOURLY',
        },
      },
    ],
    config_hash:
      '1e9584ccfd82f114fda158e04431edd7188a905602984e70ced01f73d1f08689',
  },
  context_layers: {
    EEZ: {
      dataset: 'public-eez-areas',
      version: 'v3',
      enrichments: [],
    },
    MPA: {
      dataset: 'public-mpa-all',
      version: 'v3',
      enrichments: [],
    },
    RFMO: {
      dataset: 'public-rfmo',
      version: 'v3',
      enrichments: [],
    },
  },
  distance_to_coast_km: 40,
  scoring: {
    triage_score: null,
    uncertainty_score: null,
    reason_codes: [],
  },
  geom: {
    type: 'Point',
    coordinates: [14.21, 55.2],
  },
  rejected: false,
};

export const eventSchema_matched_without_port_event: any = {
  version: '1.0.0',
  event_id: 'b8a1dba64ba8f546e5ae181413c6dcf0001fa7bd6dcfcc90c03b546f07e74abd',
  timestamp_utc: '2025-12-01T05:16:55Z',
  matched_flag: true,
  confidence_proxy: null,
  lat: 55.25,
  lon: 14.3,
  source:
    'public-global-sar-presence:v3.0, public-global-port-visits-events:v3.0',
  raw_metadata: {
    callsign: 'OJSH',
    dataset: 'public-global-vessel-identity:v3.0',
    date: '2025-12-01 05:00',
    detections: 1,
    entryTimestamp: '2025-12-01T05:16:55Z',
    exitTimestamp: '2025-12-01T05:16:55Z',
    firstTransmissionDate: '2018-02-22T09:07:06Z',
    flag: 'FIN',
    geartype: 'CARGO',
    imo: '9194282',
    lastTransmissionDate: '2026-03-24T23:55:15Z',
    lat: 55.25,
    lon: 14.300000190734863,
    mmsi: '230673000',
    shipName: 'PRIMA QUEEN',
    vesselId: '3b60c55c1-15dd-0f53-dfd5-edb954370ccb',
    vesselType: 'CARGO',
  },
  raw_event_metadata: null,
  run_metadata: {
    code_version: 'dd74db4ef5f175802c660c4fc5879850cd02dd82',
    config_json: [
      {
        base_url:
          'https://gateway.api.globalfishingwatch.org/v3/4wings/report/',
        body_params: {
          geojson: {
            coordinates: [
              [
                [14.11, 55.26],
                [14.68, 55.27],
                [14.69, 55.11],
                [14.09, 55.08],
                [14.11, 55.26],
              ],
            ],
            type: 'Polygon',
          },
        },
        method: 'POST',
        source: 'public-global-sar-presence:v3.0',
        url_params: {
          'datasets[0]': 'public-global-sar-presence:v3.0',
          'date-range': '2025-12-01T00:00:00Z,2025-12-07T23:59:59Z',
          'filters[0]': '',
          format: 'JSON',
          'group-by': 'VESSEL_ID',
          'spatial-resolution': 'HIGH',
          'temporal-resolution': 'HOURLY',
        },
      },
      {
        base_url: 'https://gateway.api.globalfishingwatch.org/v3/events',
        body_params: {
          datasets: ['public-global-port-visits-events:v3.0'],
          endDate: '2025-12-07T23:59:59Z',
          geometry: {
            coordinates: [
              [
                [14.11, 55.26],
                [14.68, 55.27],
                [14.69, 55.11],
                [14.09, 55.08],
                [14.11, 55.26],
              ],
            ],
            type: 'Polygon',
          },
          startDate: '2025-12-01T00:00:00Z',
          vessels: ['3b60c55c1-15dd-0f53-dfd5-edb954370ccb'],
        },
        method: 'POST',
        source: 'public-global-port-visits-events:v3.0',
        url_params: {
          limit: 1,
          offset: 0,
        },
      },
    ],
    config_hash:
      '3027b6de80f3e47fc1722f258f502d4aeccbc9064884d37dbaff54f07bd48d74',
  },
  context_layers: {
    EEZ: {
      dataset: 'public-eez-areas',
      version: 'v3',
      enrichments: [],
    },
    MPA: {
      dataset: 'public-mpa-all',
      version: 'v3',
      enrichments: [],
    },
    RFMO: {
      dataset: 'public-rfmo',
      version: 'v3',
      enrichments: [],
    },
  },
  distance_to_coast_km: 17.37,
  scoring: {
    triage_score: null,
    uncertainty_score: 0.5,
    reason_codes: ['matched_to_public_ais', 'missing_confidence_proxy'],
  },
  geom: {
    type: 'Point',
    coordinates: [14.3, 55.25],
  },
  rejected: false,
};

export const eventSchema_onLand: IEventSchema = {
  version: '1',
  event_id: '9df5159668a60e1d2dbda76f92f3e2a3f7b2877b7ed18459a3946d2cf3fcfd88',
  timestamp_utc: '2025-12-04T16:53:26Z',
  matched_flag: false,
  hotspot_cell_id: 'test',
  context_layers: {
    EEZ: {
      dataset: EContextLayerDatasets.eez,
      version: 'v3',
      enrichments: [],
    },
    MPA: {
      dataset: EContextLayerDatasets.mpa,
      version: 'v3',
      enrichments: [],
    },
    Bathymetry: {
      dataset: EContextLayerDatasets.bathymetry,
      version: 'v3',
      enrichments: [],
    }
  },
  rejected: false,
  distance_to_coast_km: 2,
  confidence_proxy: null,
  lat: 52.52,
  lon: 13.405,
  source: 'public-global-sar-presence:v3.0',
  raw_metadata: {
    callsign: '',
    dataset: '',
    date: '2025-12-04 16:00',
    detections: 1,
    entryTimestamp: '2025-12-04T16:53:26Z',
    exitTimestamp: '2025-12-04T16:53:26Z',
    firstTransmissionDate: '',
    flag: '',
    geartype: '',
    imo: '',
    lastTransmissionDate: '',
    lat: 52.52,
    lon: 13.405,
    mmsi: '',
    shipName: '',
    vesselId: '',
    vesselType: '',
  },
  raw_event_metadata: null,
  run_metadata: {
    code_version: '1',
    config_json: [
      {
        base_url:
          'https://gateway.api.globalfishingwatch.org/v3/4wings/report/',
        body_params: {
          geojson: {
            coordinates: [
              [
                [14.11, 55.26],
                [14.68, 55.27],
                [14.69, 55.11],
                [14.09, 55.08],
                [14.11, 55.26],
              ],
            ],
            type: 'Polygon',
          },
        },
        method: EFetchMethods.post,
        source: 'public-global-sar-presence:v3.0',
        url_params: {
          'datasets[0]': 'public-global-sar-presence:v3.0',
          'date-range': '2025-12-04T00:00:00Z,2025-12-06T23:59:59Z',
          format: 'JSON',
          'group-by': 'VESSEL_ID',
          'spatial-resolution': 'HIGH',
          'temporal-resolution': 'HOURLY',
        },
      },
    ],
    config_hash:
      '200c829623828d1ccfc22ca22713112ed80c3c32b40002201cd647ac99872506',
  },
  scoring: {
    triage_score: 1,
    uncertainty_score: 0.2,
    reason_codes: [EReasonCodesStatic.unmatched_to_public_ais],
  },
  geom: {
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
};

export const eventSchema_inWater: IEventSchema = {
  version: '1.0.0',
  hotspot_cell_id: 'test',
  event_id: '0255652b698fcd8a5ea84bd2808999a95855b243e3bb646a48994d801fa56b16',
  timestamp_utc: '2025-12-07T17:17:24Z',
  matched_flag: false,
  confidence_proxy: null,
  lat: 55.19,
  lon: 6.639999866485596,
  source: 'public-global-sar-presence:v3.0',
  raw_metadata: {
    callsign: '',
    dataset: '',
    date: '2025-12-07 17:00',
    detections: 1,
    entryTimestamp: '2025-12-07T17:17:24Z',
    exitTimestamp: '2025-12-07T17:18:14Z',
    firstTransmissionDate: '',
    flag: '',
    geartype: '',
    imo: '',
    lastTransmissionDate: '',
    lat: 55.19,
    lon: 6.639999866485596,
    mmsi: '',
    shipName: '',
    vesselId: '',
    vesselType: '',
  },
  raw_event_metadata: null,
  run_metadata: {
    code_version: 'dd74db4ef5f175802c660c4fc5879850cd02dd82',
    config_json: [
      {
        base_url:
          'https://gateway.api.globalfishingwatch.org/v3/4wings/report/',
        body_params: {
          geojson: {
            coordinates: [
              [
                [14.11, 55.26],
                [14.68, 55.27],
                [14.69, 55.11],
                [14.09, 55.08],
                [14.11, 55.26],
              ],
            ],
            type: 'Polygon',
          },
        },
        method: EFetchMethods.post,
        source: 'public-global-sar-presence:v3.0',
        url_params: {
          'datasets[0]': 'public-global-sar-presence:v3.0',
          'date-range': '2025-12-07T00:00:00Z,2025-12-07T23:59:59Z',
          'filters[0]': "matched='false'",
          format: 'JSON',
          'group-by': 'VESSEL_ID',
          'spatial-resolution': 'HIGH',
          'temporal-resolution': 'HOURLY',
        },
      },
    ],
    config_hash:
      'eda7be49553768acc660b9bd6a10be10a6ee481493359ac78ded17d315ce9145',
  },
  context_layers: {
    EEZ: {
      dataset: EContextLayerDatasets.eez,
      version: 'v3',
      enrichments: [],
    },
    MPA: {
      dataset: EContextLayerDatasets.mpa,
      version: 'v3',
      enrichments: [],
    },
    Bathymetry: {
      dataset: EContextLayerDatasets.bathymetry,
      version: 'v3',
      enrichments: [],
    }
  },
  distance_to_coast_km: 2,
  scoring: {
    triage_score: null,
    uncertainty_score: 0.5,
    reason_codes: [
      'missing_required_field:dataset',
      'missing_required_field:vesselId',
      'missing_required_field:mmsi',
      'missing_required_field:shipName',
      'missing_required_field:vesselType',
    ],
  },
  geom: {
    type: 'Point',
    coordinates: [6.639999866485596, 55.19],
  },
  rejected: false,
};

export const eventSchema_matched_no_date: any = {
  version: 1,
  event_id: 'f1d1c217a627d08e035daba502d2ce66b9c873f1b138d0fb070eecf43cd6565c',
  timestamp_utc: '',
  matched_flag: true,
  confidence_proxy: '4',
  lat: 55.16,
  lon: 14.680000305175781,
  source:
    'public-global-sar-presence:v3.0, public-global-port-visits-events:v3.0',
  raw_metadata: {
    callsign: 'OVDN',
    dataset: 'public-global-vessel-identity:v3.0',
    date: '',
    detections: 1,
    entryTimestamp: '',
    exitTimestamp: '',
    firstTransmissionDate: '2018-09-13T16:47:49Z',
    flag: 'DNK',
    geartype: 'OTHER',
    imo: '',
    lastTransmissionDate: '2026-02-11T17:57:20Z',
    lat: 55.16,
    lon: 14.680000305175781,
    mmsi: '219000217',
    shipName: 'HDMS SOELOEVEN',
    vesselId: '22c7ca42d-df50-18b5-713a-a81e9115052c',
    vesselType: 'OTHER',
  },
  raw_event_metadata: {
    start: '2025-12-05T12:06:41.000Z',
    end: '2025-12-06T12:08:08.000Z',
    id: 'efc1703a86346486d884cbd5fc5aab74',
    type: 'port_visit',
    position: {
      lat: 55.1155,
      lon: 14.6758,
    },
    regions: {
      mpa: ['555790698', '555543143', '555522525'],
      eez: ['5674'],
      fao: ['27.3.d.24', '27.3.d', '27.3', '27'],
      majorFao: ['27'],
      eez12Nm: ['5674'],
      highSeas: [],
      mpaNoTakePartial: [],
      mpaNoTake: [],
    },
    boundingBox: [
      14.693334446163684, 55.105045722833694, 14.693334446163684,
      55.105045722833694,
    ],
    distances: {
      startDistanceFromShoreKm: 0,
      endDistanceFromShoreKm: 0,
      startDistanceFromPortKm: 0,
      endDistanceFromPortKm: 0,
    },
    vessel: {
      id: '22c7ca42d-df50-18b5-713a-a81e9115052c',
      name: 'HDMS SOELOEVEN',
      ssvid: '219000217',
      flag: 'DNK',
      type: 'other',
      nextPort: null,
    },
    port_visit: {
      visitId: '22efc11c118fb011f640e6328d54744f',
      confidence: '4',
      durationHrs: 24.024166666666666,
      startAnchorage: {
        anchorageId: '46551b1d',
        atDock: true,
        distanceFromShoreKm: '0',
        flag: 'DNK',
        id: 'dnk-roenne',
        lat: 55.105045722833694,
        lon: 14.693334446163684,
        name: 'ROENNE',
        topDestination: 'BAY LIGHTER',
      },
      intermediateAnchorage: {
        anchorageId: '46551b1d',
        atDock: true,
        distanceFromShoreKm: '0',
        flag: 'DNK',
        id: 'dnk-roenne',
        lat: 55.105045722833694,
        lon: 14.693334446163684,
        name: 'ROENNE',
        topDestination: 'BAY LIGHTER',
      },
      endAnchorage: {
        anchorageId: '46551b1d',
        atDock: true,
        distanceFromShoreKm: '0',
        flag: 'DNK',
        id: 'dnk-roenne',
        lat: 55.105045722833694,
        lon: 14.693334446163684,
        name: 'ROENNE',
        topDestination: 'BAY LIGHTER',
      },
    },
  },
  run_metadata: {
    code_version: '1',
    config_json: [
      {
        base_url:
          'https://gateway.api.globalfishingwatch.org/v3/4wings/report/',
        body_params: {
          geojson: {
            coordinates: [
              [
                [14.11, 55.26],
                [14.68, 55.27],
                [14.69, 55.11],
                [14.09, 55.08],
                [14.11, 55.26],
              ],
            ],
            type: 'Polygon',
          },
        },
        method: 'POST',
        source: 'public-global-sar-presence:v3.0',
        url_params: {
          'datasets[0]': 'public-global-sar-presence:v3.0',
          'date-range': '2025-12-04T00:00:00Z,2025-12-06T23:59:59Z',
          format: 'JSON',
          'group-by': 'VESSEL_ID',
          'spatial-resolution': 'HIGH',
          'temporal-resolution': 'HOURLY',
        },
      },
      {
        base_url: 'https://gateway.api.globalfishingwatch.org/v3/events',
        body_params: {
          datasets: ['public-global-port-visits-events:v3.0'],
          endDate: '2025-12-06T23:59:59Z',
          geometry: {
            coordinates: [
              [
                [14.11, 55.26],
                [14.68, 55.27],
                [14.69, 55.11],
                [14.09, 55.08],
                [14.11, 55.26],
              ],
            ],
            type: 'Polygon',
          },
          startDate: '2025-12-04T00:00:00Z',
          vessels: ['22c7ca42d-df50-18b5-713a-a81e9115052c'],
        },
        method: 'POST',
        source: 'public-global-port-visits-events:v3.0',
        url_params: {
          limit: 2,
          offset: 0,
        },
      },
    ],
    config_hash:
      'e922ae1622d458cd3caca42a1b76c6196a091e455793c324d709dc72dd15bf6e',
  },
  scoring: {
    triage_score: '4',
    uncertainty_score: 0.5,
    reason_codes: ['near_coast', 'inside_eez', 'inside_mpa'],
  },
  "context_layers": {
    "EEZ": {
      "dataset": "World_EEZ_20231025_LR",
      "version": "v12",
      "enrichments": [
        {
          "id": "5694",
          "label": "Swedish Exclusive Economic Zone"
        }
      ]
    },
    "MPA": {
      "dataset": "WDPA_WDOECM_APR2026",
      "version": "v1.6",
      "enrichments": []
    }
  },
  geom: {
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
};

export const eventSchema_matched_no_coord: any = {
  version: 1,
  event_id: 'Nod1c217a627d08e035daba502d2ce66b9c873f1b138d0fb070eecf43cd6565c',
  timestamp_utc: '',
  matched_flag: true,
  confidence_proxy: '4',
  lat: NaN,
  lon: undefined,
  source:
    'public-global-sar-presence:v3.0, public-global-port-visits-events:v3.0',
  raw_metadata: {
    callsign: 'OVDN',
    dataset: 'public-global-vessel-identity:v3.0',
    date: '2025-12-04 16:00',
    detections: 1,
    entryTimestamp: '',
    exitTimestamp: '',
    firstTransmissionDate: '2018-09-13T16:47:49Z',
    flag: 'DNK',
    geartype: 'OTHER',
    imo: '',
    lastTransmissionDate: '2026-02-11T17:57:20Z',
    lat: NaN,
    lon: undefined,
    mmsi: '219000217',
    shipName: 'HDMS SOELOEVEN',
    vesselId: '22c7ca42d-df50-18b5-713a-a81e9115052c',
    vesselType: 'OTHER',
  },
  raw_event_metadata: {
    start: '2025-12-05T12:06:41.000Z',
    end: '2025-12-06T12:08:08.000Z',
    id: 'efc1703a86346486d884cbd5fc5aab74',
    type: 'port_visit',
    position: {
      lat: NaN,
      lon: undefined,
    },
    regions: {
      mpa: ['555790698', '555543143', '555522525'],
      eez: ['5674'],
      rfmo: ['NASCO', 'ACAP', 'NAMMCO', 'ICCAT', 'IWC', 'ICES'],
      fao: ['27.3.d.24', '27.3.d', '27.3', '27'],
      majorFao: ['27'],
      eez12Nm: ['5674'],
      highSeas: [],
      mpaNoTakePartial: [],
      mpaNoTake: [],
    },
    boundingBox: [
      14.693334446163684, 55.105045722833694, 14.693334446163684,
      55.105045722833694,
    ],
    distances: {
      startDistanceFromShoreKm: 0,
      endDistanceFromShoreKm: 0,
      startDistanceFromPortKm: 0,
      endDistanceFromPortKm: 0,
    },
    vessel: {
      id: '22c7ca42d-df50-18b5-713a-a81e9115052c',
      name: 'HDMS SOELOEVEN',
      ssvid: '219000217',
      flag: 'DNK',
      type: 'other',
      nextPort: null,
    },
    port_visit: {
      visitId: '22efc11c118fb011f640e6328d54744f',
      confidence: '4',
      durationHrs: 24.024166666666666,
      startAnchorage: {
        anchorageId: '46551b1d',
        atDock: true,
        distanceFromShoreKm: '0',
        flag: 'DNK',
        id: 'dnk-roenne',
        lat: 55.105045722833694,
        lon: 14.693334446163684,
        name: 'ROENNE',
        topDestination: 'BAY LIGHTER',
      },
      intermediateAnchorage: {
        anchorageId: '46551b1d',
        atDock: true,
        distanceFromShoreKm: '0',
        flag: 'DNK',
        id: 'dnk-roenne',
        lat: 55.105045722833694,
        lon: 14.693334446163684,
        name: 'ROENNE',
        topDestination: 'BAY LIGHTER',
      },
      endAnchorage: {
        anchorageId: '46551b1d',
        atDock: true,
        distanceFromShoreKm: '0',
        flag: 'DNK',
        id: 'dnk-roenne',
        lat: 55.105045722833694,
        lon: 14.693334446163684,
        name: 'ROENNE',
        topDestination: 'BAY LIGHTER',
      },
    },
  },
  run_metadata: {
    code_version: '1',
    config_json: [
      {
        base_url:
          'https://gateway.api.globalfishingwatch.org/v3/4wings/report/',
        body_params: {
          geojson: {
            coordinates: [
              [
                [14.11, 55.26],
                [14.68, 55.27],
                [14.69, 55.11],
                [14.09, 55.08],
                [14.11, 55.26],
              ],
            ],
            type: 'Polygon',
          },
        },
        method: 'POST',
        source: 'public-global-sar-presence:v3.0',
        url_params: {
          'datasets[0]': 'public-global-sar-presence:v3.0',
          'date-range': '2025-12-04T00:00:00Z,2025-12-06T23:59:59Z',
          format: 'JSON',
          'group-by': 'VESSEL_ID',
          'spatial-resolution': 'HIGH',
          'temporal-resolution': 'HOURLY',
        },
      },
      {
        base_url: 'https://gateway.api.globalfishingwatch.org/v3/events',
        body_params: {
          datasets: ['public-global-port-visits-events:v3.0'],
          endDate: '2025-12-06T23:59:59Z',
          geometry: {
            coordinates: [
              [
                [14.11, 55.26],
                [14.68, 55.27],
                [14.69, 55.11],
                [14.09, 55.08],
                [14.11, 55.26],
              ],
            ],
            type: 'Polygon',
          },
          startDate: '2025-12-04T00:00:00Z',
          vessels: ['22c7ca42d-df50-18b5-713a-a81e9115052c'],
        },
        method: 'POST',
        source: 'public-global-port-visits-events:v3.0',
        url_params: {
          limit: 2,
          offset: 0,
        },
      },
    ],
    config_hash:
      'e922ae1622d458cd3caca42a1b76c6196a091e455793c324d709dc72dd15bf6e',
  },
  scoring: {
    triage_score: '4',
    uncertainty_score: 0.5,
    reason_codes: ['near_coast', 'inside_eez', 'inside_mpa'],
  },
  geom: {
    type: 'Point',
    coordinates: [[[NaN, undefined]]],
  },
  "context_layers": {
    "EEZ": {
      "dataset": "World_EEZ_20231025_LR",
      "version": "v12",
      "enrichments": [
        {
          "id": "5694",
          "label": "Swedish Exclusive Economic Zone"
        }
      ]
    },
    "MPA": {
      "dataset": "WDPA_WDOECM_APR2026",
      "version": "v1.6",
      "enrichments": []
    }
  }
};

export const eventSchema_matched_noisy: any = {
  version: 1,
  event_id: 'Nois217a627d08e035daba502d2ce66b9c873f1b138d0fb070eecf43cd6565c',
  timestamp_utc: '',
  matched_flag: true,
  confidence_proxy: '4',
  lat: NaN,
  lon: undefined,
  source:
    'public-global-sar-presence:v3.0, public-global-port-visits-events:v3.0',
  raw_metadata: {
    callsign: '',
    dataset: '',
    date: '',
    detections: 1,
    entryTimestamp: '',
    exitTimestamp: '',
    firstTransmissionDate: '',
    flag: '',
    geartype: '',
    imo: '',
    lastTransmissionDate: '',
    lat: NaN,
    lon: undefined,
    mmsi: '',
    shipName: '',
    vesselId: '22c7ca42d-df50-18b5-713a-a81e9115052c',
    vesselType: '',
  },
  raw_event_metadata: {
    start: '2025-12-05T12:06:41.000Z',
    end: '2025-12-06T12:08:08.000Z',
    id: 'efc1703a86346486d884cbd5fc5aab74',
    type: 'port_visit',
    position: {
      lat: NaN,
      lon: undefined,
    },
    regions: {
      mpa: ['555790698', '555543143', '555522525'],
      eez: ['5674'],
      rfmo: ['NASCO', 'ACAP', 'NAMMCO', 'ICCAT', 'IWC', 'ICES'],
      fao: ['27.3.d.24', '27.3.d', '27.3', '27'],
      majorFao: ['27'],
      eez12Nm: ['5674'],
      highSeas: [],
      mpaNoTakePartial: [],
      mpaNoTake: [],
    },
    boundingBox: [
      14.693334446163684, 55.105045722833694, 14.693334446163684,
      55.105045722833694,
    ],
    distances: {
      startDistanceFromShoreKm: 0,
      endDistanceFromShoreKm: 0,
      startDistanceFromPortKm: 0,
      endDistanceFromPortKm: 0,
    },
    vessel: {
      id: '22c7ca42d-df50-18b5-713a-a81e9115052c',
      name: 'HDMS SOELOEVEN',
      ssvid: '219000217',
      flag: 'DNK',
      type: 'other',
      nextPort: null,
    },
    port_visit: {
      visitId: '22efc11c118fb011f640e6328d54744f',
      confidence: '4',
      durationHrs: 24.024166666666666,
      startAnchorage: {
        anchorageId: '46551b1d',
        atDock: true,
        distanceFromShoreKm: '0',
        flag: 'DNK',
        id: 'dnk-roenne',
        lat: 55.105045722833694,
        lon: 14.693334446163684,
        name: 'ROENNE',
        topDestination: 'BAY LIGHTER',
      },
      intermediateAnchorage: {
        anchorageId: '46551b1d',
        atDock: true,
        distanceFromShoreKm: '0',
        flag: 'DNK',
        id: 'dnk-roenne',
        lat: 55.105045722833694,
        lon: 14.693334446163684,
        name: 'ROENNE',
        topDestination: 'BAY LIGHTER',
      },
      endAnchorage: {
        anchorageId: '46551b1d',
        atDock: true,
        distanceFromShoreKm: '0',
        flag: 'DNK',
        id: 'dnk-roenne',
        lat: 55.105045722833694,
        lon: 14.693334446163684,
        name: 'ROENNE',
        topDestination: 'BAY LIGHTER',
      },
    },
  },
  run_metadata: {
    code_version: '1',
    config_json: [
      {
        base_url:
          'https://gateway.api.globalfishingwatch.org/v3/4wings/report/',
        body_params: {
          geojson: {
            coordinates: [
              [
                [14.11, 55.26],
                [14.68, 55.27],
                [14.69, 55.11],
                [14.09, 55.08],
                [14.11, 55.26],
              ],
            ],
            type: 'Polygon',
          },
        },
        method: 'POST',
        source: 'public-global-sar-presence:v3.0',
        url_params: {
          'datasets[0]': 'public-global-sar-presence:v3.0',
          'date-range': '2025-12-04T00:00:00Z,2025-12-06T23:59:59Z',
          format: 'JSON',
          'group-by': 'VESSEL_ID',
          'spatial-resolution': 'HIGH',
          'temporal-resolution': 'HOURLY',
        },
      },
      {
        base_url: 'https://gateway.api.globalfishingwatch.org/v3/events',
        body_params: {
          datasets: ['public-global-port-visits-events:v3.0'],
          endDate: '2025-12-06T23:59:59Z',
          geometry: {
            coordinates: [
              [
                [14.11, 55.26],
                [14.68, 55.27],
                [14.69, 55.11],
                [14.09, 55.08],
                [14.11, 55.26],
              ],
            ],
            type: 'Polygon',
          },
          startDate: '2025-12-04T00:00:00Z',
          vessels: ['22c7ca42d-df50-18b5-713a-a81e9115052c'],
        },
        method: 'POST',
        source: 'public-global-port-visits-events:v3.0',
        url_params: {
          limit: 2,
          offset: 0,
        },
      },
    ],
    config_hash:
      'e922ae1622d458cd3caca42a1b76c6196a091e455793c324d709dc72dd15bf6e',
  },
  scoring: {
    triage_score: '4',
    uncertainty_score: 0.5,
    reason_codes: ['near_coast', 'inside_eez', 'inside_mpa'],
  },
  geom: {
    type: 'Point',
    coordinates: [[[NaN, undefined]]],
  },
  "context_layers": {
    "EEZ": {
      "dataset": "World_EEZ_20231025_LR",
      "version": "v12",
      "enrichments": [
        {
          "id": "5694",
          "label": "Swedish Exclusive Economic Zone"
        }
      ]
    },
    "MPA": {
      "dataset": "WDPA_WDOECM_APR2026",
      "version": "v1.6",
      "enrichments": []
    }
  }
};
