import { IHotspot, IStats } from '@packages/types';

/** Which pipeline entrypoint mode a run used (`sample.ts --main` vs `--validation`). */
export type TQAAgentMode = 'main' | 'validation';

export interface IFileCheckResult {
  present: string[];
  missing: string[];
}

export interface ISchemaCheckResult {
  checked: number;
  issues: string[];
}

export interface IValidationStratumSummary {
  stratum: string;
  count: number;
  blank_labels: number;
  filled_labels: number;
}

export interface IValidationSummary {
  strata: IValidationStratumSummary[];
  total_rows: number;
  total_blank_labels: number;
  total_filled_labels: number;
}

export interface IQASummary {
  configPath: string;
  mode: TQAAgentMode;
  outputDir: string;
  generatedAt: string;
  fileCheck: IFileCheckResult;
  schemaCheck: ISchemaCheckResult | null;
  stats: (IStats & { unmatched_fraction: string }) | null;
  topHotspots: IHotspot[] | null;
  validation: IValidationSummary | null;
}
