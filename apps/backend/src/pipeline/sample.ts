//import pilot from '../config/pilot.json';
import { createEventSchema } from './normalize/schema';
import { isMatchedCase } from './normalize/validation';
import {
  csvString,
  getEventMissingness,
  getGeoMax,
  getGeoMin,
  getMatchingStats,
  getTimeRange,
  sortEventSchema,
} from '../helpers/utils/backendUtils';
import { detectionGetGFW, detectionPostGFW } from './ingest/detections';
import fs from 'fs';
import {
  IConfigJSON,
  I4wingsAPIResponse,
  IEventAPIResponse,
  IEventGetURLParams,
  IEventPostBodyParams,
  IEventPostURLParams,
  IPortVisitEvent,
  FeatureCollection,
  IGeometry,
} from '@packages/types';
import {
  EGeoCoordinate,
  EReasonCodes,
  EReasonCodesStatic,
} from '@packages/enum';
import { deepSortObject } from '@packages/utils';
import {
  getGitCommitSHA,
  getEntriesFrom4wingsResponse,
  getSourceFrom4wingsResponse,
  log,
} from '../helpers/utils/backendUtils';
import { ELogType, IEventProperties } from '../helpers/types/generalTypes';
import { writeParquet } from '../helpers/utils/parquetUtils';
import {
  parquetSchema,
  parquetSchema_hotspot,
  parquetSchema_raw_metadata,
} from '../helpers/types/parquetTypes';
import { featureFromHotspot, generateHotspots } from './aggregate/hotspots';
import {
  EValidationStrata,
  IValidationManifest,
  IValidationSample,
  IValidationStrata,
} from '../helpers/types/validationTypes';
import {
  getValidationSamples,
  postValidationSamples,
} from './validation/sample';
import { 
  readCoastlinePolylines, 
  readLandPolygons, 
  readEEZPolygons, 
  readMPAPolygons, 
  readBathymetryTiles
} from '../helpers/utils/datasetUtils';
import { distanceToCoast, isNearCoast } from './features/coast_distance';
import { generateRunMetadata } from './normalize/generation';
const args = process.argv.slice(2);

export const coastlinePolylines = readCoastlinePolylines();
export const landPolygons = readLandPolygons();
export const eezPolygons = readEEZPolygons();
export const mpaPolygons = readMPAPolygons();

