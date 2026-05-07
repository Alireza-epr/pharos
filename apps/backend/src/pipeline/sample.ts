import { createEventSchema } from './schema/main';
import {
  csvString,
  formatTimestamp,
  getEventMissingness,
  getGeoMax,
  getGeoMin,
  getGitCommitSHA,
  getMatchingStats,
  getTimeRange,
  sortEventSchema,
} from '../helpers/utils/backendUtils';
import { detectionGFW } from './ingest/detections';
import fs from 'fs';
import {
  IConfigJSON,
  I4wingsAPIResponse,
  FeatureCollection,
  IGeometry,
  IHotspot,
} from '@packages/types';
import {
  EGeoCoordinate,
  EReasonCodes,
  EReasonCodesStatic,
} from '@packages/enum';
import {
  getEntriesFrom4wingsResponse,
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
import { validationSamples } from './validation/main';
import {
  readCoastlinePolylines,
  readLandPolygons,
  readEEZPolygons,
  readMPAPolygons,
  readBathymetryTiles,
} from '../helpers/utils/datasetUtils';
import { distanceToCoast, isNearCoast } from './features/coast_distance';
import { generateRunMetadata } from './normalize/generation';
import { export_run_metadata } from './export/export';
import { getExecutionDuration } from '@packages/utils';
const args = process.argv.slice(2);

export const coastlinePolylines = readCoastlinePolylines();
export const landPolygons = readLandPolygons();
export const eezPolygons = readEEZPolygons();
export const mpaPolygons = readMPAPolygons();
export let gitCommitSHA = '';

const main = async (a_Config: IConfigJSON) => {
  log('Pilot starting...', ELogType.info);
  const start = formatTimestamp();
  await readBathymetryTiles();
  gitCommitSHA = await getGitCommitSHA();


  const resp4wings = await detectionGFW<I4wingsAPIResponse>(
    a_Config
  );

  const entriesMap = getEntriesFrom4wingsResponse(a_Config, resp4wings)
  const entries = Array.from(entriesMap).flatMap(([source, entries]) => entries)

  if (entries.length == 0) {
    log('Pilot finished with no entry.', ELogType.info);
    return;
  }

  log(
    `Exporting raw metadata to ${a_Config.output}; no. entry: ${entries.length}`,
    ELogType.info,
  );

  //raw_metadata.json
  fs.writeFileSync(
    `${a_Config.output}raw_metadata.json`,
    JSON.stringify(entries, null, 2),
  );

  //raw_metadata.parquet
  await writeParquet(
    entries,
    parquetSchema_raw_metadata,
    `${a_Config.output}raw_metadata.parquet`,
  );

  log(`Creating event schemas.`, ELogType.info);
  let events = []
  for (const entries4wing of entries) {
    const thisEntry = entries4wing;

    try {
      const eventSchema = await createEventSchema(
        a_Config,
        thisEntry,
      );
      //console.log('Event Schema', eventSchema);
      if (eventSchema.rejected) {
        log(`Entry is rejected: ${eventSchema.reason}`, ELogType.error);
      }
      events.push(eventSchema);
    } catch (error) {
      console.error('Event Schema error', error);
    }
  }

  const notRejectedEvents = events.filter((e) => !e.rejected);

  if (notRejectedEvents.length == 0) {
    log('Pilot quit because no valid entry was found.', ELogType.info);
    return;
  }

  const sortedEvents = sortEventSchema(notRejectedEvents);
  const hotspots = generateHotspots(a_Config, sortedEvents);

  log(
    `Exporting outputs to ${a_Config.output}; no. entry: ${notRejectedEvents.length}`,
    ELogType.info,
  );

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
        scoring: event.scoring,
      },
      geometry: event.geom,
    })),
  };
  fs.writeFileSync(`${a_Config.output}events.geojson`, JSON.stringify(geojson, null, 2));

  //event.parquet
  const rows = sortedEvents.map((event) => {
    const reason_codes = event.scoring.reason_codes;
    let edge_case_flags: { [key in EReasonCodes]?: boolean } =
      Object.fromEntries(
        Object.keys(EReasonCodesStatic).map((key) => [key, false]),
      );

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
      bathymetry_m: event.context_layers.Bathymetry.enrichments[0].value,
      triage_score: event.scoring.triage_score ?? null,
      uncertainty_score: event.scoring.uncertainty_score ?? null,
      ...edge_case_flags,
    };
  });
  await writeParquet(rows, parquetSchema, `${a_Config.output}events.parquet`);

  //canonicalSchema.json
  fs.writeFileSync(
    `${a_Config.output}canonicalSchema.json`,
    JSON.stringify(sortedEvents, null, 2),
  );

  //data_quality.json
  const missingnesses = getEventMissingness(geojson.features);
  const latitudeMin = getGeoMin(EGeoCoordinate.latitude, geojson.features);
  const longitudeMin = getGeoMin(EGeoCoordinate.longitude, geojson.features);
  const latitudeMax = getGeoMax(EGeoCoordinate.latitude, geojson.features);
  const longitudeMax = getGeoMax(EGeoCoordinate.longitude, geojson.features);
  const time_range = getTimeRange(geojson.features);
  const matching_stats = getMatchingStats(geojson.features);
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
    `${a_Config.output}data_quality.json`,
    JSON.stringify(data_quality, null, 2),
  );

  //hotspots.geojson
  const hotspotsGeoJSON: FeatureCollection<IGeometry, IHotspot> = {
    type: "FeatureCollection",
    features: featureFromHotspot(hotspots)
  };
  fs.writeFileSync(
    `${a_Config.output}hotspots.geojson`,
    JSON.stringify(hotspotsGeoJSON, null, 2),
  );

  //hotspots.parquet
  await writeParquet(
    hotspots,
    parquetSchema_hotspot,
    `${a_Config.output}hotspots.parquet`,
  );

  //run_metadata.json
  const end = formatTimestamp();
  const run_metadata = await export_run_metadata(sortedEvents, start, end);
  fs.writeFileSync(
    `${a_Config.output}run_metadata.json`,
    JSON.stringify(run_metadata, null, 2),
  );

  log('Pilot finished.', ELogType.info);
};

