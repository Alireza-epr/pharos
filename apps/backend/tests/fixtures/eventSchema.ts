import { IEventSchema } from '@packages/types';

export const eventSchema_matched_near_coast: any = {
  "version": "1.0.0",
  "event_id": "cbbf5b2f2035f0eb692c96f9b3adc06f95a96d49ea718e967e191333feca863b",
  "timestamp_utc": "2025-12-04T16:00:00Z",
  "matched_flag": true,
  "confidence_proxy": null,
  "confidence_tier": "low",
  "lat": 55.16,
  "lon": 14.68,
  "source": "public-global-vessel-identity:v3.0",
  "raw_metadata": {
    "callsign": "OVDN",
    "dataset": "public-global-vessel-identity:v3.0",
    "date": "2025-12-04 16:00",
    "detections": 1,
    "entryTimestamp": "2025-12-04T16:53:26Z",
    "exitTimestamp": "2025-12-04T16:53:26Z",
    "firstTransmissionDate": "2018-09-13T16:47:49Z",
    "flag": "DNK",
    "geartype": "OTHER",
    "imo": "",
    "lastTransmissionDate": "2026-05-07T21:48:16Z",
    "lat": 55.16,
    "lon": 14.680000305175781,
    "mmsi": "219000217",
    "shipName": "HDMS SOELOEVEN",
    "vesselId": "22c7ca42d-df50-18b5-713a-a81e9115052c",
    "vesselType": "OTHER"
  },
  "raw_event_metadata": null,
  "run_metadata": {
    "code_version": "21183497b4a91f31e7e9685399d56e836fdc15e1",
    "config_json": [
      {
        "URL": "https://gateway.api.globalfishingwatch.org/v3/4wings/report/",
        "body_params": {
          "geojson": {
            "coordinates": [
              [
                [
                  14.11,
                  55.26
                ],
                [
                  14.68,
                  55.27
                ],
                [
                  14.69,
                  55.11
                ],
                [
                  14.09,
                  55.08
                ],
                [
                  14.11,
                  55.26
                ]
              ]
            ],
            "type": "Polygon"
          }
        },
        "hotspot": {
          "resolution": 5,
          "timeBin": "HOURLY"
        },
        "method": "POST",
        "output": "data/out/",
        "threshold": {
          "deep_water_threshold": -200,
          "high_triage_score_threshold": 0.85,
          "low_confidence_proxy_threshold": 2,
          "low_triage_score_threshold": 0.3,
          "medium_triage_score_threshold": 0.6,
          "near_coast_threshold": 10,
          "shallow_water_threshold": -50
        },
        "url_params": {
          "datasets[0]": "public-global-sar-presence:v3.0",
          "date-range": "2025-12-01T00:00:00Z,2025-12-07T23:59:59Z",
          "filters[0]": "",
          "format": "JSON",
          "group-by": "VESSEL_ID",
          "spatial-resolution": "HIGH",
          "temporal-resolution": "HOURLY"
        }
      }
    ],
    "config_hash": "3b1e7d8ee063b725df4b8d95e65385579eb9517326ccd2a36b081e433f2844bf"
  },
  "context_layers": {
    "EEZ": {
      "dataset": "World_EEZ_20231025_LR",
      "version": "v12",
      "enrichments": [
        {
          "id": "5674",
          "label": "Danish Exclusive Economic Zone"
        }
      ]
    },
    "MPA": {
      "dataset": "WDPA_WDOECM_APR2026",
      "version": "v1.6",
      "enrichments": []
    },
    "Bathymetry": {
      "dataset": "gebco_2025_sub_ice_topo",
      "version": "v2.7",
      "enrichments": [
        {
          "value": "-22"
        }
      ]
    }
  },
  "distance_to_coast_km": 1.33,
  "scoring": {
    "triage_score": 0.83,
    "uncertainty_score": 0.38,
    "reason_codes": [
      "matched_to_public_ais",
      "missing_confidence_proxy",
      "low_confidence_tier",
      "inside_eez",
      "near_coast",
      "bathymetry_shallow_eez_hotspot"
    ]
  },
  "geom": {
    "type": "Point",
    "coordinates": [
      14.68,
      55.16
    ]
  },
  "rejected": false,
  "hotspot": {
    "cell_id": "851f2a73fffffff",
    "signals": {
      "recurrence_count": 0,
      "time_bins_with_unmatched": 0,
      "hotspot_strength": "low"
    }
  }
};