const main = async () => {
  log('Pilot starting...', ELogType.info);
  await readBathymetryTiles()
  const dataset4wings = source4wings.split(':')[0] ?? '';
  const dataset4wingsVersion = source4wings.split(':')[1] ?? '';

  const baseURLEvent = pilot.eventURL ?? '';
  const sourceEvent = pilot.eventSource ?? '';
  const bodyParams4wings = pilot.aoi as any;
  const urlParams4wings = {
    'spatial-resolution': pilot['spatial-resolution'],
    'temporal-resolution': pilot['temporal-resolution'],
    'datasets[0]': pilot.source,
    'date-range': `${pilot.startDate},${pilot.endDate}`,
    format: pilot.format,
    'group-by': pilot['group-by'],
    'filters[0]': pilot.filters,
  } as any;

  let geometry: any;
  if ((pilot.aoi as any).geojson) {
    geometry = {
      type: (pilot.aoi as any).geojson.type,
      coordinates: (pilot.aoi as any).geojson.coordinates,
    } as any;
  }

  const startDate = `${pilot.startDate}`;
  const endDate = `${pilot.endDate}`;
  let events = [];
  const configuration = new Set<IConfigJSON>();
  const resp4wings = await detectionPostGFW<I4wingsAPIResponse>(
    baseURL4wings,
    source4wings,
    urlParams4wings,
    bodyParams4wings,
  );

  const key4wings = getSourceFrom4wingsResponse(
    resp4wings.results,
    dataset4wings,
  );
  const entries4wings = getEntriesFrom4wingsResponse(
    resp4wings.results,
    key4wings,
  );

  if (!entries4wings) {
    log('Pilot finished with no entry.', ELogType.info);
    return;
  }

  log(`Preparing event schema for ${entries4wings.length} entries...`, ELogType.info);

  for (const entries4wing of entries4wings) {
    const thisEntry = entries4wing;
    configuration.clear();
    configuration.add(resp4wings.metadata);

    try {
      const eventSchema = await createEventSchema(configuration, resolution, thisEntry);
      //console.log('Event Schema', eventSchema);
      events.push(eventSchema);
    } catch (error) {
      console.error('Event Schema error', error);
    }
  }

  log(`Preparing outputs in ${output}...`, ELogType.info);

  const notRejectedEvents = events.filter((e) => !e.rejected);
  const sortedEvents = sortEventSchema(notRejectedEvents);
  const hotspots = generateHotspots(sortedEvents, resolution);

  //event.geojson
  const geojson: FeatureCollection<IGeometry, IEventProperties> = {
    type: 'FeatureCollection',
    features: sortedEvents.map((event) => ({
      type: 'Feature',
      properties: {
        event_id: event.event_id,
        timestamp_utc: event.timestamp_utc,
        matched_flag: event.matched_flag,
        lat: event.lat,
        lon: event.lon,
        confidence_proxy: event.confidence_proxy,
        distance_to_coast_km: event.distance_to_coast_km,
        context_layers: event.context_layers,
        scoring: event.scoring
      },
      geometry: event.geom,
    })),
  };
  fs.writeFileSync(`${output}events.geojson`, JSON.stringify(geojson, null, 2));

  //event.parquet
  const rows = sortedEvents.map((event) => {
    const reason_codes = event.scoring.reason_codes;
    let edge_case_flags: { [key in EReasonCodes]?: boolean } = {
      [EReasonCodesStatic.near_coast]: false,
      [EReasonCodesStatic.low_detection_confidence]: false,
      [EReasonCodesStatic.missing_confidence_proxy]: false,
      [EReasonCodesStatic.inside_eez]: false,
      [EReasonCodesStatic.inside_mpa]: false,
      [EReasonCodesStatic.unmatched_to_public_ais]: false,
      [EReasonCodesStatic.matched_to_public_ais]: false,
      [EReasonCodesStatic.noisy_vessel]: false,
    };

    if (reason_codes) {
      for (const reason_code of reason_codes) {
        edge_case_flags[reason_code] = true;
      }
    }

    return {
      event_id: event.event_id,
      timestamp_utc: event.timestamp_utc,
      matched_flag: event.matched_flag,
      lat: event.lat,
      lon: event.lon,
      confidence_proxy: event.confidence_proxy ?? null,
      distance_to_coast_km: event.distance_to_coast_km,
      context_layers: event.context_layers,
      triage_score: event.scoring.triage_score ?? null,
      uncertainty_score: event.scoring.uncertainty_score ?? null,
      bathymetry_m: event.context_layers.Bathymetry.enrichments[0].value,
      ...edge_case_flags,
    };
  });
  await writeParquet(rows, parquetSchema, `${output}events.parquet`);

  //run_metadata.json
  const run_metadata = {
    config: sortedEvents
      .map((event) => ({
        hash: event.run_metadata.config_hash,
        json: deepSortObject(event.run_metadata.config_json) as IConfigJSON[],
      }))
      .sort((a, b) => a.hash.localeCompare(b.hash)),
    run_time: new Date().toISOString(),
    data_source_versions: [source4wings, sourceEvent],
    git_commit_hash: await getGitCommitSHA(),
  };
  fs.writeFileSync(
    `${output}run_metadata.json`,
    JSON.stringify(run_metadata, null, 2),
  );

  //raw_metadata.json
  const raw_metadata = sortedEvents.map((event) => ({
    ...event.raw_metadata,
    event_metadata: event.raw_event_metadata,
  }));
  fs.writeFileSync(
    `${output}raw_metadata.json`,
    JSON.stringify(raw_metadata, null, 2),
  );

  //raw_metadata.parquet
  const rows_raw_metadata = raw_metadata.map((r) => ({
    ...r,
    event_metadata: r.event_metadata ? JSON.stringify(r.event_metadata) : null,
  }));
  await writeParquet(
    rows_raw_metadata,
    parquetSchema_raw_metadata,
    `${output}raw_metadata.parquet`,
  );

  //canonicalSchema.json
  fs.writeFileSync(
    `${output}canonicalSchema.json`,
    JSON.stringify(sortedEvents, null, 2),
  );

  //data_quality.json
  const missingnesses = getEventMissingness(geojson.features);
  const latitudeMin = getGeoMin(EGeoCoordinate.latitude, geojson.features);
  const longitudeMin = getGeoMin(EGeoCoordinate.longitude, geojson.features);
  const latitudeMax = getGeoMax(EGeoCoordinate.latitude, geojson.features);
  const longitudeMax = getGeoMax(EGeoCoordinate.longitude, geojson.features);
  const time_range = getTimeRange(geojson.features);
  const matching_stats = getMatchingStats(geojson.features)
  const data_quality = {
    row_count: geojson.features.length,
    matching_stats: matching_stats,
    missingness: missingnesses,
    geo_sanity: {
      latitude: {
        min: latitudeMin,
        max: latitudeMax,
      },
      longitude: {
        min: longitudeMin,
        max: longitudeMax,
      },
    },
    time_range: time_range,
  };
  fs.writeFileSync(
    `${output}data_quality.json`,
    JSON.stringify(data_quality, null, 2),
  );

  //hotspots.geojson
  const hotspotsGeoJSON = featureFromHotspot(hotspots);
  fs.writeFileSync(
    `${output}hotspots.geojson`,
    JSON.stringify(hotspotsGeoJSON, null, 2),
  );

  //hotspots.parquet
  await writeParquet(
    hotspots,
    parquetSchema_hotspot,
    `${output}hotspots.parquet`,
  );

  log('Pilot finished.', ELogType.info);
};