const validation = async (a_Configs: Record<EValidationStrata, IConfigJSON[]>) => {
  log('Starting validation...', ELogType.info);
  gitCommitSHA = await getGitCommitSHA();
  await readBathymetryTiles();
  const mapStrata = new Map<EValidationStrata, IValidationStrata>();
  const setManifest = new Set<IValidationManifest>();

  try {
    log(
      `Getting samples for ${EValidationStrata.distance_to_coast} strata...`,
      ELogType.info,
    );
    const strata_1_start = formatTimestamp();
    const strata_1_samples = await validationSamples(
      a_Configs[EValidationStrata.distance_to_coast][0],
      50,
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

    const strata_1_end = formatTimestamp();
    const strata_1_manifest: IValidationManifest = {
      strata: EValidationStrata.distance_to_coast,
      stratum_sample_sizes: {
        near_coast: near_coast.length,
        offshore: offshore.length,
      },
      run_metadata: await generateRunMetadata(a_Configs[EValidationStrata.distance_to_coast]),
      execution_duration_sec: Math.floor(
        getExecutionDuration(strata_1_start, strata_1_end) / 1000,
      ),
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
    const strata_2_start = formatTimestamp();
    const strata_2_samples_1 = await validationSamples(
      a_Configs[EValidationStrata.confidence_tier][0],
      25,
    );

    const strata_2_samples_2 = await validationSamples(
      a_Configs[EValidationStrata.confidence_tier][1],
      25,
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

    const strata_2_end = formatTimestamp();
    const strata_2_manifest: IValidationManifest = {
      strata: EValidationStrata.confidence_tier,
      stratum_sample_sizes: {
        high_confidence: strata_2_samples_1.validationSamples.length,
        low_confidence: strata_2_samples_2.validationSamples.length,
      },
      run_metadata: await generateRunMetadata(a_Configs[EValidationStrata.confidence_tier]),
      execution_duration_sec: Math.floor(
        getExecutionDuration(strata_2_start, strata_2_end) / 1000,
      ),
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
    
    const strata_3_start = formatTimestamp();
    const strata_3_samples_1 = await validationSamples(
      a_Configs[EValidationStrata.density][0],
      25,
    );

    const strata_3_samples_2 = await validationSamples(
      a_Configs[EValidationStrata.density][1],
      25,
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

    const strata_3_end = formatTimestamp();
    const strata_3_manifest: IValidationManifest = {
      strata: EValidationStrata.density,
      stratum_sample_sizes: {
        high_density: strata_3_samples_1.validationSamples.length,
        low_density: strata_3_samples_2.validationSamples.length,
      },
      run_metadata: await generateRunMetadata(a_Configs[EValidationStrata.density]),
      execution_duration_sec: Math.floor(
        getExecutionDuration(strata_3_start, strata_3_end) / 1000,
      ),
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

  log(`Generating outputs in ${a_Configs.confidence_tier[0].output}...`, ELogType.info);

  //validation_sample.geojson
  const geoJSON_strata: FeatureCollection<IGeometry, IValidationSample> = {
    type: "FeatureCollection",
    features: Array.from(mapStrata).flatMap(
      ([key, value]) => value.geoJSON,
    )
  }

  fs.writeFileSync(
    `${a_Configs.confidence_tier[0].output}validation_sample.geojson`,
    JSON.stringify(geoJSON_strata, null, 2),
  );

  //validation_sample.csv
  const csv_strata = Array.from(mapStrata).flatMap(([key, value]) => value.csv);
  const csv_strata_string = csv_strata.join(' ');
  fs.writeFileSync(`${a_Configs.confidence_tier[0].output}validation_sample.csv`, csv_strata_string, 'utf8');

  log('Validation finished.', ELogType.info);

  //validation_manifest.json
  const manifest_strata = Array.from(setManifest);
  fs.writeFileSync(
    `${a_Configs.confidence_tier[0].output}validation_manifest.json`,
    JSON.stringify(manifest_strata, null, 2),
  );
};

if (args.includes('--main')) {
  const configIndex = args.indexOf('--config');
  let configPath = null;

  if (configIndex !== -1 && args[configIndex + 1]) {
    configPath = args[configIndex + 1];
  } else {
    configPath = 'src/config/pilot.json';
  }
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8')) as IConfigJSON;
  if (!config) {
    throw new Error(`Config file not found: ${configPath}`);
  }
  main(config).catch(console.error);
} else if (args.includes('--validation')) {
  const configIndex = args.indexOf('--config');
  let configPath = null;

  if (configIndex !== -1 && args[configIndex + 1]) {
    configPath = args[configIndex + 1];
  } else {
    configPath = 'src/config/validation-pilot.json';
  }
  const configs = JSON.parse(fs.readFileSync(configPath, 'utf8')) as Record<EValidationStrata, IConfigJSON[]>;
  if (!configs) {
    throw new Error(`Config file not found: ${configPath}`);
  }
  validation(configs).catch(console.error);
}