export const eventSchema_matched_offshore: any = {
  "version": "1.0.0",
  "event_id": "5be65e8fc2b375b0f0cb2eb75530cd7df6066d15f83e483165eeae5d168f271b",
  "timestamp_utc": "2025-12-06T05:00:00Z",
  "matched_flag": true,
  "confidence_proxy": null,
  "confidence_tier": "low",
  "lat": 55.15,
  "lon": 14.3,
  "source": "public-global-vessel-identity:v3.0",
  "raw_metadata": {
    "callsign": "8POQ",
    "dataset": "public-global-vessel-identity:v3.0",
    "date": "2025-12-06 05:00",
    "detections": 1,
    "entryTimestamp": "2025-12-06T05:25:03Z",
    "exitTimestamp": "2025-12-06T05:25:03Z",
    "firstTransmissionDate": "2025-10-25T08:35:19Z",
    "flag": "BRB",
    "geartype": "OTHER",
    "imo": "9318096",
    "lastTransmissionDate": "2026-05-06T16:25:28Z",
    "lat": 55.15,
    "lon": 14.300000190734863,
    "mmsi": "314001147",
    "shipName": "COSMO SAIL",
    "vesselId": "ddd3f8ebb-b915-bcf6-9d8f-5f463eb99b7f",
    "vesselType": "OTHER"
  },
  "raw_event_metadata": null,
  "run_metadata": {
    "code_version": "21183497b4a91f31e7e9685399d56e836fdc15e1",
    "config_json": [
      {
        "URL": "https://gateway.api.globalfishingwatch.org/v3/4wings/report/",
        "body_params": {
          "geojson": {
            "coordinates": [
              [
                [
                  14.11,
                  55.26
                ],
                [
                  14.68,
                  55.27
                ],
                [
                  14.69,
                  55.11
                ],
                [
                  14.09,
                  55.08
                ],
                [
                  14.11,
                  55.26
                ]
              ]
            ],
            "type": "Polygon"
          }
        },
        "hotspot": {
          "resolution": 5,
          "timeBin": "HOURLY"
        },
        "method": "POST",
        "output": "data/out/",
        "threshold": {
          "deep_water_threshold": -200,
          "high_triage_score_threshold": 0.85,
          "low_confidence_proxy_threshold": 2,
          "low_triage_score_threshold": 0.3,
          "medium_triage_score_threshold": 0.6,
          "near_coast_threshold": 10,
          "shallow_water_threshold": -50
        },
        "url_params": {
          "datasets[0]": "public-global-sar-presence:v3.0",
          "date-range": "2025-12-01T00:00:00Z,2025-12-07T23:59:59Z",
          "filters[0]": "",
          "format": "JSON",
          "group-by": "VESSEL_ID",
          "spatial-resolution": "HIGH",
          "temporal-resolution": "HOURLY"
        }
      }
    ],
    "config_hash": "3b1e7d8ee063b725df4b8d95e65385579eb9517326ccd2a36b081e433f2844bf"
  },
  "context_layers": {
    "EEZ": {
      "dataset": "World_EEZ_20231025_LR",
      "version": "v12",
      "enrichments": [
        {
          "id": "5674",
          "label": "Danish Exclusive Economic Zone"
        }
      ]
    },
    "MPA": {
      "dataset": "WDPA_WDOECM_APR2026",
      "version": "v1.6",
      "enrichments": []
    },
    "Bathymetry": {
      "dataset": "gebco_2025_sub_ice_topo",
      "version": "v2.7",
      "enrichments": [
        {
          "value": "-46"
        }
      ]
    }
  },
  "distance_to_coast_km": 25.02,
  "scoring": {
    "triage_score": 0.53,
    "uncertainty_score": 0.38,
    "reason_codes": [
      "matched_to_public_ais",
      "missing_confidence_proxy",
      "low_confidence_tier",
      "inside_eez",
      "bathymetry_shallow_eez_hotspot"
    ]
  },
  "geom": {
    "type": "Point",
    "coordinates": [
      14.3,
      55.15
    ]
  },
  "rejected": false,
  "hotspot": {
    "cell_id": "851f2a47fffffff",
    "signals": {
      "recurrence_count": 0,
      "time_bins_with_unmatched": 0,
      "hotspot_strength": "low"
    }
  }
};

