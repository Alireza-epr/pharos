import fs from 'fs';
import path from 'path';
import { getExportId } from '@packages/utils';
import { IStats, IHotspot } from '@packages/types';
import { log } from '../../helpers/utils/backendUtils';
import { ELogType } from '../../helpers/types/generalTypes';
import { runPipeline } from './runPipeline';
import {
  checkCanonicalSchemaShape,
  checkFilesExist,
  requiredFilesFor,
} from './validateOutputs';
import {
  parseValidationCsv,
  summarizeStats,
  summarizeValidation,
  topHotspots as rankHotspots,
} from './summarize';
import { renderReport } from './report';
import { IQASummary, TQAAgentMode } from '../../helpers/types/qaAgentTypes';

const REPORTS_DIR = 'reports';

const readJsonIfPresent = <T>(a_Path: string): T | null =>
  fs.existsSync(a_Path)
    ? (JSON.parse(fs.readFileSync(a_Path, 'utf8')) as T)
    : null;

const buildSummary = (
  a_ConfigPath: string,
  a_Mode: TQAAgentMode,
  a_OutputDir: string,
): IQASummary => {
  const fileCheck = checkFilesExist(a_OutputDir, requiredFilesFor(a_Mode));

  const events = readJsonIfPresent<Record<string, unknown>[]>(
    path.join(a_OutputDir, 'canonicalSchema.json'),
  );
  const schemaCheck = events ? checkCanonicalSchemaShape(events) : null;

  const rawStats = readJsonIfPresent<IStats>(
    path.join(a_OutputDir, 'stats.json'),
  );
  const stats = rawStats ? summarizeStats(rawStats) : null;

  const hotspotsGeoJSON = readJsonIfPresent<{
    features: { properties: IHotspot }[];
  }>(path.join(a_OutputDir, 'hotspots.geojson'));
  const topHotspots = hotspotsGeoJSON
    ? rankHotspots(hotspotsGeoJSON.features.map((f) => f.properties))
    : null;

  const validationCsvPath = path.join(a_OutputDir, 'validation_sample.csv');
  const validation = fs.existsSync(validationCsvPath)
    ? summarizeValidation(
        parseValidationCsv(fs.readFileSync(validationCsvPath, 'utf8')),
      )
    : null;

  return {
    configPath: a_ConfigPath,
    mode: a_Mode,
    outputDir: a_OutputDir,
    generatedAt: new Date().toISOString(),
    fileCheck,
    schemaCheck,
    stats,
    topHotspots,
    validation,
  };
};

const main = () => {
  const args = process.argv.slice(2);
  const configIndex = args.indexOf('--config');
  const configPath = configIndex !== -1 ? args[configIndex + 1] : undefined;
  const modeIndex = args.indexOf('--mode');
  const mode: TQAAgentMode =
    modeIndex !== -1 && args[modeIndex + 1] === 'validation'
      ? 'validation'
      : 'main';

  if (!configPath) {
    log(
      '[qa-agent] Usage: qa-agent --config <path> [--mode main|validation]',
      ELogType.error,
    );
    process.exit(1);
  }

  log(
    `[qa-agent] Running pipeline (mode: ${mode}) with config ${configPath}...`,
    ELogType.info,
  );
  const outputDir = runPipeline(configPath, mode);

  log(`[qa-agent] Summarising output in ${outputDir}...`, ELogType.info);
  const summary = buildSummary(configPath, mode, outputDir);

  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  const reportPath = path.join(REPORTS_DIR, `qa_${getExportId()}.md`);
  fs.writeFileSync(reportPath, renderReport(summary), 'utf8');

  log(
    `[qa-agent] Report written to ${path.resolve(reportPath)}`,
    ELogType.info,
  );

  if (summary.fileCheck.missing.length > 0) {
    log(
      `[qa-agent] ${summary.fileCheck.missing.length} expected output file(s) missing — see report.`,
      ELogType.warn,
    );
  }
  if (summary.schemaCheck && summary.schemaCheck.issues.length > 0) {
    log(
      `[qa-agent] ${summary.schemaCheck.issues.length} schema-shape issue(s) found — see report.`,
      ELogType.warn,
    );
  }
};

main();
