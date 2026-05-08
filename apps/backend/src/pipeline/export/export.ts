import { IConfigJSON, IEventSchema } from '@packages/types';
import { deepSortObject, getExecutionDuration } from '@packages/utils';
import { getGitCommitSHA, getSourceFrom4wingsResponse, getSourcesFromEvents } from '../../helpers/utils/backendUtils';

export const export_run_metadata = async (
  a_Events: IEventSchema[],
  a_Start: string,
  a_End: string,
) => {
  const uniqueConfigs = new Map<string, IConfigJSON[]>();
  for (const event of a_Events) {
    const config = event.run_metadata;
    if (!uniqueConfigs.has(config.config_hash)) {
      uniqueConfigs.set(config.config_hash, config.config_json);
    }
  }

  const execution_duration_ms = getExecutionDuration(a_Start, a_End);

  const sources = getSourcesFromEvents(a_Events)

  return {
    config: Array.from(uniqueConfigs).map(([hash, configs]) => ({
      hash: hash,
      json: deepSortObject(configs) as IConfigJSON[],
    })),
    run_time: new Date().toISOString(),
    data_source_versions: sources,
    git_commit_hash: await getGitCommitSHA(),
    execution_duration_sec: Math.floor(execution_duration_ms / 1000),
  };
};