export const eventSchema_umatched_near_coast: any = {
  "version": "1.0.0",
  "event_id": "a97fdca4e9056e0c5d9d4bc3bf89e8eb7832969ff9d7b6592e2d9e00dd13440b",
  "timestamp_utc": "2025-04-27T16:00:00Z",
  "matched_flag": false,
  "confidence_proxy": null,
  "confidence_tier": "low",
  "lat": 55.13,
  "lon": 14.59,
  "source": "public-global-sar-presence:v3.0",
  "raw_metadata": {
    "callsign": "",
    "dataset": "",
    "date": "2025-04-27 16:00",
    "detections": 1,
    "entryTimestamp": "2025-01-11T05:17:01Z",
    "exitTimestamp": "2025-12-16T16:53:25Z",
    "firstTransmissionDate": "",
    "flag": "",
    "geartype": "",
    "imo": "",
    "lastTransmissionDate": "",
    "lat": 55.13,
    "lon": 14.59000015258789,
    "mmsi": "",
    "shipName": "",
    "vesselId": "",
    "vesselType": ""
  },
  "raw_event_metadata": null,
  "run_metadata": {
    "code_version": "21183497b4a91f31e7e9685399d56e836fdc15e1",
    "config_json": [
      {
        "URL": "https://gateway.api.globalfishingwatch.org/v3/4wings/report/",
        "body_params": {
          "geojson": {
            "coordinates": [
              [
                [
                  14.11,
                  55.26
                ],
                [
                  14.68,
                  55.27
                ],
                [
                  14.69,
                  55.11
                ],
                [
                  14.09,
                  55.08
                ],
                [
                  14.11,
                  55.26
                ]
              ]
            ],
            "type": "Polygon"
          }
        },
        "hotspot": {
          "resolution": 5,
          "timeBin": "HOURLY"
        },
        "method": "POST",
        "output": "data/out/pilot_unmatched/",
        "threshold": {
          "deep_water_threshold": -200,
          "high_triage_score_threshold": 0.85,
          "low_confidence_proxy_threshold": 2,
          "low_triage_score_threshold": 0.3,
          "medium_triage_score_threshold": 0.6,
          "near_coast_threshold": 10,
          "shallow_water_threshold": -50
        },
        "url_params": {
          "datasets[0]": "public-global-sar-presence:v3.0",
          "date-range": "2025-01-01T00:00:00Z,2025-12-31T23:59:59Z",
          "filters[0]": "matched='false'",
          "format": "JSON",
          "group-by": "VESSEL_ID",
          "spatial-resolution": "HIGH",
          "temporal-resolution": "HOURLY"
        }
      }
    ],
    "config_hash": "726581f249d2d64f70656a0315483e782822acdd1becc86ef56b828f495b279b"
  },
  "context_layers": {
    "EEZ": {
      "dataset": "World_EEZ_20231025_LR",
      "version": "v12",
      "enrichments": [
        {
          "id": "5674",
          "label": "Danish Exclusive Economic Zone"
        }
      ]
    },
    "MPA": {
      "dataset": "WDPA_WDOECM_APR2026",
      "version": "v1.6",
      "enrichments": []
    },
    "Bathymetry": {
      "dataset": "gebco_2025_sub_ice_topo",
      "version": "v2.7",
      "enrichments": [
        {
          "value": "-41"
        }
      ]
    }
  },
  "distance_to_coast_km": 6.7,
  "scoring": {
    "triage_score": 0.88,
    "uncertainty_score": 0.63,
    "reason_codes": [
      "unmatched_to_public_ais",
      "missing_confidence_proxy",
      "low_confidence_tier",
      "inside_eez",
      "near_coast",
      "bathymetry_shallow_eez_hotspot"
    ]
  },
  "geom": {
    "type": "Point",
    "coordinates": [
      14.59,
      55.13
    ]
  },
  "rejected": false,
  "hotspot": {
    "cell_id": "851f2a7bfffffff",
    "signals": {
      "recurrence_count": 10,
      "time_bins_with_unmatched": 10,
      "hotspot_strength": "high"
    }
  }
};

