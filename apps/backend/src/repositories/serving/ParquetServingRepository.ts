import fs from 'fs';
import parquet from 'parquetjs';
import { IEventSchema } from '@packages/types';
import { writeParquet } from '../../pipeline/export/parquet';
import { log } from '../../helpers/utils/backendUtils';
import { ELogType } from '../../helpers/types/generalTypes';
import { IServingRepository } from '../../helpers/types/serviceTypes';
import { parquetSchema_serving } from '../../helpers/types/parquetTypes';
import {
  COVERAGE_FILE,
  EVENTS_PARTITION_DIR,
  dedupEventsById,
} from '../../helpers/utils/servingUtils';
import { ICoverageManifest } from '../../helpers/types/servingTypes';

/** Path (without extension) handed to the parquet writer. */
const partitionBasePath = (a_Date: string, a_Partition: string): string =>
  `${EVENTS_PARTITION_DIR}/date=${a_Date}/${a_Partition}`;

/** Full `.parquet` path used by the reader. */
const partitionFilePath = (a_Date: string, a_Partition: string): string =>
  `${partitionBasePath(a_Date, a_Partition)}.parquet`;

/**
 * Serving repository backed by per-`(day, region)` Parquet partition files on
 * the local filesystem, with the coverage manifest as a sibling JSON file. This
 * is the storage *strategy* — all parquet/fs specifics live here, behind the
 * generic {@link IServingRepository} verbs.
 */
export class ParquetServingRepository implements IServingRepository {
  async readPartition(
    a_Date: string,
    a_Partition: string,
  ): Promise<IEventSchema[]> {
    const filePath = partitionFilePath(a_Date, a_Partition);
    if (!fs.existsSync(filePath)) return [];

    const events: IEventSchema[] = [];
    const reader = await parquet.ParquetReader.openFile(filePath);
    try {
      const cursor = reader.getCursor();
      let record: Record<string, any> | null;
      while ((record = await cursor.next())) {
        if (!record.canonical_json) continue;
        try {
          events.push(JSON.parse(record.canonical_json) as IEventSchema);
        } catch (error) {
          log(
            `[serving] Skipping unparseable row in ${filePath}: ${error}`,
            ELogType.warn,
          );
        }
      }
    } finally {
      await reader.close();
    }
    return events;
  }

  /**
   * Read existing rows, concatenate, dedup by `event_id`, and rewrite the file.
   * parquetjs cannot append in place, so a rewrite-on-merge keeps the file
   * deduplicated and deterministic at pilot scale.
   */
  async writePartition(
    a_Date: string,
    a_Partition: string,
    a_Events: IEventSchema[],
  ): Promise<void> {
    if (a_Events.length === 0) return;
    const existing = await this.readPartition(a_Date, a_Partition);
    const merged = dedupEventsById([...existing, ...a_Events]);
    await writeParquet(
      partitionBasePath(a_Date, a_Partition),
      merged.map((e) => ({
        // inspectable primary/dedup key
        event_id: e.event_id,
        // source of truth — the full event, parsed back on read
        canonical_json: JSON.stringify(e),
      })),
      parquetSchema_serving,
    );
  }

  readCoverage(): ICoverageManifest {
    if (!fs.existsSync(COVERAGE_FILE)) return {};
    try {
      return JSON.parse(
        fs.readFileSync(COVERAGE_FILE, 'utf8'),
      ) as ICoverageManifest;
    } catch (error) {
      log(
        `[serving] Coverage manifest unreadable, resetting: ${error}`,
        ELogType.warn,
      );
      return {};
    }
  }

  writeCoverage(a_Manifest: ICoverageManifest): void {
    fs.mkdirSync(EVENTS_PARTITION_DIR, { recursive: true });
    fs.writeFileSync(
      COVERAGE_FILE,
      JSON.stringify(a_Manifest, null, 2),
      'utf8',
    );
  }
}
