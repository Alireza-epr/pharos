import { createSortedEventSchemas } from './schema/main';
import { formatTimestamp } from '../helpers/utils/backendUtils';
import { detectionGFW } from './ingest/detections';
import {
  IConfigJSON,
  I4wingsAPIResponse,
  TExportConfig,
} from '@packages/types';
import {
  getEntriesFrom4wingsResponse,
  log,
} from '../helpers/utils/backendUtils';
import { ELogType, ICSVGroup } from '../helpers/types/generalTypes';
import {
  enrichEventsWithHotspots,
  generateHotspots,
} from './aggregate/hotspots';
import {
  EValidationStrata,
  IValidationManifest,
  TValidationSample,
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
import { fs_readFileSync } from './export/fs';
import { applyFilter } from './normalize/filter';
import { writeJSON } from './export/json';
import { evidenceExport, rawExport, validationExport } from './export/bundle';
import { validateBodyParams } from '../helpers/utils/validationUtils';
import { filterEventsToQuery, getAOIPolygon } from '../helpers/geo/spatial';
import { parseDateRange } from '../helpers/utils/servingUtils';

const args = process.argv.slice(2);

export const coastlinePolylines = readCoastlinePolylines();
export const landPolygons = readLandPolygons();
export const eezPolygons = readEEZPolygons();
export const mpaPolygons = readMPAPolygons();

const main = async (a_Config: IConfigJSON) => {
  log('Pilot starting...', ELogType.info);

  const configValidation = validateBodyParams(a_Config);
  if (!configValidation.isValid) {
    const messages = JSON.stringify(configValidation.errors);
    log(`Following errors in pilot: ${messages}`, ELogType.error);
  }
  const start = formatTimestamp();
  await readBathymetryTiles();

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

  await rawExport(a_Config, entries);

  log(`Creating event schemas...`, ELogType.info);
  const sortedEvents = await createSortedEventSchemas(a_Config, entries);

  const notRejectedEvents = sortedEvents.filter((e) => !e.rejected);
  if (notRejectedEvents.length == 0) {
    //canonicalSchema.json
    writeJSON(`${a_Config.output}canonicalSchema`, sortedEvents);

    log('Pilot quit because no valid entry was found.', ELogType.info);
    return;
  }

  // Re-clip to the exact AOI/date-range: the provider's own AOI handling is
  // grid/cell based, not exact, so this matches getServedEvents' filter.
  const scopedEvents = filterEventsToQuery(
    notRejectedEvents,
    parseDateRange(a_Config.url_params['date-range']),
    getAOIPolygon(a_Config),
  );

  const filteredEvents = applyFilter(scopedEvents, a_Config.filter);
  if (filteredEvents.length === 0) {
    log(
      'Pilot processing quit because no entries remained after filtering.',
      ELogType.info,
    );
    return;
  }
  const hotspots = generateHotspots(a_Config, filteredEvents);
  const enrichedEvents = enrichEventsWithHotspots(filteredEvents, hotspots);

  log(
    `Exporting outputs to ${a_Config.output}; aggregated event count: ${enrichedEvents.length}`,
    ELogType.info,
  );

  const fullExport: TExportConfig = {
    'canonicalSchema.json': true,
    'event.geojson': true,
    'event.parquet': true,
    'events.csv': true,
    'stats.json': true,
    'hotspots.geojson': true,
    'hotspots.parquet': true,
    'run_metadata.json': true,
  };

  await evidenceExport(
    { ...a_Config, export: fullExport },
    enrichedEvents,
    hotspots,
    start,
  );

  log('Pilot finished.', ELogType.info);
};

const validation = async (
  a_Configs: Record<EValidationStrata, IConfigJSON[]>,
) => {
  log('Starting validation...', ELogType.info);
  for (const strata of Object.values(EValidationStrata)) {
    for (const config of a_Configs[strata]) {
      const configValidation = validateBodyParams(config);
      if (!configValidation.isValid) {
        const messages = JSON.stringify(configValidation.errors);
        log(`Following errors in ${strata} pilot: ${messages}`, ELogType.error);
      }
    }
  }

  await readBathymetryTiles();
  const mapStrata = new Map<
    EValidationStrata,
    IValidationStrata<TValidationSample>
  >();
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
      { title: 'Near coast', samples: near_coast },
      { title: 'Offshore', samples: offshore },
    ];

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
      run_metadata: [
        a_Configs[EValidationStrata.distance_to_coast],
        strata_1_samples.events,
        strata_1_start,
        strata_1_end,
      ],
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
      {
        title: 'High Confidence',
        samples: strata_2_samples_1.validationSamples,
      },
      {
        title: 'Low Confidence',
        samples: strata_2_samples_2.validationSamples,
      },
    ];
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
      run_metadata: [
        a_Configs[EValidationStrata.confidence_tier],
        [...strata_2_samples_1.events, ...strata_2_samples_2.events],
        strata_2_start,
        strata_2_end,
      ],
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
      { title: 'High Density', samples: strata_3_samples_1.validationSamples },
      { title: 'Low Density', samples: strata_3_samples_2.validationSamples },
    ];

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
      run_metadata: [
        a_Configs[EValidationStrata.density],
        [...strata_3_samples_1.events, ...strata_3_samples_2.events],
        strata_3_start,
        strata_3_end,
      ],
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

  await validationExport(a_Configs, mapStrata, setManifest);

  log('Validation finished.', ELogType.info);
};

if (args.includes('--main')) {
  const configIndex = args.indexOf('--config');
  let configPath = null;

  if (configIndex !== -1 && args[configIndex + 1]) {
    configPath = args[configIndex + 1];
  } else {
    configPath = 'src/config/pilot.json';
  }
  let config = fs_readFileSync<IConfigJSON>(configPath);
  if (!config) {
    throw new Error(`Config file not found: ${configPath}`);
  }

  config = config.output
    ? config
    : {
        ...config,
        output: 'data/out/pilot/',
      };

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