export const eventSchema_umatched_offshore: any = {
  "version": "1.0.0",
  "event_id": "8295ccc8a648afefb4588b3127cc520c62001bcaa875d5735b47b758ce6a95bd",
  "timestamp_utc": "2025-12-04T16:00:00Z",
  "matched_flag": false,
  "confidence_proxy": null,
  "confidence_tier": "low",
  "lat": 55.2,
  "lon": 14.21,
  "source": "public-global-sar-presence:v3.0",
  "raw_metadata": {
    "callsign": "",
    "dataset": "",
    "date": "2025-12-04 16:00",
    "detections": 1,
    "entryTimestamp": "2025-12-04T16:53:26Z",
    "exitTimestamp": "2025-12-04T16:53:26Z",
    "firstTransmissionDate": "",
    "flag": "",
    "geartype": "",
    "imo": "",
    "lastTransmissionDate": "",
    "lat": 55.2,
    "lon": 14.210000038146973,
    "mmsi": "",
    "shipName": "",
    "vesselId": "",
    "vesselType": ""
  },
  "raw_event_metadata": null,
  "run_metadata": {
    "code_version": "21183497b4a91f31e7e9685399d56e836fdc15e1",
    "config_json": [
      {
        "URL": "https://gateway.api.globalfishingwatch.org/v3/4wings/report/",
        "body_params": {
          "geojson": {
            "coordinates": [
              [
                [
                  14.11,
                  55.26
                ],
                [
                  14.68,
                  55.27
                ],
                [
                  14.69,
                  55.11
                ],
                [
                  14.09,
                  55.08
                ],
                [
                  14.11,
                  55.26
                ]
              ]
            ],
            "type": "Polygon"
          }
        },
        "hotspot": {
          "resolution": 5,
          "timeBin": "HOURLY"
        },
        "method": "POST",
        "output": "data/out/",
        "threshold": {
          "deep_water_threshold": -200,
          "high_triage_score_threshold": 0.85,
          "low_confidence_proxy_threshold": 2,
          "low_triage_score_threshold": 0.3,
          "medium_triage_score_threshold": 0.6,
          "near_coast_threshold": 10,
          "shallow_water_threshold": -50
        },
        "url_params": {
          "datasets[0]": "public-global-sar-presence:v3.0",
          "date-range": "2025-12-01T00:00:00Z,2025-12-07T23:59:59Z",
          "filters[0]": "",
          "format": "JSON",
          "group-by": "VESSEL_ID",
          "spatial-resolution": "HIGH",
          "temporal-resolution": "HOURLY"
        }
      }
    ],
    "config_hash": "3b1e7d8ee063b725df4b8d95e65385579eb9517326ccd2a36b081e433f2844bf"
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
    },
    "Bathymetry": {
      "dataset": "gebco_2025_sub_ice_topo",
      "version": "v2.7",
      "enrichments": [
        {
          "value": "-43"
        }
      ]
    }
  },
  "distance_to_coast_km": 21.07,
  "scoring": {
    "triage_score": 0.58,
    "uncertainty_score": 0.63,
    "reason_codes": [
      "unmatched_to_public_ais",
      "missing_confidence_proxy",
      "low_confidence_tier",
      "inside_eez",
      "bathymetry_shallow_eez_hotspot"
    ]
  },
  "geom": {
    "type": "Point",
    "coordinates": [
      14.21,
      55.2
    ]
  },
  "rejected": false,
  "hotspot": {
    "cell_id": "851f2a43fffffff",
    "signals": {
      "recurrence_count": 1,
      "time_bins_with_unmatched": 1,
      "hotspot_strength": "low"
    }
  }
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
  confidence_proxy: 2,
};

