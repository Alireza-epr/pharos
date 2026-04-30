import {
  EReasonCodesStatic,
  EContextLayerDatasets,
  EFetchMethods,
} from '@packages/enum';
import { IEventSchema } from '@packages/types';
import { api4wingsEntry_unmatched_detections_2, api4wingsEntry_unmatched_detections_5 } from './gfwResponse';

export const eventSchema_matched_near_coast: any = {
  version: '1.0.0',
  event_id: '8b35a44cabf925956bbb3fd2d03dce7feba0803f20317a01ff0a7c4cab9b6917',
  timestamp_utc: '2025-12-04T16:53:26Z',
  matched_flag: true,
  confidence_proxy: null,
  lat: 55.16,
  lon: 14.68,
  source: 'public-global-sar-presence:v3.0',
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
    lastTransmissionDate: '2026-04-26T23:57:50Z',
    lat: 55.16,
    lon: 14.680000305175781,
    mmsi: '219000217',
    shipName: 'HDMS SOELOEVEN',
    vesselId: '22c7ca42d-df50-18b5-713a-a81e9115052c',
    vesselType: 'OTHER',
  },
  raw_event_metadata: null,
  run_metadata: {
    code_version: '0a4b6e2b67fce410fa9b74082c4592968530777a',
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
      dataset: 'World_EEZ_20231025_LR',
      version: 'v12',
      enrichments: [
        {
          id: '5674',
          label: 'Danish Exclusive Economic Zone',
        },
      ],
    },
    MPA: {
      dataset: 'WDPA_WDOECM_APR2026',
      version: 'v1.6',
      enrichments: [],
    },
    Bathymetry: {
      dataset: 'gebco_2025_sub_ice_topo',
      version: 'v2.7',
      enrichments: [
        {
          value: '-22',
        },
      ],
    },
  },
  distance_to_coast_km: 1.33,
  scoring: {
    triage_score: 0.81,
    uncertainty_score: 0.3,
    reason_codes: [
      'matched_to_public_ais',
      'missing_confidence_proxy',
      'inside_eez',
      'near_coast',
      'bathymetry_shallow_eez_hotspot',
    ],
  },
  geom: {
    type: 'Point',
    coordinates: [14.68, 55.16],
  },
  rejected: false,
  hotspot_cell_id: '851f2a73fffffff',
};

export const eventSchema_matched_offshore: any = {
  version: '1.0.0',
  event_id: '54d99f1c17540ebe23100c98f066874a995f872b89af136244a63dfd61cd799d',
  timestamp_utc: '2025-12-04T16:53:26Z',
  matched_flag: true,
  confidence_proxy: null,
  lat: 55.15,
  lon: 14.22,
  source: 'public-global-sar-presence:v3.0',
  raw_metadata: {
    callsign: '5LYK8',
    dataset: 'public-global-vessel-identity:v3.0',
    date: '2025-12-04 16:00',
    detections: 1,
    entryTimestamp: '2025-12-04T16:53:26Z',
    exitTimestamp: '2025-12-04T16:53:26Z',
    firstTransmissionDate: '2025-10-31T03:06:26Z',
    flag: 'LBR',
    geartype: 'OTHER',
    imo: '9312860',
    lastTransmissionDate: '2026-04-26T16:25:07Z',
    lat: 55.15,
    lon: 14.220000267028809,
    mmsi: '636025638',
    shipName: 'IONIAN SUN',
    vesselId: 'ee20f2f54-4c41-ce6c-ce45-fa136fb6e2cc',
    vesselType: 'OTHER',
  },
  raw_event_metadata: null,
  run_metadata: {
    code_version: '0a4b6e2b67fce410fa9b74082c4592968530777a',
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
      dataset: 'World_EEZ_20231025_LR',
      version: 'v12',
      enrichments: [
        {
          id: '5694',
          label: 'Swedish Exclusive Economic Zone',
        },
      ],
    },
    MPA: {
      dataset: 'WDPA_WDOECM_APR2026',
      version: 'v1.6',
      enrichments: [],
    },
    Bathymetry: {
      dataset: 'gebco_2025_sub_ice_topo',
      version: 'v2.7',
      enrichments: [
        {
          value: '-45',
        },
      ],
    },
  },
  distance_to_coast_km: 26.66,
  scoring: {
    triage_score: 0.51,
    uncertainty_score: 0.3,
    reason_codes: [
      'matched_to_public_ais',
      'missing_confidence_proxy',
      'inside_eez',
      'bathymetry_shallow_eez_hotspot',
    ],
  },
  geom: {
    type: 'Point',
    coordinates: [14.22, 55.15],
  },
  rejected: false,
  hotspot_cell_id: '851f2a43fffffff',
};

