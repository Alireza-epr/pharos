import { IConfigJSON, IEventSchema, IHotspot, IZipFile } from '@packages/types';
import {
  IAuditLog,
  ICSVGroup,
  IExportBuffer,
  TEventCSVRow,
} from '../../helpers/types/generalTypes';
import {
  featureFromEvents,
  formatTimestamp,
  getGitCommitSHA,
  hashString
} from '../../helpers/utils/backendUtils';
import { featureFromHotspot } from '../aggregate/hotspots';
import { getStats } from '../aggregate/stats';
import { generateRunMetadata, getISO8601 } from '../normalize/generation';
import { createCSVRows, writeCSV } from './csv';
import { writeGeoJSON } from './geojson';
import { writeJSON } from './json';
import { writeParquet } from './parquet';
import {
  parquetSchema,
  parquetSchema_hotspot,
  parquetSchema_raw_metadata,
} from '../../helpers/types/parquetTypes';
import {
  EValidationStrata,
  IValidationManifest,
  IValidationStrata,
  TValidationSample,
} from '../../helpers/types/validationTypes';
import { writeZip } from './zip';
import { deepSortObject, getExportId, stripHiddenConfiguration } from '@packages/utils';

export const evidenceExport = async (
  a_Config: IConfigJSON,
  a_Events: IEventSchema[],
  a_Hotspots?: IHotspot[],
  a_StartTime?: string,
  a_Zipped: boolean = false,
  a_Log: boolean = false,
  a_User: string = '',
): Promise<IExportBuffer> => {
  const gitCommitSHA = await getGitCommitSHA();
  const zipFiles: IZipFile[] = [];
  if (a_Config.export?.['canonicalSchema.json']) {
    if (a_Zipped) {
      zipFiles.push({
        name: 'canonicalSchema.json',
        content: a_Events,
      });
    } else {
      writeJSON(`${a_Config.output}canonicalSchema`, a_Events);
    }
  }

  if (a_Config.export?.['event.geojson']) {
    const geojson = featureFromEvents(a_Events);
    if (a_Zipped) {
      zipFiles.push({
        name: 'events.geojson',
        content: geojson,
      });
    } else {
      writeGeoJSON(`${a_Config.output}events`, geojson);
    }
  }

  const rows: TEventCSVRow[] = createCSVRows(a_Events);
  if (a_Config.export?.['event.parquet']) {
    if (a_Zipped) {
      zipFiles.push({
        name: 'events.parquet',
        content: {
          data: rows,
          schema: parquetSchema,
        },
      });
    } else {
      await writeParquet(`${a_Config.output}events`, rows, parquetSchema);
    }
  }

  if (a_Config.export?.['events.csv']) {
    const csv_events: ICSVGroup<TEventCSVRow>[] = [
      { title: 'Events', samples: rows },
    ];
    if (a_Zipped) {
      zipFiles.push({
        name: 'events.csv',
        content: [csv_events],
      });
    } else {
      writeCSV(`${a_Config.output}events`, [csv_events]);
    }
  }

  if (a_Config.export?.['stats.json']) {
    const stats = getStats(a_Events);

    if (a_Zipped) {
      zipFiles.push({
        name: 'stats.json',
        content: stats,
      });
    } else {
      writeJSON(`${a_Config.output}stats`, stats);
    }
  }

  if (a_Config.export?.['hotspots.geojson']) {
    if (a_Hotspots) {
      const geojson = featureFromHotspot(a_Hotspots);

      if (a_Zipped) {
        zipFiles.push({
          name: 'hotspots.geojson',
          content: geojson,
        });
      } else {
        writeGeoJSON(`${a_Config.output}hotspots`, geojson);
      }
    }
  }

  if (a_Config.export?.['hotspots.parquet']) {
    if (a_Hotspots) {
      if (a_Zipped) {
        zipFiles.push({
          name: 'hotspots.parquet',
          content: {
            data: a_Hotspots,
            schema: parquetSchema_hotspot,
          },
        });
      } else {
        await writeParquet(
          `${a_Config.output}hotspots`,
          a_Hotspots,
          parquetSchema_hotspot,
        );
      }
    }
  }

  if (a_Config.export?.['run_metadata.json']) {
    const end = formatTimestamp();

    const run_metadata = await generateRunMetadata(
      [{ ...a_Config, gitCommitSHA }],
      a_Events,
      a_StartTime,
      end,
    );

    if (a_Zipped) {
      zipFiles.push({
        name: 'run_metadata.json',
        content: run_metadata,
      });
    } else {
      writeJSON(`${a_Config.output}run_metadata`, run_metadata);
    }
  }
  const filename = getExportId();
  let buffer: Buffer<ArrayBufferLike> | null = null;
  if (a_Zipped) {
    buffer = await writeZip(`${a_Config.output}${filename}.zip`, zipFiles);
  }

  if (a_Log) {
    const configsoObject = deepSortObject(stripHiddenConfiguration([a_Config]));
    const configsString = JSON.stringify(configsoObject);
    const configHash = await hashString(configsString);
    const audit_log: IAuditLog = {
      user: a_User.length > 0 ? a_User : 'N/A',
      date: a_StartTime
        ? getISO8601(a_StartTime)
        : getISO8601(formatTimestamp()),
      configHash,
      eventCount: a_Events.length,
      filename,
    };
    writeJSON(
      `${a_Config.output}${filename}_audit_log`,
      deepSortObject(audit_log),
    );
  }

  return { filename, buffer };
};

export const validationExport = async (
  a_Configs: Record<EValidationStrata, IConfigJSON[]>,
  a_Map: Map<EValidationStrata, IValidationStrata<TValidationSample>>,
  a_Set: Set<IValidationManifest>,
) => {
  const gitCommitSHA = await getGitCommitSHA();

  //validation_sample.geojson
  writeGeoJSON(
    `${a_Configs.confidence_tier[0].output}validation_sample`,
    Array.from(a_Map).flatMap(([key, value]) => value.geoJSON),
  );

  //validation_sample.csv
  const csv_strata = Array.from(a_Map).map(([key, value]) => value.csv);
  writeCSV(
    `${a_Configs.confidence_tier[0].output}validation_sample`,
    csv_strata,
  );

  //validation_manifest.json
  const manifest_strata = Array.from(a_Set);
  let manifests = [];
  for (const manifest of manifest_strata) {
    manifests.push({
      ...manifest,
      run_metadata: await generateRunMetadata(
        manifest.run_metadata[0].map((c) => ({ ...c, gitCommitSHA })),
        manifest.run_metadata[1],
        manifest.run_metadata[2],
        manifest.run_metadata[3],
      ),
    });
  }

  writeJSON(
    `${a_Configs.confidence_tier[0].output}validation_manifest`,
    manifests,
  );
};

export const rawExport = async (a_Config: IConfigJSON, a_Data: any) => {
  //raw_metadata.json
  writeJSON(`${a_Config.output}raw_metadata`, a_Data);

  //raw_metadata.parquet
  await writeParquet(
    `${a_Config.output}raw_metadata`,
    a_Data,
    parquetSchema_raw_metadata,
  );
};