export const eventSchema_with_high_confidence: IEventSchema = {
  ...eventSchema_umatched_near_coast,
  confidence_proxy: 4,
};

export const eventSchema_ais_near_coast: any = {
  "version": "1.0.0",
  "event_id": "a5623da633c2050b178f35c456bf44a892d4a2574bd1154aebadffd93aa52c0b",
  "timestamp_utc": "2025-12-07T11:00:00Z",
  "confidence_proxy": null,
  "confidence_tier": "low",
  "lat": 55.12,
  "lon": 14.67,
  "source": "public-global-vessel-identity:v3.0",
  "raw_metadata": {
    "callsign": "SPG3449",
    "dataset": "public-global-vessel-identity:v3.0",
    "date": "2025-12-07 11:00",
    "entryTimestamp": "2025-12-07T11:00:00Z",
    "exitTimestamp": "2025-12-07T13:00:00Z",
    "firstTransmissionDate": "2019-06-19T08:17:42Z",
    "flag": "POL",
    "geartype": "PASSENGER",
    "hours": 1,
    "imo": "",
    "lastTransmissionDate": "2026-05-09T17:36:04Z",
    "lat": 55.12,
    "lon": 14.670000076293945,
    "mmsi": "261019290",
    "shipName": "ATHAMAN",
    "vesselId": "a9280052b-b2fa-30bd-7f90-543c6999a1ed",
    "vesselType": "PASSENGER"
  },
  "raw_event_metadata": null,
  "run_metadata": {
    "code_version": "8dba6b88e30010ac07c1ac5be9d446392087c8df",
    "config_json": [
      {
        "URL": "https://gateway.api.globalfishingwatch.org/v3/4wings/report/",
        "body_params": {
          "geojson": {
            "coordinates": [
              [
                [
                  14.11,
                  55.26
                ],
                [
                  14.68,
                  55.27
                ],
                [
                  14.69,
                  55.11
                ],
                [
                  14.09,
                  55.08
                ],
                [
                  14.11,
                  55.26
                ]
              ]
            ],
            "type": "Polygon"
          }
        },
        "hotspot": {
          "resolution": 5,
          "timeBin": "HOURLY"
        },
        "method": "POST",
        "output": "data/out/",
        "threshold": {
          "deep_water_threshold": -200,
          "high_triage_score_threshold": 0.85,
          "low_confidence_proxy_threshold": 2,
          "low_triage_score_threshold": 0.3,
          "medium_triage_score_threshold": 0.6,
          "near_coast_threshold": 10,
          "shallow_water_threshold": -50
        },
        "url_params": {
          "datasets[0]": "public-global-presence:v3.0",
          "date-range": "2025-12-07T00:00:00Z,2025-12-07T23:59:59Z",
          "filters[0]": "",
          "format": "JSON",
          "group-by": "VESSEL_ID",
          "spatial-resolution": "HIGH",
          "temporal-resolution": "HOURLY"
        }
      }
    ],
    "config_hash": "6c2f254e51a9e4c10c10a8757a5cb8b494eeffbad6ee509f6510f03dd3646dae"
  },
  "context_layers": {
    "EEZ": {
      "dataset": "World_EEZ_20231025_LR",
      "version": "v12",
      "enrichments": [
        {
          "id": "5674",
          "label": "Danish Exclusive Economic Zone"
        }
      ]
    },
    "MPA": {
      "dataset": "WDPA_WDOECM_APR2026",
      "version": "v1.6",
      "enrichments": [
        {
          "id": "555522525",
          "label": "Hvideodde Rev"
        },
        {
          "id": "555543143",
          "label": "Hvideodde Rev"
        },
        {
          "id": "555790698",
          "label": "Rønne Banke"
        }
      ]
    },
    "Bathymetry": {
      "dataset": "gebco_2025_sub_ice_topo",
      "version": "v2.7",
      "enrichments": [
        {
          "value": "-13"
        }
      ]
    }
  },
  "distance_to_coast_km": 1.53,
  "scoring": {
    "triage_score": 1,
    "uncertainty_score": 0.43,
    "reason_codes": [
      "missing_confidence_proxy",
      "low_confidence_tier",
      "inside_eez",
      "inside_mpa",
      "near_coast",
      "bathymetry_shallow_eez_hotspot",
      "bathymetry_mpa_shallow_zone"
    ]
  },
  "geom": {
    "type": "Point",
    "coordinates": [
      14.67,
      55.12
    ]
  },
  "rejected": false,
  "hotspot": {
    "cell_id": "851f2a63fffffff",
    "signals": {
      "recurrence_count": 0,
      "time_bins_with_unmatched": 0,
      "hotspot_strength": "low"
    }
  }
}

