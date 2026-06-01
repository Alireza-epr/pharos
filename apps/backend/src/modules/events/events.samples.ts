export const samples: any = [
  {
    confidence_proxy: null,
    confidence_tier: 'low',
    context_layers: {
      Bathymetry: {
        dataset: 'gebco_2025_sub_ice_topo',
        enrichments: [
          {
            value: '-44',
          },
        ],
        version: 'v2.7',
      },
      EEZ: {
        dataset: 'World_EEZ_20231025_LR',
        enrichments: [
          {
            id: '5694',
            label: 'Swedish Exclusive Economic Zone',
          },
        ],
        version: 'v12',
      },
      MPA: {
        dataset: 'WDPA_WDOECM_APR2026',
        enrichments: [],
        version: 'v1.6',
      },
    },
    distance_to_coast_km: 17.37,
    event_id:
      '745b06c4138f2180fb642f38b6d7c63b95edec6d894d5b4984099ce232fdc129',
    geom: {
      coordinates: [14.3, 55.25],
      type: 'Point',
    },
    hotspot: {
      cell_id: '851f2a47fffffff',
      signals: {
        hotspot_strength: 'low',
        recurrence_count: 0,
        time_bins_with_unmatched: 0,
      },
    },
    lat: 55.25,
    lon: 14.3,
    matched_flag: true,
    raw_event_metadata: null,
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
      lastTransmissionDate: '2026-05-25T23:59:51Z',
      lat: 55.25,
      lon: 14.300000190734863,
      mmsi: '230673000',
      shipName: 'PRIMA QUEEN',
      vesselId: '3b60c55c1-15dd-0f53-dfd5-edb954370ccb',
      vesselType: 'CARGO',
    },
    rejected: false,
    run_metadata: {
      code_version: 'e923951c6a16f2332176b6545f29620788346b0d',
      config_hash:
        '8b0569ecd6c44178b2b4b373317e6181f3836bda30756a2d214817f7da4e3ce5',
      config_json: [
        {
          URL: 'https://gateway.api.globalfishingwatch.org/v3/4wings/report/',
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
          hotspot: {
            resolution: 5,
            timeBin: 'HOURLY',
          },
          method: 'POST',
          output: 'data/out/',
          sort: [
            {
              direction: 'asc',
              sortBy: 'timestamp_utc',
            },
            {
              direction: 'asc',
              sortBy: 'event_id',
            },
          ],
          threshold: {
            deep_water_threshold: -200,
            high_triage_score_threshold: 0.85,
            low_confidence_proxy_threshold: 2,
            low_triage_score_threshold: 0.3,
            medium_triage_score_threshold: 0.6,
            near_coast_threshold: 10,
            shallow_water_threshold: -50,
          },
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
    },
    scoring: {
      reason_codes: [
        'bathymetry_cargo_anomaly_zone',
        'bathymetry_shallow_eez_hotspot',
        'inside_eez',
        'low_confidence_tier',
        'matched_to_public_ais',
        'missing_confidence_proxy',
      ],
      triage_score: 0.73,
      uncertainty_score: 0.38,
    },
    source: 'public-global-vessel-identity:v3.0',
    timestamp_utc: '2025-12-01T05:00:00Z',
    version: '1.0.0',
  },
  {
    confidence_proxy: null,
    confidence_tier: 'low',
    context_layers: {
      Bathymetry: {
        dataset: 'gebco_2025_sub_ice_topo',
        enrichments: [
          {
            value: '-46',
          },
        ],
        version: 'v2.7',
      },
      EEZ: {
        dataset: 'World_EEZ_20231025_LR',
        enrichments: [
          {
            id: '5694',
            label: 'Swedish Exclusive Economic Zone',
          },
        ],
        version: 'v12',
      },
      MPA: {
        dataset: 'WDPA_WDOECM_APR2026',
        enrichments: [],
        version: 'v1.6',
      },
    },
    distance_to_coast_km: 30.83,
    event_id:
      '97ce71fec35ea516723c7bd7821bf40f9e4d1763c5027afe649da6a5600d4a23',
    geom: {
      coordinates: [14.13, 55.11],
      type: 'Point',
    },
    hotspot: {
      cell_id: '851f2a4ffffffff',
      signals: {
        hotspot_strength: 'low',
        recurrence_count: 0,
        time_bins_with_unmatched: 0,
      },
    },
    lat: 55.11,
    lon: 14.13,
    matched_flag: true,
    raw_event_metadata: null,
    raw_metadata: {
      callsign: '5BZP4',
      dataset: 'public-global-vessel-identity:v3.0',
      date: '2025-12-01 05:00',
      detections: 1,
      entryTimestamp: '2025-12-01T05:16:55Z',
      exitTimestamp: '2025-12-01T05:16:55Z',
      firstTransmissionDate: '2018-05-13T10:53:46Z',
      flag: 'CYP',
      geartype: 'OTHER',
      imo: '9504035',
      lastTransmissionDate: '2026-05-25T23:59:56Z',
      lat: 55.11,
      lon: 14.130000114440918,
      mmsi: '209276000',
      shipName: 'ELBWAVE',
      vesselId: '846cb1608-81e6-54d7-c0b8-4bee06ce3f5c',
      vesselType: 'OTHER',
    },
    rejected: false,
    run_metadata: {
      code_version: 'e923951c6a16f2332176b6545f29620788346b0d',
      config_hash:
        '8b0569ecd6c44178b2b4b373317e6181f3836bda30756a2d214817f7da4e3ce5',
      config_json: [
        {
          URL: 'https://gateway.api.globalfishingwatch.org/v3/4wings/report/',
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
          hotspot: {
            resolution: 5,
            timeBin: 'HOURLY',
          },
          method: 'POST',
          output: 'data/out/',
          sort: [
            {
              direction: 'asc',
              sortBy: 'timestamp_utc',
            },
            {
              direction: 'asc',
              sortBy: 'event_id',
            },
          ],
          threshold: {
            deep_water_threshold: -200,
            high_triage_score_threshold: 0.85,
            low_confidence_proxy_threshold: 2,
            low_triage_score_threshold: 0.3,
            medium_triage_score_threshold: 0.6,
            near_coast_threshold: 10,
            shallow_water_threshold: -50,
          },
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
    },
    scoring: {
      reason_codes: [
        'bathymetry_shallow_eez_hotspot',
        'inside_eez',
        'low_confidence_tier',
        'matched_to_public_ais',
        'missing_confidence_proxy',
      ],
      triage_score: 0.53,
      uncertainty_score: 0.38,
    },
    source: 'public-global-vessel-identity:v3.0',
    timestamp_utc: '2025-12-01T05:00:00Z',
    version: '1.0.0',
  },
  {
    confidence_proxy: null,
    confidence_tier: 'low',
    context_layers: {
      Bathymetry: {
        dataset: 'gebco_2025_sub_ice_topo',
        enrichments: [
          {
            value: '-44',
          },
        ],
        version: 'v2.7',
      },
      EEZ: {
        dataset: 'World_EEZ_20231025_LR',
        enrichments: [
          {
            id: '5694',
            label: 'Swedish Exclusive Economic Zone',
          },
        ],
        version: 'v12',
      },
      MPA: {
        dataset: 'WDPA_WDOECM_APR2026',
        enrichments: [],
        version: 'v1.6',
      },
    },
    distance_to_coast_km: 23.19,
    event_id:
      'a89c06c52f16f09098bdb2edf1a5d9e48b69580ff0dd69f44fecb1208f48ef99',
    geom: {
      coordinates: [14.2, 55.18],
      type: 'Point',
    },
    hotspot: {
      cell_id: '851f2a43fffffff',
      signals: {
        hotspot_strength: 'low',
        recurrence_count: 1,
        time_bins_with_unmatched: 1,
      },
    },
    lat: 55.18,
    lon: 14.2,
    matched_flag: true,
    raw_event_metadata: null,
    raw_metadata: {
      callsign: '5BDH6',
      dataset: 'public-global-vessel-identity:v3.0',
      date: '2025-12-01 05:00',
      detections: 1,
      entryTimestamp: '2025-12-01T05:16:55Z',
      exitTimestamp: '2025-12-01T05:16:55Z',
      firstTransmissionDate: '2022-12-01T16:05:01Z',
      flag: 'CYP',
      geartype: 'CARGO',
      imo: '9136204',
      lastTransmissionDate: '2026-05-25T23:59:54Z',
      lat: 55.18,
      lon: 14.199999809265137,
      mmsi: '210549000',
      shipName: 'RIX SPIRIT',
      vesselId: '3ce0a8aef-f01b-80eb-68bd-a1ba0c6c12c8',
      vesselType: 'CARGO',
    },
    rejected: false,
    run_metadata: {
      code_version: 'e923951c6a16f2332176b6545f29620788346b0d',
      config_hash:
        '8b0569ecd6c44178b2b4b373317e6181f3836bda30756a2d214817f7da4e3ce5',
      config_json: [
        {
          URL: 'https://gateway.api.globalfishingwatch.org/v3/4wings/report/',
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
          hotspot: {
            resolution: 5,
            timeBin: 'HOURLY',
          },
          method: 'POST',
          output: 'data/out/',
          sort: [
            {
              direction: 'asc',
              sortBy: 'timestamp_utc',
            },
            {
              direction: 'asc',
              sortBy: 'event_id',
            },
          ],
          threshold: {
            deep_water_threshold: -200,
            high_triage_score_threshold: 0.85,
            low_confidence_proxy_threshold: 2,
            low_triage_score_threshold: 0.3,
            medium_triage_score_threshold: 0.6,
            near_coast_threshold: 10,
            shallow_water_threshold: -50,
          },
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
    },
    scoring: {
      reason_codes: [
        'bathymetry_cargo_anomaly_zone',
        'bathymetry_shallow_eez_hotspot',
        'inside_eez',
        'low_confidence_tier',
        'matched_to_public_ais',
        'missing_confidence_proxy',
      ],
      triage_score: 0.73,
      uncertainty_score: 0.38,
    },
    source: 'public-global-vessel-identity:v3.0',
    timestamp_utc: '2025-12-01T05:00:00Z',
    version: '1.0.0',
  },
  {
    confidence_proxy: null,
    confidence_tier: 'low',
    context_layers: {
      Bathymetry: {
        dataset: 'gebco_2025_sub_ice_topo',
        enrichments: [
          {
            value: '-36',
          },
        ],
        version: 'v2.7',
      },
      EEZ: {
        dataset: 'World_EEZ_20231025_LR',
        enrichments: [
          {
            id: '5694',
            label: 'Swedish Exclusive Economic Zone',
          },
        ],
        version: 'v12',
      },
      MPA: {
        dataset: 'WDPA_WDOECM_APR2026',
        enrichments: [],
        version: 'v1.6',
      },
    },
    distance_to_coast_km: 16.38,
    event_id:
      'b9ca5ed29a15b3a42caf251949422858a3531124c58497c05c97d7ecb6e863fd',
    geom: {
      coordinates: [14.13, 55.24],
      type: 'Point',
    },
    hotspot: {
      cell_id: '851f2a43fffffff',
      signals: {
        hotspot_strength: 'low',
        recurrence_count: 1,
        time_bins_with_unmatched: 1,
      },
    },
    lat: 55.24,
    lon: 14.13,
    matched_flag: true,
    raw_event_metadata: null,
    raw_metadata: {
      callsign: 'PBVF',
      dataset: 'public-global-vessel-identity:v3.0',
      date: '2025-12-01 05:00',
      detections: 1,
      entryTimestamp: '2025-12-01T05:16:55Z',
      exitTimestamp: '2025-12-01T05:16:55Z',
      firstTransmissionDate: '2012-01-05T12:01:37Z',
      flag: 'NLD',
      geartype: 'CARGO',
      imo: '9508794',
      lastTransmissionDate: '2026-05-25T23:59:57Z',
      lat: 55.24,
      lon: 14.130000114440918,
      mmsi: '246629000',
      shipName: 'AMELAND',
      vesselId: '59242eddd-d20a-05f3-f8c1-65aa83466888',
      vesselType: 'CARGO',
    },
    rejected: false,
    run_metadata: {
      code_version: 'e923951c6a16f2332176b6545f29620788346b0d',
      config_hash:
        '8b0569ecd6c44178b2b4b373317e6181f3836bda30756a2d214817f7da4e3ce5',
      config_json: [
        {
          URL: 'https://gateway.api.globalfishingwatch.org/v3/4wings/report/',
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
          hotspot: {
            resolution: 5,
            timeBin: 'HOURLY',
          },
          method: 'POST',
          output: 'data/out/',
          sort: [
            {
              direction: 'asc',
              sortBy: 'timestamp_utc',
            },
            {
              direction: 'asc',
              sortBy: 'event_id',
            },
          ],
          threshold: {
            deep_water_threshold: -200,
            high_triage_score_threshold: 0.85,
            low_confidence_proxy_threshold: 2,
            low_triage_score_threshold: 0.3,
            medium_triage_score_threshold: 0.6,
            near_coast_threshold: 10,
            shallow_water_threshold: -50,
          },
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
    },
    scoring: {
      reason_codes: [
        'bathymetry_cargo_anomaly_zone',
        'bathymetry_shallow_eez_hotspot',
        'inside_eez',
        'low_confidence_tier',
        'matched_to_public_ais',
        'missing_confidence_proxy',
      ],
      triage_score: 0.73,
      uncertainty_score: 0.38,
    },
    source: 'public-global-vessel-identity:v3.0',
    timestamp_utc: '2025-12-01T05:00:00Z',
    version: '1.0.0',
  },
  {
    confidence_proxy: null,
    confidence_tier: 'low',
    context_layers: {
      Bathymetry: {
        dataset: 'gebco_2025_sub_ice_topo',
        enrichments: [
          {
            value: '-43',
          },
        ],
        version: 'v2.7',
      },
      EEZ: {
        dataset: 'World_EEZ_20231025_LR',
        enrichments: [
          {
            id: '5674',
            label: 'Danish Exclusive Economic Zone',
          },
        ],
        version: 'v12',
      },
      MPA: {
        dataset: 'WDPA_WDOECM_APR2026',
        enrichments: [],
        version: 'v1.6',
      },
    },
    distance_to_coast_km: 19.31,
    event_id:
      'bf8d2baf8bc9e7edd6b5c17e27d4fcc16c5045f1dd13e8db4b5574d75601e2e0',
    geom: {
      coordinates: [14.4, 55.21],
      type: 'Point',
    },
    hotspot: {
      cell_id: '851f2a47fffffff',
      signals: {
        hotspot_strength: 'low',
        recurrence_count: 0,
        time_bins_with_unmatched: 0,
      },
    },
    lat: 55.21,
    lon: 14.4,
    matched_flag: true,
    raw_event_metadata: null,
    raw_metadata: {
      callsign: 'V7A3517',
      dataset: 'public-global-vessel-identity:v3.0',
      date: '2025-12-01 05:00',
      detections: 1,
      entryTimestamp: '2025-12-01T05:16:55Z',
      exitTimestamp: '2025-12-01T05:16:55Z',
      firstTransmissionDate: '2025-07-08T07:12:12Z',
      flag: 'MHL',
      geartype: 'CARGO',
      imo: '9743215',
      lastTransmissionDate: '2026-05-25T23:59:37Z',
      lat: 55.21,
      lon: 14.399999618530273,
      mmsi: '538011815',
      shipName: 'EUGENIA B',
      vesselId: '4d30bebfa-abbd-6e47-fbab-4f04b7cf5616',
      vesselType: 'CARGO',
    },
    rejected: false,
    run_metadata: {
      code_version: 'e923951c6a16f2332176b6545f29620788346b0d',
      config_hash:
        '8b0569ecd6c44178b2b4b373317e6181f3836bda30756a2d214817f7da4e3ce5',
      config_json: [
        {
          URL: 'https://gateway.api.globalfishingwatch.org/v3/4wings/report/',
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
          hotspot: {
            resolution: 5,
            timeBin: 'HOURLY',
          },
          method: 'POST',
          output: 'data/out/',
          sort: [
            {
              direction: 'asc',
              sortBy: 'timestamp_utc',
            },
            {
              direction: 'asc',
              sortBy: 'event_id',
            },
          ],
          threshold: {
            deep_water_threshold: -200,
            high_triage_score_threshold: 0.85,
            low_confidence_proxy_threshold: 2,
            low_triage_score_threshold: 0.3,
            medium_triage_score_threshold: 0.6,
            near_coast_threshold: 10,
            shallow_water_threshold: -50,
          },
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
    },
    scoring: {
      reason_codes: [
        'bathymetry_cargo_anomaly_zone',
        'bathymetry_shallow_eez_hotspot',
        'inside_eez',
        'low_confidence_tier',
        'matched_to_public_ais',
        'missing_confidence_proxy',
      ],
      triage_score: 0.73,
      uncertainty_score: 0.38,
    },
    source: 'public-global-vessel-identity:v3.0',
    timestamp_utc: '2025-12-01T05:00:00Z',
    version: '1.0.0',
  },
  {
    confidence_proxy: null,
    confidence_tier: 'low',
    context_layers: {
      Bathymetry: {
        dataset: 'gebco_2025_sub_ice_topo',
        enrichments: [
          {
            value: '-44',
          },
        ],
        version: 'v2.7',
      },
      EEZ: {
        dataset: 'World_EEZ_20231025_LR',
        enrichments: [
          {
            id: '5694',
            label: 'Swedish Exclusive Economic Zone',
          },
        ],
        version: 'v12',
      },
      MPA: {
        dataset: 'WDPA_WDOECM_APR2026',
        enrichments: [],
        version: 'v1.6',
      },
    },
    distance_to_coast_km: 25.27,
    event_id:
      '332c6c887fbb43fb761bb09ad686ff369790d862e30e24fa74f184e4ac279b59',
    geom: {
      coordinates: [14.17, 55.16],
      type: 'Point',
    },
    hotspot: {
      cell_id: '851f2a43fffffff',
      signals: {
        hotspot_strength: 'low',
        recurrence_count: 1,
        time_bins_with_unmatched: 1,
      },
    },
    lat: 55.16,
    lon: 14.17,
    matched_flag: true,
    raw_event_metadata: null,
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
      lastTransmissionDate: '2026-05-25T23:59:47Z',
      lat: 55.16,
      lon: 14.170000076293945,
      mmsi: '218797000',
      shipName: 'VAERMLAND',
      vesselId: 'b867aac71-181e-e3fb-ef3b-1267b81caedc',
      vesselType: 'CARGO',
    },
    rejected: false,
    run_metadata: {
      code_version: 'e923951c6a16f2332176b6545f29620788346b0d',
      config_hash:
        '8b0569ecd6c44178b2b4b373317e6181f3836bda30756a2d214817f7da4e3ce5',
      config_json: [
        {
          URL: 'https://gateway.api.globalfishingwatch.org/v3/4wings/report/',
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
          hotspot: {
            resolution: 5,
            timeBin: 'HOURLY',
          },
          method: 'POST',
          output: 'data/out/',
          sort: [
            {
              direction: 'asc',
              sortBy: 'timestamp_utc',
            },
            {
              direction: 'asc',
              sortBy: 'event_id',
            },
          ],
          threshold: {
            deep_water_threshold: -200,
            high_triage_score_threshold: 0.85,
            low_confidence_proxy_threshold: 2,
            low_triage_score_threshold: 0.3,
            medium_triage_score_threshold: 0.6,
            near_coast_threshold: 10,
            shallow_water_threshold: -50,
          },
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
    },
    scoring: {
      reason_codes: [
        'bathymetry_cargo_anomaly_zone',
        'bathymetry_shallow_eez_hotspot',
        'inside_eez',
        'low_confidence_tier',
        'matched_to_public_ais',
        'missing_confidence_proxy',
      ],
      triage_score: 0.73,
      uncertainty_score: 0.38,
    },
    source: 'public-global-vessel-identity:v3.0',
    timestamp_utc: '2025-12-04T16:00:00Z',
    version: '1.0.0',
  },
  {
    confidence_proxy: null,
    confidence_tier: 'low',
    context_layers: {
      Bathymetry: {
        dataset: 'gebco_2025_sub_ice_topo',
        enrichments: [
          {
            value: '-44',
          },
        ],
        version: 'v2.7',
      },
      EEZ: {
        dataset: 'World_EEZ_20231025_LR',
        enrichments: [
          {
            id: '5694',
            label: 'Swedish Exclusive Economic Zone',
          },
        ],
        version: 'v12',
      },
      MPA: {
        dataset: 'WDPA_WDOECM_APR2026',
        enrichments: [],
        version: 'v1.6',
      },
    },
    distance_to_coast_km: 25.28,
    event_id:
      '5e301cf33d4f21ba6727e27763a2e74abee90609540497ef0cd4658cbd34d6a2',
    geom: {
      coordinates: [14.11, 55.16],
      type: 'Point',
    },
    hotspot: {
      cell_id: '851f2a43fffffff',
      signals: {
        hotspot_strength: 'low',
        recurrence_count: 1,
        time_bins_with_unmatched: 1,
      },
    },
    lat: 55.16,
    lon: 14.11,
    matched_flag: true,
    raw_event_metadata: null,
    raw_metadata: {
      callsign: '8PXO8',
      dataset: 'public-global-vessel-identity:v3.0',
      date: '2025-12-04 16:00',
      detections: 1,
      entryTimestamp: '2025-12-04T16:53:26Z',
      exitTimestamp: '2025-12-04T16:53:26Z',
      firstTransmissionDate: '2024-03-20T02:01:54Z',
      flag: 'BRB',
      geartype: 'OTHER',
      imo: '9298662',
      lastTransmissionDate: '2026-05-25T23:58:03Z',
      lat: 55.16,
      lon: 14.109999656677246,
      mmsi: '314842000',
      shipName: 'MULE',
      vesselId: 'de435d0f3-306c-2869-d119-fff03a975f8f',
      vesselType: 'OTHER',
    },
    rejected: false,
    run_metadata: {
      code_version: 'e923951c6a16f2332176b6545f29620788346b0d',
      config_hash:
        '8b0569ecd6c44178b2b4b373317e6181f3836bda30756a2d214817f7da4e3ce5',
      config_json: [
        {
          URL: 'https://gateway.api.globalfishingwatch.org/v3/4wings/report/',
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
          hotspot: {
            resolution: 5,
            timeBin: 'HOURLY',
          },
          method: 'POST',
          output: 'data/out/',
          sort: [
            {
              direction: 'asc',
              sortBy: 'timestamp_utc',
            },
            {
              direction: 'asc',
              sortBy: 'event_id',
            },
          ],
          threshold: {
            deep_water_threshold: -200,
            high_triage_score_threshold: 0.85,
            low_confidence_proxy_threshold: 2,
            low_triage_score_threshold: 0.3,
            medium_triage_score_threshold: 0.6,
            near_coast_threshold: 10,
            shallow_water_threshold: -50,
          },
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
    },
    scoring: {
      reason_codes: [
        'bathymetry_shallow_eez_hotspot',
        'inside_eez',
        'low_confidence_tier',
        'matched_to_public_ais',
        'missing_confidence_proxy',
      ],
      triage_score: 0.53,
      uncertainty_score: 0.38,
    },
    source: 'public-global-vessel-identity:v3.0',
    timestamp_utc: '2025-12-04T16:00:00Z',
    version: '1.0.0',
  },
  {
    confidence_proxy: null,
    confidence_tier: 'low',
    context_layers: {
      Bathymetry: {
        dataset: 'gebco_2025_sub_ice_topo',
        enrichments: [
          {
            value: '-43',
          },
        ],
        version: 'v2.7',
      },
      EEZ: {
        dataset: 'World_EEZ_20231025_LR',
        enrichments: [
          {
            id: '5694',
            label: 'Swedish Exclusive Economic Zone',
          },
        ],
        version: 'v12',
      },
      MPA: {
        dataset: 'WDPA_WDOECM_APR2026',
        enrichments: [],
        version: 'v1.6',
      },
    },
    distance_to_coast_km: 21.07,
    event_id:
      '8295ccc8a648afefb4588b3127cc520c62001bcaa875d5735b47b758ce6a95bd',
    geom: {
      coordinates: [14.21, 55.2],
      type: 'Point',
    },
    hotspot: {
      cell_id: '851f2a43fffffff',
      signals: {
        hotspot_strength: 'low',
        recurrence_count: 1,
        time_bins_with_unmatched: 1,
      },
    },
    lat: 55.2,
    lon: 14.21,
    matched_flag: false,
    raw_event_metadata: null,
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
    rejected: false,
    run_metadata: {
      code_version: 'e923951c6a16f2332176b6545f29620788346b0d',
      config_hash:
        '8b0569ecd6c44178b2b4b373317e6181f3836bda30756a2d214817f7da4e3ce5',
      config_json: [
        {
          URL: 'https://gateway.api.globalfishingwatch.org/v3/4wings/report/',
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
          hotspot: {
            resolution: 5,
            timeBin: 'HOURLY',
          },
          method: 'POST',
          output: 'data/out/',
          sort: [
            {
              direction: 'asc',
              sortBy: 'timestamp_utc',
            },
            {
              direction: 'asc',
              sortBy: 'event_id',
            },
          ],
          threshold: {
            deep_water_threshold: -200,
            high_triage_score_threshold: 0.85,
            low_confidence_proxy_threshold: 2,
            low_triage_score_threshold: 0.3,
            medium_triage_score_threshold: 0.6,
            near_coast_threshold: 10,
            shallow_water_threshold: -50,
          },
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
    },
    scoring: {
      reason_codes: [
        'bathymetry_shallow_eez_hotspot',
        'inside_eez',
        'low_confidence_tier',
        'missing_confidence_proxy',
        'unmatched_to_public_ais',
      ],
      triage_score: 0.58,
      uncertainty_score: 0.63,
    },
    source: 'public-global-sar-presence:v3.0',
    timestamp_utc: '2025-12-04T16:00:00Z',
    version: '1.0.0',
  },
  {
    confidence_proxy: null,
    confidence_tier: 'low',
    context_layers: {
      Bathymetry: {
        dataset: 'gebco_2025_sub_ice_topo',
        enrichments: [
          {
            value: '-22',
          },
        ],
        version: 'v2.7',
      },
      EEZ: {
        dataset: 'World_EEZ_20231025_LR',
        enrichments: [
          {
            id: '5674',
            label: 'Danish Exclusive Economic Zone',
          },
        ],
        version: 'v12',
      },
      MPA: {
        dataset: 'WDPA_WDOECM_APR2026',
        enrichments: [],
        version: 'v1.6',
      },
    },
    distance_to_coast_km: 1.33,
    event_id:
      'cbbf5b2f2035f0eb692c96f9b3adc06f95a96d49ea718e967e191333feca863b',
    geom: {
      coordinates: [14.68, 55.16],
      type: 'Point',
    },
    hotspot: {
      cell_id: '851f2a73fffffff',
      signals: {
        hotspot_strength: 'low',
        recurrence_count: 0,
        time_bins_with_unmatched: 0,
      },
    },
    lat: 55.16,
    lon: 14.68,
    matched_flag: true,
    raw_event_metadata: null,
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
      lastTransmissionDate: '2026-05-07T21:48:16Z',
      lat: 55.16,
      lon: 14.680000305175781,
      mmsi: '219000217',
      shipName: 'HDMS SOELOEVEN',
      vesselId: '22c7ca42d-df50-18b5-713a-a81e9115052c',
      vesselType: 'OTHER',
    },
    rejected: false,
    run_metadata: {
      code_version: 'e923951c6a16f2332176b6545f29620788346b0d',
      config_hash:
        '8b0569ecd6c44178b2b4b373317e6181f3836bda30756a2d214817f7da4e3ce5',
      config_json: [
        {
          URL: 'https://gateway.api.globalfishingwatch.org/v3/4wings/report/',
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
          hotspot: {
            resolution: 5,
            timeBin: 'HOURLY',
          },
          method: 'POST',
          output: 'data/out/',
          sort: [
            {
              direction: 'asc',
              sortBy: 'timestamp_utc',
            },
            {
              direction: 'asc',
              sortBy: 'event_id',
            },
          ],
          threshold: {
            deep_water_threshold: -200,
            high_triage_score_threshold: 0.85,
            low_confidence_proxy_threshold: 2,
            low_triage_score_threshold: 0.3,
            medium_triage_score_threshold: 0.6,
            near_coast_threshold: 10,
            shallow_water_threshold: -50,
          },
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
    },
    scoring: {
      reason_codes: [
        'bathymetry_shallow_eez_hotspot',
        'inside_eez',
        'low_confidence_tier',
        'matched_to_public_ais',
        'missing_confidence_proxy',
        'near_coast',
      ],
      triage_score: 0.83,
      uncertainty_score: 0.38,
    },
    source: 'public-global-vessel-identity:v3.0',
    timestamp_utc: '2025-12-04T16:00:00Z',
    version: '1.0.0',
  },
  {
    confidence_proxy: null,
    confidence_tier: 'low',
    context_layers: {
      Bathymetry: {
        dataset: 'gebco_2025_sub_ice_topo',
        enrichments: [
          {
            value: '-44',
          },
        ],
        version: 'v2.7',
      },
      EEZ: {
        dataset: 'World_EEZ_20231025_LR',
        enrichments: [
          {
            id: '5694',
            label: 'Swedish Exclusive Economic Zone',
          },
        ],
        version: 'v12',
      },
      MPA: {
        dataset: 'WDPA_WDOECM_APR2026',
        enrichments: [],
        version: 'v1.6',
      },
    },
    distance_to_coast_km: 22.53,
    event_id:
      'd4461c9a171a5a60e73cdef504c3a60eeece0b54df8bc402821520e244d3caa2',
    geom: {
      coordinates: [14.24, 55.19],
      type: 'Point',
    },
    hotspot: {
      cell_id: '851f2a47fffffff',
      signals: {
        hotspot_strength: 'low',
        recurrence_count: 0,
        time_bins_with_unmatched: 0,
      },
    },
    lat: 55.19,
    lon: 14.24,
    matched_flag: true,
    raw_event_metadata: null,
    raw_metadata: {
      callsign: 'OXPQ2',
      dataset: 'public-global-vessel-identity:v3.0',
      date: '2025-12-04 16:00',
      detections: 1,
      entryTimestamp: '2025-12-04T16:53:26Z',
      exitTimestamp: '2025-12-04T16:53:26Z',
      firstTransmissionDate: '2018-05-17T13:01:39Z',
      flag: 'DNK',
      geartype: 'PASSENGER',
      imo: '9812107',
      lastTransmissionDate: '2026-05-25T23:59:56Z',
      lat: 55.19,
      lon: 14.239999771118164,
      mmsi: '219026000',
      shipName: 'HAMMERSHUS',
      vesselId: '2cb75b670-08a6-fc17-8fd9-5d9d10a0fbdf',
      vesselType: 'PASSENGER',
    },
    rejected: false,
    run_metadata: {
      code_version: 'e923951c6a16f2332176b6545f29620788346b0d',
      config_hash:
        '8b0569ecd6c44178b2b4b373317e6181f3836bda30756a2d214817f7da4e3ce5',
      config_json: [
        {
          URL: 'https://gateway.api.globalfishingwatch.org/v3/4wings/report/',
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
          hotspot: {
            resolution: 5,
            timeBin: 'HOURLY',
          },
          method: 'POST',
          output: 'data/out/',
          sort: [
            {
              direction: 'asc',
              sortBy: 'timestamp_utc',
            },
            {
              direction: 'asc',
              sortBy: 'event_id',
            },
          ],
          threshold: {
            deep_water_threshold: -200,
            high_triage_score_threshold: 0.85,
            low_confidence_proxy_threshold: 2,
            low_triage_score_threshold: 0.3,
            medium_triage_score_threshold: 0.6,
            near_coast_threshold: 10,
            shallow_water_threshold: -50,
          },
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
    },
    scoring: {
      reason_codes: [
        'bathymetry_shallow_eez_hotspot',
        'inside_eez',
        'low_confidence_tier',
        'matched_to_public_ais',
        'missing_confidence_proxy',
      ],
      triage_score: 0.53,
      uncertainty_score: 0.38,
    },
    source: 'public-global-vessel-identity:v3.0',
    timestamp_utc: '2025-12-04T16:00:00Z',
    version: '1.0.0',
  },
  {
    confidence_proxy: null,
    confidence_tier: 'low',
    context_layers: {
      Bathymetry: {
        dataset: 'gebco_2025_sub_ice_topo',
        enrichments: [
          {
            value: '-45',
          },
        ],
        version: 'v2.7',
      },
      EEZ: {
        dataset: 'World_EEZ_20231025_LR',
        enrichments: [
          {
            id: '5694',
            label: 'Swedish Exclusive Economic Zone',
          },
        ],
        version: 'v12',
      },
      MPA: {
        dataset: 'WDPA_WDOECM_APR2026',
        enrichments: [],
        version: 'v1.6',
      },
    },
    distance_to_coast_km: 26.66,
    event_id:
      'd44afb12029541a7678103c8212636a3322f3a9c40137adc12d7d735c5fbf695',
    geom: {
      coordinates: [14.22, 55.15],
      type: 'Point',
    },
    hotspot: {
      cell_id: '851f2a43fffffff',
      signals: {
        hotspot_strength: 'low',
        recurrence_count: 1,
        time_bins_with_unmatched: 1,
      },
    },
    lat: 55.15,
    lon: 14.22,
    matched_flag: true,
    raw_event_metadata: null,
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
      lastTransmissionDate: '2026-05-25T23:59:51Z',
      lat: 55.15,
      lon: 14.220000267028809,
      mmsi: '636025638',
      shipName: 'ELYSARIA',
      vesselId: 'ee20f2f54-4c41-ce6c-ce45-fa136fb6e2cc',
      vesselType: 'OTHER',
    },
    rejected: false,
    run_metadata: {
      code_version: 'e923951c6a16f2332176b6545f29620788346b0d',
      config_hash:
        '8b0569ecd6c44178b2b4b373317e6181f3836bda30756a2d214817f7da4e3ce5',
      config_json: [
        {
          URL: 'https://gateway.api.globalfishingwatch.org/v3/4wings/report/',
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
          hotspot: {
            resolution: 5,
            timeBin: 'HOURLY',
          },
          method: 'POST',
          output: 'data/out/',
          sort: [
            {
              direction: 'asc',
              sortBy: 'timestamp_utc',
            },
            {
              direction: 'asc',
              sortBy: 'event_id',
            },
          ],
          threshold: {
            deep_water_threshold: -200,
            high_triage_score_threshold: 0.85,
            low_confidence_proxy_threshold: 2,
            low_triage_score_threshold: 0.3,
            medium_triage_score_threshold: 0.6,
            near_coast_threshold: 10,
            shallow_water_threshold: -50,
          },
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
    },
    scoring: {
      reason_codes: [
        'bathymetry_shallow_eez_hotspot',
        'inside_eez',
        'low_confidence_tier',
        'matched_to_public_ais',
        'missing_confidence_proxy',
      ],
      triage_score: 0.53,
      uncertainty_score: 0.38,
    },
    source: 'public-global-vessel-identity:v3.0',
    timestamp_utc: '2025-12-04T16:00:00Z',
    version: '1.0.0',
  },
  {
    confidence_proxy: null,
    confidence_tier: 'low',
    context_layers: {
      Bathymetry: {
        dataset: 'gebco_2025_sub_ice_topo',
        enrichments: [
          {
            value: '-43',
          },
        ],
        version: 'v2.7',
      },
      EEZ: {
        dataset: 'World_EEZ_20231025_LR',
        enrichments: [
          {
            id: '5674',
            label: 'Danish Exclusive Economic Zone',
          },
        ],
        version: 'v12',
      },
      MPA: {
        dataset: 'WDPA_WDOECM_APR2026',
        enrichments: [
          {
            id: '555774273',
            label: 'I',
          },
        ],
        version: 'v1.6',
      },
    },
    distance_to_coast_km: 18.72,
    event_id:
      'dfc71c0f4f7bd3840a93e9d0d5d155ebf2834103343954d16312b5e9b235ec23',
    geom: {
      coordinates: [14.41, 55.22],
      type: 'Point',
    },
    hotspot: {
      cell_id: '851f2a47fffffff',
      signals: {
        hotspot_strength: 'low',
        recurrence_count: 0,
        time_bins_with_unmatched: 0,
      },
    },
    lat: 55.22,
    lon: 14.41,
    matched_flag: true,
    raw_event_metadata: null,
    raw_metadata: {
      callsign: 'V2OW7',
      dataset: 'public-global-vessel-identity:v3.0',
      date: '2025-12-04 16:00',
      detections: 1,
      entryTimestamp: '2025-12-04T16:53:26Z',
      exitTimestamp: '2025-12-04T16:53:26Z',
      firstTransmissionDate: '2012-01-02T16:28:28Z',
      flag: 'ATG',
      geartype: 'CARGO',
      imo: '9287807',
      lastTransmissionDate: '2026-05-25T23:59:59Z',
      lat: 55.22,
      lon: 14.40999984741211,
      mmsi: '305773000',
      shipName: 'VOHBURG',
      vesselId: '369fc1e02-2678-b669-af58-b2f3ae66a515',
      vesselType: 'CARGO',
    },
    rejected: false,
    run_metadata: {
      code_version: 'e923951c6a16f2332176b6545f29620788346b0d',
      config_hash:
        '8b0569ecd6c44178b2b4b373317e6181f3836bda30756a2d214817f7da4e3ce5',
      config_json: [
        {
          URL: 'https://gateway.api.globalfishingwatch.org/v3/4wings/report/',
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
          hotspot: {
            resolution: 5,
            timeBin: 'HOURLY',
          },
          method: 'POST',
          output: 'data/out/',
          sort: [
            {
              direction: 'asc',
              sortBy: 'timestamp_utc',
            },
            {
              direction: 'asc',
              sortBy: 'event_id',
            },
          ],
          threshold: {
            deep_water_threshold: -200,
            high_triage_score_threshold: 0.85,
            low_confidence_proxy_threshold: 2,
            low_triage_score_threshold: 0.3,
            medium_triage_score_threshold: 0.6,
            near_coast_threshold: 10,
            shallow_water_threshold: -50,
          },
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
    },
    scoring: {
      reason_codes: [
        'bathymetry_cargo_anomaly_zone',
        'bathymetry_mpa_shallow_zone',
        'bathymetry_shallow_eez_hotspot',
        'inside_eez',
        'inside_mpa',
        'low_confidence_tier',
        'matched_to_public_ais',
        'missing_confidence_proxy',
      ],
      triage_score: 1,
      uncertainty_score: 0.38,
    },
    source: 'public-global-vessel-identity:v3.0',
    timestamp_utc: '2025-12-04T16:00:00Z',
    version: '1.0.0',
  },
  {
    confidence_proxy: null,
    confidence_tier: 'low',
    context_layers: {
      Bathymetry: {
        dataset: 'gebco_2025_sub_ice_topo',
        enrichments: [
          {
            value: '-39',
          },
        ],
        version: 'v2.7',
      },
      EEZ: {
        dataset: 'World_EEZ_20231025_LR',
        enrichments: [
          {
            id: '5694',
            label: 'Swedish Exclusive Economic Zone',
          },
        ],
        version: 'v12',
      },
      MPA: {
        dataset: 'WDPA_WDOECM_APR2026',
        enrichments: [],
        version: 'v1.6',
      },
    },
    distance_to_coast_km: 17.59,
    event_id:
      '0308d2e58f87a457eec2e4c56cc37049e5d0c214d3058fac67fbdf30944fc5a9',
    geom: {
      coordinates: [14.19, 55.23],
      type: 'Point',
    },
    hotspot: {
      cell_id: '851f2a43fffffff',
      signals: {
        hotspot_strength: 'low',
        recurrence_count: 1,
        time_bins_with_unmatched: 1,
      },
    },
    lat: 55.23,
    lon: 14.19,
    matched_flag: true,
    raw_event_metadata: null,
    raw_metadata: {
      callsign: 'OURV2',
      dataset: 'public-global-vessel-identity:v3.0',
      date: '2025-12-06 05:00',
      detections: 1,
      entryTimestamp: '2025-12-06T05:25:03Z',
      exitTimestamp: '2025-12-06T05:25:03Z',
      firstTransmissionDate: '2012-01-01T00:03:55Z',
      flag: 'DNK',
      geartype: 'CARGO',
      imo: '8104565',
      lastTransmissionDate: '2026-05-25T23:59:43Z',
      lat: 55.23,
      lon: 14.1899995803833,
      mmsi: '219002392',
      shipName: 'AMANDA',
      vesselId: 'df3528985-5287-a35b-89a0-b2e9c1e6db13',
      vesselType: 'CARGO',
    },
    rejected: false,
    run_metadata: {
      code_version: 'e923951c6a16f2332176b6545f29620788346b0d',
      config_hash:
        '8b0569ecd6c44178b2b4b373317e6181f3836bda30756a2d214817f7da4e3ce5',
      config_json: [
        {
          URL: 'https://gateway.api.globalfishingwatch.org/v3/4wings/report/',
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
          hotspot: {
            resolution: 5,
            timeBin: 'HOURLY',
          },
          method: 'POST',
          output: 'data/out/',
          sort: [
            {
              direction: 'asc',
              sortBy: 'timestamp_utc',
            },
            {
              direction: 'asc',
              sortBy: 'event_id',
            },
          ],
          threshold: {
            deep_water_threshold: -200,
            high_triage_score_threshold: 0.85,
            low_confidence_proxy_threshold: 2,
            low_triage_score_threshold: 0.3,
            medium_triage_score_threshold: 0.6,
            near_coast_threshold: 10,
            shallow_water_threshold: -50,
          },
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
    },
    scoring: {
      reason_codes: [
        'bathymetry_cargo_anomaly_zone',
        'bathymetry_shallow_eez_hotspot',
        'inside_eez',
        'low_confidence_tier',
        'matched_to_public_ais',
        'missing_confidence_proxy',
      ],
      triage_score: 0.73,
      uncertainty_score: 0.38,
    },
    source: 'public-global-vessel-identity:v3.0',
    timestamp_utc: '2025-12-06T05:00:00Z',
    version: '1.0.0',
  },
  {
    confidence_proxy: null,
    confidence_tier: 'low',
    context_layers: {
      Bathymetry: {
        dataset: 'gebco_2025_sub_ice_topo',
        enrichments: [
          {
            value: '-45',
          },
        ],
        version: 'v2.7',
      },
      EEZ: {
        dataset: 'World_EEZ_20231025_LR',
        enrichments: [
          {
            id: '5694',
            label: 'Swedish Exclusive Economic Zone',
          },
        ],
        version: 'v12',
      },
      MPA: {
        dataset: 'WDPA_WDOECM_APR2026',
        enrichments: [],
        version: 'v1.6',
      },
    },
    distance_to_coast_km: 19.16,
    event_id:
      '0dbc1379c8a56f3eb1da988f79b3ac8034f91980b6803bfa03492471f21a0d33',
    geom: {
      coordinates: [14.29, 55.23],
      type: 'Point',
    },
    hotspot: {
      cell_id: '851f2a47fffffff',
      signals: {
        hotspot_strength: 'low',
        recurrence_count: 0,
        time_bins_with_unmatched: 0,
      },
    },
    lat: 55.23,
    lon: 14.29,
    matched_flag: true,
    raw_event_metadata: null,
    raw_metadata: {
      callsign: 'YDJY3',
      dataset: 'public-global-vessel-identity:v3.0',
      date: '2025-12-06 05:00',
      detections: 1,
      entryTimestamp: '2025-12-06T05:25:03Z',
      exitTimestamp: '2025-12-06T05:25:03Z',
      firstTransmissionDate: '2024-05-08T11:07:06Z',
      flag: 'IDN',
      geartype: 'OTHER',
      imo: '9388730',
      lastTransmissionDate: '2026-05-25T23:59:59Z',
      lat: 55.23,
      lon: 14.289999961853027,
      mmsi: '525121076',
      shipName: 'SAVIR TIGER',
      vesselId: '403dc1002-210e-de4b-331d-b4012153dfa4',
      vesselType: 'OTHER',
    },
    rejected: false,
    run_metadata: {
      code_version: 'e923951c6a16f2332176b6545f29620788346b0d',
      config_hash:
        '8b0569ecd6c44178b2b4b373317e6181f3836bda30756a2d214817f7da4e3ce5',
      config_json: [
        {
          URL: 'https://gateway.api.globalfishingwatch.org/v3/4wings/report/',
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
          hotspot: {
            resolution: 5,
            timeBin: 'HOURLY',
          },
          method: 'POST',
          output: 'data/out/',
          sort: [
            {
              direction: 'asc',
              sortBy: 'timestamp_utc',
            },
            {
              direction: 'asc',
              sortBy: 'event_id',
            },
          ],
          threshold: {
            deep_water_threshold: -200,
            high_triage_score_threshold: 0.85,
            low_confidence_proxy_threshold: 2,
            low_triage_score_threshold: 0.3,
            medium_triage_score_threshold: 0.6,
            near_coast_threshold: 10,
            shallow_water_threshold: -50,
          },
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
    },
    scoring: {
      reason_codes: [
        'bathymetry_shallow_eez_hotspot',
        'inside_eez',
        'low_confidence_tier',
        'matched_to_public_ais',
        'missing_confidence_proxy',
      ],
      triage_score: 0.53,
      uncertainty_score: 0.38,
    },
    source: 'public-global-vessel-identity:v3.0',
    timestamp_utc: '2025-12-06T05:00:00Z',
    version: '1.0.0',
  },
  {
    confidence_proxy: null,
    confidence_tier: 'low',
    context_layers: {
      Bathymetry: {
        dataset: 'gebco_2025_sub_ice_topo',
        enrichments: [
          {
            value: '-46',
          },
        ],
        version: 'v2.7',
      },
      EEZ: {
        dataset: 'World_EEZ_20231025_LR',
        enrichments: [
          {
            id: '5694',
            label: 'Swedish Exclusive Economic Zone',
          },
        ],
        version: 'v12',
      },
      MPA: {
        dataset: 'WDPA_WDOECM_APR2026',
        enrichments: [],
        version: 'v1.6',
      },
    },
    distance_to_coast_km: 33.07,
    event_id:
      '2467aabb706f8d708de0726e25ed51d73a8fae4475766a3aa761d0d24c958ad8',
    geom: {
      coordinates: [14.09, 55.09],
      type: 'Point',
    },
    hotspot: {
      cell_id: '851f2a4bfffffff',
      signals: {
        hotspot_strength: 'low',
        recurrence_count: 0,
        time_bins_with_unmatched: 0,
      },
    },
    lat: 55.09,
    lon: 14.09,
    matched_flag: true,
    raw_event_metadata: null,
    raw_metadata: {
      callsign: '5BNV4',
      dataset: 'public-global-vessel-identity:v3.0',
      date: '2025-12-06 05:00',
      detections: 1,
      entryTimestamp: '2025-12-06T05:25:03Z',
      exitTimestamp: '2025-12-06T05:25:03Z',
      firstTransmissionDate: '2016-08-30T13:30:09Z',
      flag: 'CYP',
      geartype: 'CARGO',
      imo: '9552044',
      lastTransmissionDate: '2026-05-25T23:59:11Z',
      lat: 55.09,
      lon: 14.09000015258789,
      mmsi: '212584000',
      shipName: 'MIRAMAR',
      vesselId: 'afdb60bd6-6d97-eb03-ef84-c1e3b26c10cc',
      vesselType: 'CARGO',
    },
    rejected: false,
    run_metadata: {
      code_version: 'e923951c6a16f2332176b6545f29620788346b0d',
      config_hash:
        '8b0569ecd6c44178b2b4b373317e6181f3836bda30756a2d214817f7da4e3ce5',
      config_json: [
        {
          URL: 'https://gateway.api.globalfishingwatch.org/v3/4wings/report/',
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
          hotspot: {
            resolution: 5,
            timeBin: 'HOURLY',
          },
          method: 'POST',
          output: 'data/out/',
          sort: [
            {
              direction: 'asc',
              sortBy: 'timestamp_utc',
            },
            {
              direction: 'asc',
              sortBy: 'event_id',
            },
          ],
          threshold: {
            deep_water_threshold: -200,
            high_triage_score_threshold: 0.85,
            low_confidence_proxy_threshold: 2,
            low_triage_score_threshold: 0.3,
            medium_triage_score_threshold: 0.6,
            near_coast_threshold: 10,
            shallow_water_threshold: -50,
          },
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
    },
    scoring: {
      reason_codes: [
        'bathymetry_cargo_anomaly_zone',
        'bathymetry_shallow_eez_hotspot',
        'inside_eez',
        'low_confidence_tier',
        'matched_to_public_ais',
        'missing_confidence_proxy',
      ],
      triage_score: 0.73,
      uncertainty_score: 0.38,
    },
    source: 'public-global-vessel-identity:v3.0',
    timestamp_utc: '2025-12-06T05:00:00Z',
    version: '1.0.0',
  },
  {
    confidence_proxy: null,
    confidence_tier: 'low',
    context_layers: {
      Bathymetry: {
        dataset: 'gebco_2025_sub_ice_topo',
        enrichments: [
          {
            value: '-46',
          },
        ],
        version: 'v2.7',
      },
      EEZ: {
        dataset: 'World_EEZ_20231025_LR',
        enrichments: [
          {
            id: '5674',
            label: 'Danish Exclusive Economic Zone',
          },
        ],
        version: 'v12',
      },
      MPA: {
        dataset: 'WDPA_WDOECM_APR2026',
        enrichments: [],
        version: 'v1.6',
      },
    },
    distance_to_coast_km: 25.02,
    event_id:
      '5be65e8fc2b375b0f0cb2eb75530cd7df6066d15f83e483165eeae5d168f271b',
    geom: {
      coordinates: [14.3, 55.15],
      type: 'Point',
    },
    hotspot: {
      cell_id: '851f2a47fffffff',
      signals: {
        hotspot_strength: 'low',
        recurrence_count: 0,
        time_bins_with_unmatched: 0,
      },
    },
    lat: 55.15,
    lon: 14.3,
    matched_flag: true,
    raw_event_metadata: null,
    raw_metadata: {
      callsign: '8POQ',
      dataset: 'public-global-vessel-identity:v3.0',
      date: '2025-12-06 05:00',
      detections: 1,
      entryTimestamp: '2025-12-06T05:25:03Z',
      exitTimestamp: '2025-12-06T05:25:03Z',
      firstTransmissionDate: '2025-10-25T08:35:19Z',
      flag: 'BRB',
      geartype: 'OTHER',
      imo: '9318096',
      lastTransmissionDate: '2026-05-25T23:59:48Z',
      lat: 55.15,
      lon: 14.300000190734863,
      mmsi: '314001147',
      shipName: 'COSMO SAIL',
      vesselId: 'ddd3f8ebb-b915-bcf6-9d8f-5f463eb99b7f',
      vesselType: 'OTHER',
    },
    rejected: false,
    run_metadata: {
      code_version: 'e923951c6a16f2332176b6545f29620788346b0d',
      config_hash:
        '8b0569ecd6c44178b2b4b373317e6181f3836bda30756a2d214817f7da4e3ce5',
      config_json: [
        {
          URL: 'https://gateway.api.globalfishingwatch.org/v3/4wings/report/',
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
          hotspot: {
            resolution: 5,
            timeBin: 'HOURLY',
          },
          method: 'POST',
          output: 'data/out/',
          sort: [
            {
              direction: 'asc',
              sortBy: 'timestamp_utc',
            },
            {
              direction: 'asc',
              sortBy: 'event_id',
            },
          ],
          threshold: {
            deep_water_threshold: -200,
            high_triage_score_threshold: 0.85,
            low_confidence_proxy_threshold: 2,
            low_triage_score_threshold: 0.3,
            medium_triage_score_threshold: 0.6,
            near_coast_threshold: 10,
            shallow_water_threshold: -50,
          },
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
    },
    scoring: {
      reason_codes: [
        'bathymetry_shallow_eez_hotspot',
        'inside_eez',
        'low_confidence_tier',
        'matched_to_public_ais',
        'missing_confidence_proxy',
      ],
      triage_score: 0.53,
      uncertainty_score: 0.38,
    },
    source: 'public-global-vessel-identity:v3.0',
    timestamp_utc: '2025-12-06T05:00:00Z',
    version: '1.0.0',
  },
  {
    confidence_proxy: null,
    confidence_tier: 'low',
    context_layers: {
      Bathymetry: {
        dataset: 'gebco_2025_sub_ice_topo',
        enrichments: [
          {
            value: '-45',
          },
        ],
        version: 'v2.7',
      },
      EEZ: {
        dataset: 'World_EEZ_20231025_LR',
        enrichments: [
          {
            id: '5694',
            label: 'Swedish Exclusive Economic Zone',
          },
        ],
        version: 'v12',
      },
      MPA: {
        dataset: 'WDPA_WDOECM_APR2026',
        enrichments: [],
        version: 'v1.6',
      },
    },
    distance_to_coast_km: 19.23,
    event_id:
      '8739bf95e81d3cfb16d20b1d81abf69f3d2f875022e4947daf44aa3ecb1bbcd2',
    geom: {
      coordinates: [14.33, 55.24],
      type: 'Point',
    },
    hotspot: {
      cell_id: '851f2a47fffffff',
      signals: {
        hotspot_strength: 'low',
        recurrence_count: 0,
        time_bins_with_unmatched: 0,
      },
    },
    lat: 55.24,
    lon: 14.33,
    matched_flag: true,
    raw_event_metadata: null,
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
      lastTransmissionDate: '2026-05-25T23:57:32Z',
      lat: 55.24,
      lon: 14.329999923706055,
      mmsi: '244067000',
      shipName: 'BALTIC SAIL',
      vesselId: '43c5ec9e1-1026-c273-d280-f0c34b520f53',
      vesselType: 'CARGO',
    },
    rejected: false,
    run_metadata: {
      code_version: 'e923951c6a16f2332176b6545f29620788346b0d',
      config_hash:
        '8b0569ecd6c44178b2b4b373317e6181f3836bda30756a2d214817f7da4e3ce5',
      config_json: [
        {
          URL: 'https://gateway.api.globalfishingwatch.org/v3/4wings/report/',
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
          hotspot: {
            resolution: 5,
            timeBin: 'HOURLY',
          },
          method: 'POST',
          output: 'data/out/',
          sort: [
            {
              direction: 'asc',
              sortBy: 'timestamp_utc',
            },
            {
              direction: 'asc',
              sortBy: 'event_id',
            },
          ],
          threshold: {
            deep_water_threshold: -200,
            high_triage_score_threshold: 0.85,
            low_confidence_proxy_threshold: 2,
            low_triage_score_threshold: 0.3,
            medium_triage_score_threshold: 0.6,
            near_coast_threshold: 10,
            shallow_water_threshold: -50,
          },
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
    },
    scoring: {
      reason_codes: [
        'bathymetry_cargo_anomaly_zone',
        'bathymetry_shallow_eez_hotspot',
        'inside_eez',
        'low_confidence_tier',
        'matched_to_public_ais',
        'missing_confidence_proxy',
      ],
      triage_score: 0.73,
      uncertainty_score: 0.38,
    },
    source: 'public-global-vessel-identity:v3.0',
    timestamp_utc: '2025-12-06T05:00:00Z',
    version: '1.0.0',
  },
  {
    confidence_proxy: null,
    confidence_tier: 'low',
    context_layers: {
      Bathymetry: {
        dataset: 'gebco_2025_sub_ice_topo',
        enrichments: [
          {
            value: '-43',
          },
        ],
        version: 'v2.7',
      },
      EEZ: {
        dataset: 'World_EEZ_20231025_LR',
        enrichments: [
          {
            id: '5674',
            label: 'Danish Exclusive Economic Zone',
          },
        ],
        version: 'v12',
      },
      MPA: {
        dataset: 'WDPA_WDOECM_APR2026',
        enrichments: [],
        version: 'v1.6',
      },
    },
    distance_to_coast_km: 18.68,
    event_id:
      '8c07b71ef69301c62f7a94e367c7b627292329d5d4c9633195c064fc8d4e0081',
    geom: {
      coordinates: [14.41, 55.21],
      type: 'Point',
    },
    hotspot: {
      cell_id: '851f2a47fffffff',
      signals: {
        hotspot_strength: 'low',
        recurrence_count: 0,
        time_bins_with_unmatched: 0,
      },
    },
    lat: 55.21,
    lon: 14.41,
    matched_flag: true,
    raw_event_metadata: null,
    raw_metadata: {
      callsign: '5BRS5',
      dataset: 'public-global-vessel-identity:v3.0',
      date: '2025-12-06 05:00',
      detections: 1,
      entryTimestamp: '2025-12-06T05:25:03Z',
      exitTimestamp: '2025-12-06T05:25:03Z',
      firstTransmissionDate: '2021-02-02T09:18:42Z',
      flag: 'CYP',
      geartype: 'CARGO',
      imo: '9213703',
      lastTransmissionDate: '2026-05-25T23:59:27Z',
      lat: 55.21,
      lon: 14.40999984741211,
      mmsi: '209982000',
      shipName: 'NINA B',
      vesselId: 'e4a2ba1ec-c786-5395-6e67-1fb8e1abe320',
      vesselType: 'CARGO',
    },
    rejected: false,
    run_metadata: {
      code_version: 'e923951c6a16f2332176b6545f29620788346b0d',
      config_hash:
        '8b0569ecd6c44178b2b4b373317e6181f3836bda30756a2d214817f7da4e3ce5',
      config_json: [
        {
          URL: 'https://gateway.api.globalfishingwatch.org/v3/4wings/report/',
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
          hotspot: {
            resolution: 5,
            timeBin: 'HOURLY',
          },
          method: 'POST',
          output: 'data/out/',
          sort: [
            {
              direction: 'asc',
              sortBy: 'timestamp_utc',
            },
            {
              direction: 'asc',
              sortBy: 'event_id',
            },
          ],
          threshold: {
            deep_water_threshold: -200,
            high_triage_score_threshold: 0.85,
            low_confidence_proxy_threshold: 2,
            low_triage_score_threshold: 0.3,
            medium_triage_score_threshold: 0.6,
            near_coast_threshold: 10,
            shallow_water_threshold: -50,
          },
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
    },
    scoring: {
      reason_codes: [
        'bathymetry_cargo_anomaly_zone',
        'bathymetry_shallow_eez_hotspot',
        'inside_eez',
        'low_confidence_tier',
        'matched_to_public_ais',
        'missing_confidence_proxy',
      ],
      triage_score: 0.73,
      uncertainty_score: 0.38,
    },
    source: 'public-global-vessel-identity:v3.0',
    timestamp_utc: '2025-12-06T05:00:00Z',
    version: '1.0.0',
  },
];

export const report_response = {
  headers: {
    date: 'Mon, 01 Jun 2026 12:16:53 GMT',
    'content-type': 'application/json; charset=utf-8',
    'transfer-encoding': 'chunked',
    connection: 'keep-alive',
    'access-control-allow-credentials': 'true',
    'access-control-allow-headers': 'Accept,Content-Type,cookie,refresh-token,Accept-Encoding,Authorization,origin,referer,user-agent,Access-Control-Allow-Origin,indexes-0,indexes-1,indexes-2,indexes-3,indexes-4,indexes-5,indexes-6,indexes-7,x-workspace-password',
    'access-control-allow-methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'access-control-allow-origin': '*',
    'access-control-expose-headers': 'indexes-0,indexes-1,indexes-2,indexes-3,indexes-4,indexes-5,indexes-6,indexes-7,x-deprecated-dataset,x-ratelimit-daily-current-usage,x-ratelimit-daily-limit-requests,x-ratelimit-daily-remaining-requests,x-ratelimit-daily-reset-hours,x-ratelimit-monthly-current-usage,x-ratelimit-monthly-limit-requests,x-ratelimit-monthly-remaining-requests,x-ratelimit-monthly-reset-days, x-last-report-uri,x-rows,x-columns,x-offset,x-scale,x-empty-value,x-bins-0,x-bins-count-0',
    cache: 'true',
    'cache-control': 'private, max-age=604800',
    'cache-duration': '14400',
    'datasets-to-check': 'public-global-vessel-identity:v3.0',
    origin: 'GFW API Gateway',
    'transaction-id': '23e2917a-aa27-4d05-ae64-9d4937366b50',
    vary: 'Accept-Encoding',
    'x-datasets': 'public-global-sar-presence:v3.0',
    'x-deprecated-dataset': 'public-global-sar-presence:v3.0=public-global-sar-presence:v4.0',
    'x-ratelimit-daily-current-usage': '0',
    'x-ratelimit-daily-limit-requests': '50000',
    'x-ratelimit-daily-remaining-requests': '50000',
    'x-ratelimit-daily-reset-hours': '0',
    'x-ratelimit-monthly-current-usage': '634',
    'x-ratelimit-monthly-limit-requests': '1500000',
    'x-ratelimit-monthly-remaining-requests': '1499366',
    'x-ratelimit-monthly-reset-days': '0',
    'content-encoding': 'gzip',
    server: 'cloudflare',
    'cf-cache-status': 'DYNAMIC',
    'cf-ray': 'a04e2685ef5c8cb6-FRA'
  },
  data: samples
}

export const report_response_rate_limit_exceeded = {
  headers: {
    ...report_response.headers,
    "x-ratelimit-daily-limit-requests": "50000",
    "x-ratelimit-monthly-limit-requests": "1500000",

    "x-ratelimit-daily-remaining-requests": "12430",
    "x-ratelimit-monthly-remaining-requests": "842310",

    "x-ratelimit-daily-current-usage": "37570",
    "x-ratelimit-monthly-current-usage": "657690",

    "x-ratelimit-daily-reset-hours": "18",
    "x-ratelimit-monthly-reset-days": "27"
  },
  data: samples
}