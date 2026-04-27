import { IConfigJSON, IEventSchema } from "@packages/types";
import { deepSortObject } from "@packages/utils";
import { getGitCommitSHA } from "../../helpers/utils/backendUtils";


export const export_run_metadata = async (a_Events: IEventSchema[], a_Start: string, a_End: string) => {
    const uniqueConfigs = new Map<string, IConfigJSON[]>()
    for (const event of a_Events) {
        const config = event.run_metadata
        if (!uniqueConfigs.has(config.config_hash)) {
            uniqueConfigs.set(config.config_hash, config.config_json)
        }
    }

    const startDate = new Date(a_Start.replace(" ", "T"))
    const endDate = new Date(a_End.replace(" ", "T"))
    const execution_duration_ms = endDate.getTime() - startDate.getTime()

    const sources = a_Events.flatMap(event => event.run_metadata.config_json.flatMap(json => json.source))
    const uniqueSources = [...new Set(sources)];

    return {
        config: Array.from(uniqueConfigs).map(([hash, configs]) => ({
            hash: hash,
            json: deepSortObject(configs) as IConfigJSON[],
        })),
        run_time: new Date().toISOString(),
        data_source_versions: uniqueSources,
        git_commit_hash: await getGitCommitSHA(),
        execution_duration_sec: Math.floor(execution_duration_ms / 1000)
    };
}