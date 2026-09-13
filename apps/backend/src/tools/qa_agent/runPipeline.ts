import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { IConfigJSON } from '@packages/types';
import { TQAAgentMode } from '../../helpers/types/qaAgentTypes';

/** Default output dir `sample.ts --main` falls back to when a config omits `output`. */
const DEFAULT_MAIN_OUTPUT = 'data/out/pilot/';

/**
 * Reads a config file just to find where its run will write output — the
 * same lookup `sample.ts` does internally, so the QA agent knows where to
 * look afterwards without re-implementing pipeline logic.
 */
const resolveOutputDir = (
  a_ConfigPath: string,
  a_Mode: TQAAgentMode,
): string => {
  const raw = fs.readFileSync(a_ConfigPath, 'utf8');
  const parsed = JSON.parse(raw);

  if (a_Mode === 'validation') {
    // Record<EValidationStrata, IConfigJSON[]> — every stratum's configs
    // share one output dir (see validationExport's usage), so the first
    // strata found is enough.
    const firstStrata = Object.values(parsed)[0] as IConfigJSON[] | undefined;
    const output = firstStrata?.[0]?.output;
    if (!output) {
      throw new Error(
        `[qa-agent] Could not resolve an output dir from validation config: ${a_ConfigPath}`,
      );
    }
    return output;
  }

  return (parsed as IConfigJSON).output ?? DEFAULT_MAIN_OUTPUT;
};

/**
 * Runs the offline pipeline for the given config (`sample.ts --main` or
 * `--validation`) via the same npm scripts a person would run by hand, then
 * returns where its output landed. Shelling out — rather than importing
 * `sample.ts` directly — matches the existing `Pipeline_determinism` test's
 * approach and avoids `sample.ts`'s argv-parsing side effects running at
 * import time.
 */
export const runPipeline = (
  a_ConfigPath: string,
  a_Mode: TQAAgentMode = 'main',
): string => {
  const npmScript = a_Mode === 'validation' ? 'pipeline:validation' : 'pipeline:sample';

  execSync(`npm run ${npmScript} -- --config ${a_ConfigPath}`, {
    stdio: 'inherit',
  });

  const outputDir = resolveOutputDir(a_ConfigPath, a_Mode);

  if (!fs.existsSync(outputDir)) {
    throw new Error(
      `[qa-agent] Pipeline ran but its output dir doesn't exist: ${path.resolve(outputDir)}`,
    );
  }

  return outputDir;
};