export const eventSchema_umatched_near_coast: any = {
  version: '1.0.0',
  event_id: '7390cf5147f56551c7412d33f3f15d1fce66e1c9e4ab7f4a6ad5ad8783197aa0',
  timestamp_utc: '2025-01-11T05:17:01Z',
  matched_flag: false,
  confidence_proxy: null,
  lat: 55.15,
  lon: 14.65,
  source: 'public-global-sar-presence:v3.0',
  raw_metadata: {
    callsign: '',
    dataset: '',
    date: '2025-10-05 16:00',
    detections: 1,
    entryTimestamp: '2025-01-11T05:17:01Z',
    exitTimestamp: '2025-12-16T16:53:25Z',
    firstTransmissionDate: '',
    flag: '',
    geartype: '',
    imo: '',
    lastTransmissionDate: '',
    lat: 55.15,
    lon: 14.649999618530273,
    mmsi: '',
    shipName: '',
    vesselId: '',
    vesselType: '',
  },
  raw_event_metadata: null,
  run_metadata: {
    code_version: '0a4b6e2b67fce410fa9b74082c4592968530777a',
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
          'date-range': '2025-01-01T00:00:00Z,2025-12-31T23:59:59Z',
          'filters[0]': "matched='false'",
          format: 'JSON',
          'group-by': 'VESSEL_ID',
          'spatial-resolution': 'HIGH',
          'temporal-resolution': 'HOURLY',
        },
      },
    ],
    config_hash:
      'bf605830646075562f3e85e76491e7ab402a3191183ffe3aa8af3fd71df110f9',
  },
  context_layers: {
    EEZ: {
      dataset: 'World_EEZ_20231025_LR',
      version: 'v12',
      enrichments: [
        {
          id: '5674',
          label: 'Danish Exclusive Economic Zone',
        },
      ],
    },
    MPA: {
      dataset: 'WDPA_WDOECM_APR2026',
      version: 'v1.6',
      enrichments: [],
    },
    Bathymetry: {
      dataset: 'gebco_2025_sub_ice_topo',
      version: 'v2.7',
      enrichments: [
        {
          value: '-32',
        },
      ],
    },
  },
  distance_to_coast_km: 3.16,
  scoring: {
    triage_score: 0.86,
    uncertainty_score: 0.55,
    reason_codes: [
      'unmatched_to_public_ais',
      'missing_confidence_proxy',
      'inside_eez',
      'near_coast',
      'bathymetry_shallow_eez_hotspot',
    ],
  },
  geom: {
    type: 'Point',
    coordinates: [14.65, 55.15],
  },
  rejected: false,
  hotspot_cell_id: '851f2a73fffffff',
};