const validation = async () => {
  log('Starting validation...', ELogType.info);
  await readBathymetryTiles()
  const mapStrata = new Map<EValidationStrata, IValidationStrata>();
  const setManifest = new Set<IValidationManifest>();

  try {
    log(
      `Getting samples for ${EValidationStrata.distance_to_coast} strata...`,
      ELogType.info,
    );
    const strata_1_url = {
      'spatial-resolution': 'HIGH',
      'temporal-resolution': 'HOURLY',
      'datasets[0]': 'public-global-sar-presence:v3.0',
      format: 'JSON',
      'group-by': 'VESSEL_ID',
      'filters[0]': "matched='false'",
      'date-range': '2025-01-01T00:00:00Z,2025-12-07T23:59:59Z',
      'region-dataset': 'public-eez-areas',
      'region-id': 5669,
    } as any;

    const strata_1_samples = await getValidationSamples(
      baseURL4wings,
      source4wings,
      strata_1_url,
      50,
      resolution
    );

    let near_coast: IValidationSample[] = [];
    let offshore: IValidationSample[] = [];
    for (const s of strata_1_samples.validationSamples) {
      const distance = distanceToCoast(coastlinePolylines, s.lon, s.lat);
      if (isNearCoast(distance)) {
        near_coast.push(s);
      } else {
        offshore.push(s);
      }
    }
    const strata_1_csv = csvString(
      'Near coast',
      near_coast,
      'Offshore',
      offshore,
    );

    mapStrata.set(EValidationStrata.distance_to_coast, {
      geoJSON: strata_1_samples.validationSamplesGeoJSON,
      csv: strata_1_csv + '\n' + '\n',
    });

    const configSets = new Set<IConfigJSON>();
    configSets.add(strata_1_samples.metadata);
    const strata_1_manifest: IValidationManifest = {
      strata: EValidationStrata.distance_to_coast,
      stratum_sample_sizes: {
        near_coast: near_coast.length,
        offshore: offshore.length,
      },
      run_metadata: await generateRunMetadata(configSets),
    };
    setManifest.add(strata_1_manifest);

    log(
      `Getting samples for ${EValidationStrata.distance_to_coast} strata done.`,
      ELogType.info,
    );
  } catch (error) {
    log(
      `[validation] Failed to get samples for ${EValidationStrata.distance_to_coast}`,
      ELogType.info,
    );
    return;
  }

  try {
    log(
      `Getting samples for ${EValidationStrata.confidence_tier} strata...`,
      ELogType.info,
    );
    const strata_2_url_1 = {
      'spatial-resolution': 'HIGH',
      'temporal-resolution': 'HOURLY',
      'datasets[0]': 'public-global-sar-presence:v3.0',
      format: 'JSON',
      'group-by': 'VESSEL_ID',
      'filters[0]': "matched='false'",
      'date-range': '2025-12-07T00:00:00Z,2025-12-07T23:59:59Z',
      'region-dataset': 'public-eez-areas',
      'region-id': 5669,
    } as any;

    const strata_2_url_2 = {
      'spatial-resolution': 'HIGH',
      'temporal-resolution': 'HOURLY',
      'datasets[0]': 'public-global-sar-presence:v3.0',
      format: 'JSON',
      'group-by': 'VESSEL_ID',
      'filters[0]': "matched='false'",
      'date-range': '2018-12-07T00:00:00Z,2018-12-07T23:59:59Z',
      'region-dataset': 'public-eez-areas',
      'region-id': 5669,
    } as any;

    const strata_2_samples_1 = await getValidationSamples(
      baseURL4wings,
      source4wings,
      strata_2_url_1,
      25,
      resolution
    );

    const strata_2_samples_2 = await getValidationSamples(
      baseURL4wings,
      source4wings,
      strata_2_url_2,
      25,
      resolution
    );

    const strata_2_csv = csvString(
      'High Confidence',
      strata_2_samples_1.validationSamples,
      'Low Confidence',
      strata_2_samples_2.validationSamples,
    );

    mapStrata.set(EValidationStrata.confidence_tier, {
      geoJSON: [
        ...strata_2_samples_1.validationSamplesGeoJSON,
        ...strata_2_samples_2.validationSamplesGeoJSON,
      ],
      csv: strata_2_csv + '\n' + '\n',
    });

    const configSets = new Set<IConfigJSON>();
    configSets.add(strata_2_samples_1.metadata);
    configSets.add(strata_2_samples_2.metadata);
    const strata_2_manifest: IValidationManifest = {
      strata: EValidationStrata.confidence_tier,
      stratum_sample_sizes: {
        high_confidence: strata_2_samples_1.validationSamples.length,
        low_confidence: strata_2_samples_2.validationSamples.length,
      },
      run_metadata: await generateRunMetadata(configSets),
    };
    setManifest.add(strata_2_manifest);

    log(
      `Getting samples for ${EValidationStrata.confidence_tier} strata done.`,
      ELogType.info,
    );
  } catch (error) {
    log(
      `[validation] Failed to get samples for ${EValidationStrata.confidence_tier}`,
      ELogType.info,
    );
    return;
  }

  try {
    log(
      `Getting samples for ${EValidationStrata.density} strata...`,
      ELogType.info,
    );
    const strata_3_url_1 = {
      'spatial-resolution': 'HIGH',
      'temporal-resolution': 'HOURLY',
      'datasets[0]': 'public-global-sar-presence:v3.0',
      format: 'JSON',
      'group-by': 'VESSEL_ID',
      'filters[0]': "matched='false'",
      'date-range': '2025-07-07T00:00:00Z,2025-12-07T23:59:59Z',
    } as any;

    // English Channel
    const strata_3_body_1 = {
      geojson: {
        type: 'Polygon',
        coordinates: [
          [
            [0.5, 50.5],
            [2.5, 50.5],
            [2.5, 51.5],
            [0.5, 51.5],
            [0.5, 50.5],
          ],
        ],
      },
    };

    const strata_3_url_2 = {
      'spatial-resolution': 'HIGH',
      'temporal-resolution': 'HOURLY',
      'datasets[0]': 'public-global-sar-presence:v3.0',
      format: 'JSON',
      'group-by': 'VESSEL_ID',
      'filters[0]': "matched='false'",
      'date-range': '2025-07-07T00:00:00Z,2025-12-07T23:59:59Z',
    } as any;

    // Open Atlantic Ocean
    const strata_3_body_2 = {
      geojson: {
        type: 'Polygon',
        coordinates: [
          [
            [-32.0, 34.0],
            [-28.0, 34.0],
            [-28.0, 38.0],
            [-32.0, 38.0],
            [-32.0, 34.0],
          ],
        ],
      },
    };

    const strata_3_samples_1 = await postValidationSamples(
      baseURL4wings,
      source4wings,
      strata_3_url_1,
      strata_3_body_1 as any,
      25,
      resolution
    );

    const strata_3_samples_2 = await postValidationSamples(
      baseURL4wings,
      source4wings,
      strata_3_url_2,
      strata_3_body_2 as any,
      25,
      resolution
    );

    const strata_3_csv = csvString(
      'High Density',
      strata_3_samples_1.validationSamples,
      'Low Density',
      strata_3_samples_2.validationSamples,
    );

    mapStrata.set(EValidationStrata.density, {
      geoJSON: [
        ...strata_3_samples_1.validationSamplesGeoJSON,
        ...strata_3_samples_2.validationSamplesGeoJSON,
      ],
      csv: strata_3_csv + '\n' + '\n',
    });

    const configSets = new Set<IConfigJSON>();
    configSets.add(strata_3_samples_1.metadata);
    configSets.add(strata_3_samples_2.metadata);
    const strata_3_manifest: IValidationManifest = {
      strata: EValidationStrata.density,
      stratum_sample_sizes: {
        high_density: strata_3_samples_1.validationSamples.length,
        low_density: strata_3_samples_2.validationSamples.length,
      },
      run_metadata: await generateRunMetadata(configSets),
    };
    setManifest.add(strata_3_manifest);

    log(
      `Getting samples for ${EValidationStrata.density} strata done.`,
      ELogType.info,
    );
  } catch (error) {
    log(
      `[validation] Failed to get samples for ${EValidationStrata.density}`,
      ELogType.info,
    );
    return;
  }

  log(`Generating outputs in ${output}...`, ELogType.info);

  //validation_sample.geojson
  const geoJSON_strata = Array.from(mapStrata).flatMap(
    ([key, value]) => value.geoJSON,
  );
  fs.writeFileSync(
    `${output}validation_sample.geojson`,
    JSON.stringify(geoJSON_strata, null, 2),
  );

  //validation_sample.csv
  const csv_strata = Array.from(mapStrata).flatMap(([key, value]) => value.csv);
  const csv_strata_string = csv_strata.join(' ');
  fs.writeFileSync(`${output}validation_sample.csv`, csv_strata_string, 'utf8');

  log('Validation finished.', ELogType.info);

  //validation_manifest.json
  const manifest_strata = Array.from(setManifest);
  fs.writeFileSync(
    `${output}validation_manifest.json`,
    JSON.stringify(manifest_strata, null, 2),
  );
};

const configIndex = args.indexOf('--config');
let configPath = null;

if (configIndex !== -1 && args[configIndex + 1]) {
  configPath = args[configIndex + 1];
} else {
  configPath = "src/config/pilot.json";
}
const pilot = JSON.parse( fs.readFileSync(configPath, 'utf8'))
if(!pilot){
  throw new Error(`Config file not found: ${configPath}`);
}
const baseURL4wings = pilot.URL;
const source4wings = pilot.source as any;
const output = pilot.output;
const resolution = pilot.hotspotResolution

if (args.includes('--main')) {
  main().catch(console.error);
} else if (args.includes('--validation')) {
  validation().catch(console.error);
}
