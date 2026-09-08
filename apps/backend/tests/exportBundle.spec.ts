import JSZip from 'jszip';
import { IConfigJSON, IHotspot } from '@packages/types';
import { evidenceExport } from '../src/pipeline/export/bundle';
import { sarConfig } from './fixtures/gfwRequest';
import canonicalSchema from './fixtures/canonicalSchema.json';
import { hotspot } from './fixtures/hotspots';

// Fixed inputs shared by both tests below — everything evidenceExport needs
// to vary its output on (events, hotspots, config, request start/end time)
// is pinned, so any difference between two runs is a real bug, not noise.
const START_TIME = '2026-01-01T00:00:00.000';
const END_TIME = '2026-01-01T00:00:01.000';

// event.parquet / hotspots.parquet are deliberately left out of this
// selection: `tests/setup/jest.mocks.ts` globally mocks `parquetjs` down to
// a bare `ParquetSchema` stub (it pulls in `brotli`, which crashes under this
// suite's jsdom test environment), so parquet output isn't exercisable here.
const exportConfig: IConfigJSON = {
  ...sarConfig,
  output: 'data/out/exports/',
  export: {
    'canonicalSchema.json': true,
    'event.geojson': true,
    'events.csv': true,
    'stats.json': true,
    'hotspots.geojson': true,
    'run_metadata.json': true,
  },
};

const events = canonicalSchema as any;
const hotspots: IHotspot[] = [hotspot as any];

const runExport = () =>
  evidenceExport(
    exportConfig,
    events,
    hotspots,
    START_TIME,
    true, // zipped
    false, // log
    '',
    END_TIME,
  );

describe('Export_bundle_contents', () => {
  it('bundle_contains_every_file_requested_in_config_export', async () => {
    const { buffer } = await runExport();
    const zip = await JSZip.loadAsync(buffer!);

    expect(Object.keys(zip.files).sort()).toEqual(
      [
        'canonicalSchema.json',
        'events.csv',
        'events.geojson',
        'hotspots.geojson',
        'run_metadata.json',
        'stats.json',
      ].sort(),
    );

    const run_metadata = JSON.parse(
      await zip.file('run_metadata.json')!.async('string'),
    );
    expect(run_metadata.config_json).toBeDefined();
  });
});

describe('Export_bundle_determinism', () => {
  it('should_produce_identical_output_when_run_twice', async () => {
    const { buffer: buffer1 } = await runExport();
    const { buffer: buffer2 } = await runExport();

    const zip1 = await JSZip.loadAsync(buffer1!);
    const zip2 = await JSZip.loadAsync(buffer2!);
    const names = Object.keys(zip1.files);

    for (const name of names) {
      const content1 = await zip1.file(name)!.async('nodebuffer');
      const content2 = await zip2.file(name)!.async('nodebuffer');

      if (name === 'run_metadata.json') {
        // `run_time` legitimately records wall-clock "when this export ran"
        // (see generateRunMetadata) — it's supposed to differ between two
        // separate runs, so it's excluded here. Everything reproducibility
        // actually depends on (config_json, config_hash, ...) still must match.
        const { run_time: _run_time1, ...meta1 } = JSON.parse(
          content1.toString(),
        );
        const { run_time: _run_time2, ...meta2 } = JSON.parse(
          content2.toString(),
        );
        expect(meta1).toEqual(meta2);
        continue;
      }

      expect(content1.equals(content2)).toBe(true);
    }
  });
});