export const eventSchema_ais_offshore: any = {
  "version": "1.0.0",
  "event_id": "732c171f04b18fbe86b5ea2961de8ccb49ddab408e6a9f34bee938ec59332e45",
  "timestamp_utc": "2025-12-07T00:00:00Z",
  "confidence_proxy": null,
  "confidence_tier": "low",
  "lat": 55.25,
  "lon": 14.35,
  "source": "public-global-vessel-identity:v3.0",
  "raw_metadata": {
    "callsign": "OWHH2",
    "dataset": "public-global-vessel-identity:v3.0",
    "date": "2025-12-07 00:00",
    "entryTimestamp": "2025-12-07T00:00:00Z",
    "exitTimestamp": "2025-12-07T00:00:00Z",
    "firstTransmissionDate": "2018-05-14T09:48:55Z",
    "flag": "DNK",
    "geartype": "CARGO",
    "hours": 1,
    "imo": "9775763",
    "lastTransmissionDate": "2026-05-09T23:59:58Z",
    "lat": 55.25,
    "lon": 14.350000381469727,
    "mmsi": "219115000",
    "shipName": "VENTA MAERSK",
    "vesselId": "031efabc0-0d3f-60a5-157b-1a353613ccc0",
    "vesselType": "CARGO"
  },
  "raw_event_metadata": null,
  "run_metadata": {
    "code_version": "8dba6b88e30010ac07c1ac5be9d446392087c8df",
    "config_json": [
      {
        "URL": "https://gateway.api.globalfishingwatch.org/v3/4wings/report/",
        "body_params": {
          "geojson": {
            "coordinates": [
              [
                [
                  14.11,
                  55.26
                ],
                [
                  14.68,
                  55.27
                ],
                [
                  14.69,
                  55.11
                ],
                [
                  14.09,
                  55.08
                ],
                [
                  14.11,
                  55.26
                ]
              ]
            ],
            "type": "Polygon"
          }
        },
        "hotspot": {
          "resolution": 5,
          "timeBin": "HOURLY"
        },
        "method": "POST",
        "output": "data/out/",
        "threshold": {
          "deep_water_threshold": -200,
          "high_triage_score_threshold": 0.85,
          "low_confidence_proxy_threshold": 2,
          "low_triage_score_threshold": 0.3,
          "medium_triage_score_threshold": 0.6,
          "near_coast_threshold": 10,
          "shallow_water_threshold": -50
        },
        "url_params": {
          "datasets[0]": "public-global-presence:v3.0",
          "date-range": "2025-12-07T00:00:00Z,2025-12-07T23:59:59Z",
          "filters[0]": "",
          "format": "JSON",
          "group-by": "VESSEL_ID",
          "spatial-resolution": "HIGH",
          "temporal-resolution": "HOURLY"
        }
      }
    ],
    "config_hash": "6c2f254e51a9e4c10c10a8757a5cb8b494eeffbad6ee509f6510f03dd3646dae"
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
    },
    "Bathymetry": {
      "dataset": "gebco_2025_sub_ice_topo",
      "version": "v2.7",
      "enrichments": [
        {
          "value": "-44"
        }
      ]
    }
  },
  "distance_to_coast_km": 18.95,
  "scoring": {
    "triage_score": 0.74,
    "uncertainty_score": 0.43,
    "reason_codes": [
      "missing_confidence_proxy",
      "low_confidence_tier",
      "inside_eez",
      "bathymetry_shallow_eez_hotspot",
      "bathymetry_cargo_anomaly_zone"
    ]
  },
  "geom": {
    "type": "Point",
    "coordinates": [
      14.35,
      55.25
    ]
  },
  "rejected": false,
  "hotspot": {
    "cell_id": "851f2a47fffffff",
    "signals": {
      "recurrence_count": 0,
      "time_bins_with_unmatched": 0,
      "hotspot_strength": "low"
    }
  }
}

