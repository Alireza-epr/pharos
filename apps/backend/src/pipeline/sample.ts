import { createSortedEventSchemas } from './schema/main';
import {
  featureFromEvents,
  formatTimestamp,
  getGitCommitSHA,
} from '../helpers/utils/backendUtils';
import { detectionGFW } from './ingest/detections';
import {
  IConfigJSON,
  I4wingsAPIResponse,
} from '@packages/types';
import {
  getEntriesFrom4wingsResponse,
  log,
} from '../helpers/utils/backendUtils';
import { ELogType, ICSVGroup, TEventCSVRow } from '../helpers/types/generalTypes';
import {
  parquetSchema,
  parquetSchema_hotspot,
  parquetSchema_raw_metadata,
} from '../helpers/types/parquetTypes';
import {
  enrichEventsWithHotspots,
  featureFromHotspot,
  generateHotspots,
} from './aggregate/hotspots';
import {
  EValidationStrata,
  IValidationManifest,
  TValidationSample,
  IValidationStrata
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
import { fs_readFileSync } from './export/fs';
import { getStats } from './aggregate/stats';
import { applyFilter } from './normalize/filter';
import { createCSVRows, writeCSV } from './export/csv';
import { writeParquet } from './export/parquet';
import { writeGeoJSON } from './export/geojson';
import { writeJSON } from './export/json';
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

  const resp4wings = await detectionGFW<I4wingsAPIResponse>(a_Config);

  const entriesMap = getEntriesFrom4wingsResponse(a_Config, resp4wings);
  const entries = Array.from(entriesMap).flatMap(
    ([source, entries]) => entries,
  );

  if (entries.length == 0) {
    log('Pilot finished with no entry.', ELogType.info);
    return;
  }

  log(
    `Exporting raw metadata to ${a_Config.output}; aggregated entry count: ${entries.length}`,
    ELogType.info,
  );

  for (const [key, results] of entriesMap) {
    log(`${key}; entry count: ${results.length}`, ELogType.info);
  }

  //raw_metadata.json
  writeJSON(`${a_Config.output}raw_metadata`, entries);

  //raw_metadata.parquet
  await writeParquet(
    `${a_Config.output}raw_metadata`,
    entries,
    parquetSchema_raw_metadata
  );

  log(`Creating event schemas...`, ELogType.info);
  const sortedEvents = await createSortedEventSchemas(a_Config, entries);

  const notRejectedEvents = sortedEvents.filter((e) => !e.rejected);
  if (notRejectedEvents.length == 0) {
    //canonicalSchema.json
    writeJSON(`${a_Config.output}canonicalSchema`, sortedEvents);

    log('Pilot quit because no valid entry was found.', ELogType.info);
    return;
  }
  const filteredEvents = applyFilter(notRejectedEvents, a_Config.filter)
  if (filteredEvents.length === 0) {
    log('Pilot processing quit because no entries remained after filtering.', ELogType.info);
    return;
  }
  const hotspots = generateHotspots(a_Config, filteredEvents);
  const enrichedEvents = enrichEventsWithHotspots(filteredEvents, hotspots);

  log(
    `Exporting outputs to ${a_Config.output}; aggregated event count: ${enrichedEvents.length}`,
    ELogType.info,
  );

  //canonicalSchema.json
  writeJSON(`${a_Config.output}canonicalSchema`, enrichedEvents);

  //event.geojson
  writeGeoJSON(`${a_Config.output}events`, featureFromEvents(enrichedEvents))

  //event.parquet
  const rows: TEventCSVRow[] = createCSVRows(enrichedEvents)
  await writeParquet(`${a_Config.output}events`, rows, parquetSchema);

  //events.csv
  const csv_events: ICSVGroup<TEventCSVRow>[]= [{ title:'Events', samples: rows}]
  writeCSV(`${a_Config.output}events`, [csv_events])

  //stats.json
  const stats = getStats(enrichedEvents);
  writeJSON(`${a_Config.output}stats`, stats);

  //hotspots.geojson
  writeGeoJSON(`${a_Config.output}hotspots`, featureFromHotspot(hotspots))

  //hotspots.parquet
  await writeParquet(
    `${a_Config.output}hotspots`,
    hotspots,
    parquetSchema_hotspot
  );

  //run_metadata.json
  const end = formatTimestamp();
  const run_metadata = await generateRunMetadata(
    [a_Config], 
    enrichedEvents, 
    start, 
    end, 
    gitCommitSHA
  );
  writeJSON(`${a_Config.output}run_metadata`, run_metadata);
  log('Pilot finished.', ELogType.info);
};

