export const eventSchema_matched_with_port_event = {
  version: 1,
  event_id: 'f1d1c217a627d08e035daba502d2ce66b9c873f1b138d0fb070eecf43cd6565c',
  timestamp_utc: '2025-12-04T16:53:26Z',
  matched_flag: true,
  confidence_fields: '4',
  lat: 55.16,
  lon: 14.680000305175781,
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

export const eventSchema_umatched = {
  version: 1,
  event_id: '9df5159668a60e1d2dbda76f92f3e2a3f7b2877b7ed18459a3946d2cf3fcfd88',
  timestamp_utc: '2025-12-04T16:53:26Z',
  matched_flag: false,
  confidence_fields: null,
  lat: 55.2,
  lon: 14.210000038146973,
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
    lat: 55.2,
    lon: 14.210000038146973,
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
    ],
    config_hash:
      '200c829623828d1ccfc22ca22713112ed80c3c32b40002201cd647ac99872506',
  },
  scoring: {
    triage_score: 1,
    uncertainty_score: 0.2,
    reason_codes: ['unmatched_detection'],
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

export const eventSchema_matched_without__port_event = {
  version: 1,
  event_id: 'd11cf5e415439de7a2f98464d5cae268a15034df8b0bf2328ddd6720de765163',
  timestamp_utc: '2025-12-04T16:53:26Z',
  matched_flag: true,
  confidence_fields: null,
  lat: 55.16,
  lon: 14.170000076293945,
  source:
    'public-global-sar-presence:v3.0, public-global-port-visits-events:v3.0',
  raw_metadata: {
    callsign: 'DFXF',
    dataset: 'public-global-vessel-identity:v3.0',
    date: '2025-12-04 16:00',
    detections: 1,
    entryTimestamp: '2025-12-04T16:53:26Z',
    exitTimestamp: '2025-12-04T16:53:26Z',
    firstTransmissionDate: '2014-07-30T09:19:45Z',
    flag: 'DEU',
    geartype: 'CARGO',
    imo: '9196254',
    lastTransmissionDate: '2026-03-01T22:59:15Z',
    lat: 55.16,
    lon: 14.170000076293945,
    mmsi: '218797000',
    shipName: 'VAERMLAND',
    vesselId: 'b867aac71-181e-e3fb-ef3b-1267b81caedc',
    vesselType: 'CARGO',
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
          vessels: ['b867aac71-181e-e3fb-ef3b-1267b81caedc'],
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
      '3f28d0575493b121fa8d8e3dfd5f31b51f95c85fd412278de8240c614ff64f35',
  },
  scoring: {
    triage_score: 1,
    uncertainty_score: 0.2,
    reason_codes: [],
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