export const eventSchema_fishing_near_coast: any = {
  "version": "1.0.0",
  "event_id": "7bb8f5da9fa15614323f325af3022089e0e30ec20ff65cf99f94b9299ebe3bc6",
  "timestamp_utc": "2025-12-07T23:00:00Z",
  "confidence_proxy": null,
  "confidence_tier": "low",
  "lat": 28.84,
  "lon": 48.38,
  "source": "public-global-vessel-identity:v3.0",
  "raw_metadata": {
    "callsign": "9KZA",
    "dataset": "public-global-vessel-identity:v3.0",
    "date": "2025-12-07 23:00",
    "entryTimestamp": "2025-12-07T23:00:00Z",
    "exitTimestamp": "2025-12-07T23:00:00Z",
    "firstTransmissionDate": "2024-07-14T06:15:25Z",
    "flag": "KWT",
    "geartype": "TRAWLERS",
    "hours": 1.0002777777777778,
    "imo": "",
    "lastTransmissionDate": "2025-12-27T13:40:41Z",
    "lat": 28.84,
    "lon": 48.380001068115234,
    "mmsi": "447637000",
    "shipName": "447637000",
    "vesselId": "010cee64e-e6c8-0e8c-d1f5-ff8651ec7dbe",
    "vesselType": "FISHING"
  },
  "raw_event_metadata": null,
  "run_metadata": {
    "code_version": "8dba6b88e30010ac07c1ac5be9d446392087c8df",
    "config_json": [
      {
        "URL": "https://gateway.api.globalfishingwatch.org/v3/4wings/report/",
        "body_params": {
          "region": {
            "dataset": "public-eez-areas",
            "id": "8357"
          }
        },
        "hotspot": {
          "resolution": 5,
          "timeBin": "HOURLY"
        },
        "method": "POST",
        "output": "data/out/",
        "threshold": {
          "deep_water_threshold": -200,
          "high_triage_score_threshold": 0.85,
          "low_confidence_proxy_threshold": 2,
          "low_triage_score_threshold": 0.3,
          "medium_triage_score_threshold": 0.6,
          "near_coast_threshold": 10,
          "shallow_water_threshold": -50
        },
        "url_params": {
          "datasets[0]": "public-global-fishing-effort:v3.0",
          "date-range": "2025-12-07T23:00:00Z,2025-12-07T23:59:59Z",
          "filters[0]": "",
          "format": "JSON",
          "group-by": "VESSEL_ID",
          "spatial-resolution": "HIGH",
          "temporal-resolution": "HOURLY"
        }
      }
    ],
    "config_hash": "dbb73d867ffda5cb8b89629ff2d71ce84a65f30f54bcf0031eec0cd5b2d5500c"
  },
  "context_layers": {
    "EEZ": {
      "dataset": "World_EEZ_20231025_LR",
      "version": "v12",
      "enrichments": [
        {
          "id": "8357",
          "label": "Kuwaiti Exclusive Economic Zone"
        }
      ]
    },
    "MPA": {
      "dataset": "WDPA_WDOECM_APR2026",
      "version": "v1.6",
      "enrichments": []
    },
    "Bathymetry": {
      "dataset": "gebco_2025_sub_ice_topo",
      "version": "v2.7",
      "enrichments": [
        {
          "value": "-17"
        }
      ]
    }
  },
  "distance_to_coast_km": 8.83,
  "scoring": {
    "triage_score": 0.84,
    "uncertainty_score": 0.43,
    "reason_codes": [
      "missing_confidence_proxy",
      "low_confidence_tier",
      "inside_eez",
      "near_coast",
      "bathymetry_shallow_eez_hotspot"
    ]
  },
  "geom": {
    "type": "Point",
    "coordinates": [
      48.38,
      28.84
    ]
  },
  "rejected": false,
  "hotspot": {
    "cell_id": "855364cbfffffff",
    "signals": {
      "recurrence_count": 0,
      "time_bins_with_unmatched": 0,
      "hotspot_strength": "low"
    }
  }
}