export const eventSchema_umatched_offshore: any = {
  version: '1.0.0',
  event_id: '9bd3f94290db69e316fab0ac360687b6259898cbd1d58877b3f82abc145b78af',
  timestamp_utc: '2025-01-11T05:17:01Z',
  matched_flag: false,
  confidence_proxy: null,
  lat: 55.24,
  lon: 14.25,
  source: 'public-global-sar-presence:v3.0',
  raw_metadata: {
    callsign: '',
    dataset: '',
    date: '2025-05-28 05:00',
    detections: 1,
    entryTimestamp: '2025-01-11T05:17:01Z',
    exitTimestamp: '2025-12-16T16:53:25Z',
    firstTransmissionDate: '',
    flag: '',
    geartype: '',
    imo: '',
    lastTransmissionDate: '',
    lat: 55.24,
    lon: 14.25,
    mmsi: '',
    shipName: '',
    vesselId: '',
    vesselType: '',
  },
  raw_event_metadata: null,
  run_metadata: {
    code_version: '0a4b6e2b67fce410fa9b74082c4592968530777a',
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
          'date-range': '2025-01-01T00:00:00Z,2025-12-31T23:59:59Z',
          'filters[0]': "matched='false'",
          format: 'JSON',
          'group-by': 'VESSEL_ID',
          'spatial-resolution': 'HIGH',
          'temporal-resolution': 'HOURLY',
        },
      },
    ],
    config_hash:
      'bf605830646075562f3e85e76491e7ab402a3191183ffe3aa8af3fd71df110f9',
  },
  context_layers: {
    EEZ: {
      dataset: 'World_EEZ_20231025_LR',
      version: 'v12',
      enrichments: [
        {
          id: '5694',
          label: 'Swedish Exclusive Economic Zone',
        },
      ],
    },
    MPA: {
      dataset: 'WDPA_WDOECM_APR2026',
      version: 'v1.6',
      enrichments: [],
    },
    Bathymetry: {
      dataset: 'gebco_2025_sub_ice_topo',
      version: 'v2.7',
      enrichments: [
        {
          value: '-27',
        },
      ],
    },
  },
  distance_to_coast_km: 17.32,
  scoring: {
    triage_score: 0.56,
    uncertainty_score: 0.55,
    reason_codes: [
      'unmatched_to_public_ais',
      'missing_confidence_proxy',
      'inside_eez',
      'bathymetry_shallow_eez_hotspot',
    ],
  },
  geom: {
    type: 'Point',
    coordinates: [14.25, 55.24],
  },
  rejected: false,
  hotspot_cell_id: '851f2a57fffffff',
};

export const eventSchema_onLand: any = {
  ...eventSchema_umatched_near_coast,
  lat: 52.52,
  lon: 13.405,
};

export const eventSchema_inWater: any = {
  ...eventSchema_umatched_near_coast,
  lat: 55.19,
  lon: 6.639999866485596,
};

export const eventSchema_matched_no_date: any = {
  ...eventSchema_matched_near_coast,
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
};

export const eventSchema_matched_no_coord: any = {
  ...eventSchema_matched_near_coast,
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
    lat: NaN,
    lon: undefined,
    mmsi: '219000217',
    shipName: 'HDMS SOELOEVEN',
    vesselId: '22c7ca42d-df50-18b5-713a-a81e9115052c',
    vesselType: 'OTHER',
  },
};

export const eventSchema_matched_noisy: IEventSchema = {
  ...eventSchema_matched_near_coast,
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
};

export const eventSchema_context_layers: IEventSchema = {
  ...eventSchema_umatched_near_coast,
  context_layers: {
    EEZ: {
      dataset: 'World_EEZ_20231025_LR',
      version: 'v12',
      enrichments: [
        {
          id: '5674',
          label: 'Danish Exclusive Economic Zone',
        },
      ],
    },
    MPA: {
      dataset: 'WDPA_WDOECM_APR2026',
      version: 'v1.6',
      enrichments: [
        {
          id: '555774273',
          label: 'I',
        },
      ],
    },
    Bathymetry: {
      dataset: 'gebco_2025_sub_ice_topo',
      version: 'v2.7',
      enrichments: [
        {
          value: '-43',
        },
      ],
    },
  },
};

export const eventSchema_with_low_confidence: IEventSchema = {
  ...eventSchema_umatched_near_coast,
  raw_metadata: {
    ...api4wingsEntry_unmatched_detections_2
  },
};

export const eventSchema_with_high_confidence: IEventSchema = {
  ...eventSchema_umatched_near_coast,
  raw_metadata: {
    ...api4wingsEntry_unmatched_detections_5
  },
};
