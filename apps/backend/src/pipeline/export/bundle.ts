import { IConfigJSON, IEventSchema, IHotspot } from "@packages/types";
import { ICSVGroup, TEventCSVRow } from "../../helpers/types/generalTypes";
import { featureFromEvents, formatTimestamp, getGitCommitSHA } from "../../helpers/utils/backendUtils";
import { featureFromHotspot } from "../aggregate/hotspots";
import { getStats } from "../aggregate/stats";
import { generateRunMetadata } from "../normalize/generation";
import { createCSVRows, writeCSV } from "./csv";
import { writeGeoJSON } from "./geojson";
import { writeJSON } from "./json";
import { writeParquet } from "./parquet";
import { parquetSchema, parquetSchema_hotspot, parquetSchema_raw_metadata } from "../../helpers/types/parquetTypes";
import { EValidationStrata, IValidationManifest, IValidationStrata, TValidationSample } from "../../helpers/types/validationTypes";


export const evidenceExport = async (
    a_Config: IConfigJSON,
    a_Events: IEventSchema[],
    a_Hotspots: IHotspot[],
    a_StartTime: string
) => {
    const gitCommitSHA = await getGitCommitSHA();

    //canonicalSchema.json
    writeJSON(`${a_Config.output}canonicalSchema`, a_Events);

    //event.geojson
    writeGeoJSON(`${a_Config.output}events`, featureFromEvents(a_Events))

    //event.parquet
    const rows: TEventCSVRow[] = createCSVRows(a_Events)
    await writeParquet(`${a_Config.output}events`, rows, parquetSchema);

    //events.csv
    const csv_events: ICSVGroup<TEventCSVRow>[] = [{ title: 'Events', samples: rows }]
    writeCSV(`${a_Config.output}events`, [csv_events])

    //stats.json
    const stats = getStats(a_Events);
    writeJSON(`${a_Config.output}stats`, stats);

    //hotspots.geojson
    writeGeoJSON(`${a_Config.output}hotspots`, featureFromHotspot(a_Hotspots))

    //hotspots.parquet
    await writeParquet(
        `${a_Config.output}hotspots`,
        a_Hotspots,
        parquetSchema_hotspot
    );

    //run_metadata.json
    const end = formatTimestamp();
    const run_metadata = await generateRunMetadata(
        [{...a_Config, gitCommitSHA}],
        a_Events,
        a_StartTime,
        end
    );
    writeJSON(`${a_Config.output}run_metadata`, run_metadata);
}

export const validationExport = async (
    a_Configs: Record<EValidationStrata, IConfigJSON[]>,
    a_Map: Map<EValidationStrata, IValidationStrata<TValidationSample>>,
    a_Set: Set<IValidationManifest>
) => {
    const gitCommitSHA = await getGitCommitSHA();

    //validation_sample.geojson
    writeGeoJSON(`${a_Configs.confidence_tier[0].output}validation_sample`, Array.from(a_Map).flatMap(([key, value]) => value.geoJSON))

    //validation_sample.csv
    const csv_strata = Array.from(a_Map).map(([key, value]) => value.csv);
    writeCSV(
        `${a_Configs.confidence_tier[0].output}validation_sample`,
        csv_strata
    )

    //validation_manifest.json
    const manifest_strata = Array.from(a_Set);
    let manifests = []
    for(const manifest of manifest_strata){
        manifests.push({
            ...manifest,
            run_metadata: await generateRunMetadata(
                manifest.run_metadata[0].map( c => ({...c, gitCommitSHA})),
                manifest.run_metadata[1],
                manifest.run_metadata[2],
                manifest.run_metadata[3],
            )
        })
    }

    writeJSON(
        `${a_Configs.confidence_tier[0].output}validation_manifest`,
        manifests
    );
}

export const rawExport = async (
    a_Config: IConfigJSON,
    a_Data: any
) => {
    //raw_metadata.json
    writeJSON(`${a_Config.output}raw_metadata`, a_Data);

    //raw_metadata.parquet
    await writeParquet(
        `${a_Config.output}raw_metadata`,
        a_Data,
        parquetSchema_raw_metadata
    );
}