export const eventSchema_fishing_offshore: any = {
  "version": "1.0.0",
  "event_id": "7b72e7ae5e71010d90bdf8a2d5f91dd52879c4d26041f6a9dba3f3db94d63153",
  "timestamp_utc": "2025-12-07T23:00:00Z",
  "confidence_proxy": null,
  "confidence_tier": "low",
  "lat": 29.04,
  "lon": 48.74,
  "source": "public-global-vessel-identity:v3.0",
  "raw_metadata": {
    "callsign": "9KAG3",
    "dataset": "public-global-vessel-identity:v3.0",
    "date": "2025-12-07 23:00",
    "entryTimestamp": "2025-12-07T23:00:00Z",
    "exitTimestamp": "2025-12-07T23:00:00Z",
    "firstTransmissionDate": "2024-07-16T16:28:50Z",
    "flag": "KWT",
    "geartype": "TRAWLERS",
    "hours": 0.8,
    "imo": "",
    "lastTransmissionDate": "2026-05-07T09:57:07Z",
    "lat": 29.04,
    "lon": 48.7400016784668,
    "mmsi": "447712000",
    "shipName": "",
    "vesselId": "a7ceef583-3a0a-bd1d-179a-8ea2f9c9b250",
    "vesselType": "FISHING"
  },
  "raw_event_metadata": null,
  "run_metadata": {
    "code_version": "8dba6b88e30010ac07c1ac5be9d446392087c8df",
    "config_json": [
      {
        "URL": "https://gateway.api.globalfishingwatch.org/v3/4wings/report/",
        "body_params": {
          "region": {
            "dataset": "public-eez-areas",
            "id": "8357"
          }
        },
        "hotspot": {
          "resolution": 5,
          "timeBin": "HOURLY"
        },
        "method": "POST",
        "output": "data/out/",
        "threshold": {
          "deep_water_threshold": -200,
          "high_triage_score_threshold": 0.85,
          "low_confidence_proxy_threshold": 2,
          "low_triage_score_threshold": 0.3,
          "medium_triage_score_threshold": 0.6,
          "near_coast_threshold": 10,
          "shallow_water_threshold": -50
        },
        "url_params": {
          "datasets[0]": "public-global-fishing-effort:v3.0",
          "date-range": "2025-12-07T23:00:00Z,2025-12-07T23:59:59Z",
          "filters[0]": "",
          "format": "JSON",
          "group-by": "VESSEL_ID",
          "spatial-resolution": "HIGH",
          "temporal-resolution": "HOURLY"
        }
      }
    ],
    "config_hash": "dbb73d867ffda5cb8b89629ff2d71ce84a65f30f54bcf0031eec0cd5b2d5500c"
  },
  "context_layers": {
    "EEZ": {
      "dataset": "World_EEZ_20231025_LR",
      "version": "v12",
      "enrichments": [
        {
          "id": "8357",
          "label": "Kuwaiti Exclusive Economic Zone"
        }
      ]
    },
    "MPA": {
      "dataset": "WDPA_WDOECM_APR2026",
      "version": "v1.6",
      "enrichments": []
    },
    "Bathymetry": {
      "dataset": "gebco_2025_sub_ice_topo",
      "version": "v2.7",
      "enrichments": [
        {
          "value": "-31"
        }
      ]
    }
  },
  "distance_to_coast_km": 47.17,
  "scoring": {
    "triage_score": 0.54,
    "uncertainty_score": 0.43,
    "reason_codes": [
      "missing_confidence_proxy",
      "low_confidence_tier",
      "inside_eez",
      "bathymetry_shallow_eez_hotspot"
    ]
  },
  "geom": {
    "type": "Point",
    "coordinates": [
      48.74,
      29.04
    ]
  },
  "rejected": false,
  "hotspot": {
    "cell_id": "8553648bfffffff",
    "signals": {
      "recurrence_count": 0,
      "time_bins_with_unmatched": 0,
      "hotspot_strength": "low"
    }
  }
}