const validation = async (
  a_Configs: Record<EValidationStrata, IConfigJSON[]>,
) => {
  log('Starting validation...', ELogType.info);
  gitCommitSHA = await getGitCommitSHA();
  await readBathymetryTiles();
  const mapStrata = new Map<EValidationStrata, IValidationStrata<TValidationSample>>();
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

    let near_coast: TValidationSample[] = [];
    let offshore: TValidationSample[] = [];
    for (const s of strata_1_samples.validationSamples) {
      const distance = distanceToCoast(coastlinePolylines, s.lon, s.lat);
      if (isNearCoast(distance)) {
        near_coast.push(s);
      } else {
        offshore.push(s);
      }
    }
    const strata_1_csv: ICSVGroup<TValidationSample>[] = [
      { title:'Near coast', samples: near_coast},
      { title:'Offshore', samples: offshore},
    ]

    mapStrata.set(EValidationStrata.distance_to_coast, {
      geoJSON: strata_1_samples.validationSamplesGeoJSON,
      csv: strata_1_csv,
    });

    const strata_1_end = formatTimestamp();
    const strata_1_manifest: IValidationManifest = {
      strata: EValidationStrata.distance_to_coast,
      stratum_sample_sizes: {
        near_coast: near_coast.length,
        offshore: offshore.length,
      },
      run_metadata: await generateRunMetadata(
        a_Configs[EValidationStrata.distance_to_coast],
        strata_1_samples.events,
        strata_1_start,
        strata_1_end,
        gitCommitSHA
      )
    };
    setManifest.add(strata_1_manifest);

    log(
      `Getting samples for ${EValidationStrata.distance_to_coast} strata done.`,
      ELogType.info,
    );
  } catch (error) {
    log(
      `[validation] Failed to get samples for ${EValidationStrata.distance_to_coast}: ${error}`,
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

    const strata_2_csv: ICSVGroup<TValidationSample>[] = [
      { title:'High Confidence', samples: strata_2_samples_1.validationSamples},
      { title:'Low Confidence', samples: strata_2_samples_2.validationSamples},
    ]
    mapStrata.set(EValidationStrata.confidence_tier, {
      geoJSON: [
        ...strata_2_samples_1.validationSamplesGeoJSON,
        ...strata_2_samples_2.validationSamplesGeoJSON,
      ],
      csv: strata_2_csv,
    });

    const strata_2_end = formatTimestamp();
    const strata_2_manifest: IValidationManifest = {
      strata: EValidationStrata.confidence_tier,
      stratum_sample_sizes: {
        high_confidence: strata_2_samples_1.validationSamples.length,
        low_confidence: strata_2_samples_2.validationSamples.length,
      },
      run_metadata: await generateRunMetadata(
        a_Configs[EValidationStrata.confidence_tier],
        [...strata_2_samples_1.events, ...strata_2_samples_2.events],
        strata_2_start,
        strata_2_end,
        gitCommitSHA
      )
    };
    setManifest.add(strata_2_manifest);

    log(
      `Getting samples for ${EValidationStrata.confidence_tier} strata done.`,
      ELogType.info,
    );
  } catch (error) {
    log(
      `[validation] Failed to get samples for ${EValidationStrata.confidence_tier}: ${error}`,
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

    const strata_3_csv: ICSVGroup<TValidationSample>[] = [
      { title:'High Density', samples: strata_3_samples_1.validationSamples},
      { title:'Low Density', samples: strata_3_samples_2.validationSamples},
    ]

    mapStrata.set(EValidationStrata.density, {
      geoJSON: [
        ...strata_3_samples_1.validationSamplesGeoJSON,
        ...strata_3_samples_2.validationSamplesGeoJSON,
      ],
      csv: strata_3_csv,
    });

    const strata_3_end = formatTimestamp();
    const strata_3_manifest: IValidationManifest = {
      strata: EValidationStrata.density,
      stratum_sample_sizes: {
        high_density: strata_3_samples_1.validationSamples.length,
        low_density: strata_3_samples_2.validationSamples.length,
      },
      run_metadata: await generateRunMetadata(
        a_Configs[EValidationStrata.density],
        [...strata_3_samples_1.events, ...strata_3_samples_2.events],
        strata_3_start,
        strata_3_end,
        gitCommitSHA
      )
    };
    setManifest.add(strata_3_manifest);

    log(
      `Getting samples for ${EValidationStrata.density} strata done.`,
      ELogType.info,
    );
  } catch (error) {
    log(
      `[validation] Failed to get samples for ${EValidationStrata.density}: ${error}`,
      ELogType.info,
    );
    return;
  }

  log(
    `Generating outputs in ${a_Configs.confidence_tier[0].output}...`,
    ELogType.info,
  );

  //validation_sample.geojson
  writeGeoJSON(`${a_Configs.confidence_tier[0].output}validation_sample`, Array.from(mapStrata).flatMap(([key, value]) => value.geoJSON))

  //validation_sample.csv
  const csv_strata = Array.from(mapStrata).map(([key, value]) => value.csv);
  writeCSV(
    `${a_Configs.confidence_tier[0].output}validation_sample`,
    csv_strata
  )
  
  log('Validation finished.', ELogType.info);

  //validation_manifest.json
  const manifest_strata = Array.from(setManifest);
  writeJSON(
    `${a_Configs.confidence_tier[0].output}validation_manifest`,
    manifest_strata,
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
  const config = fs_readFileSync<IConfigJSON>(configPath);
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
  const configs =
    fs_readFileSync<Record<EValidationStrata, IConfigJSON[]>>(configPath);
  if (!configs) {
    throw new Error(`Config file not found: ${configPath}`);
  }
  validation(configs).catch(console.error);
}
