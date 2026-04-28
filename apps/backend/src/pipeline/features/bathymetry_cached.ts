
import { IContextLayer } from "@packages/types";
import { ELogType } from "../../helpers/types/generalTypes";
import { log } from "../../helpers/utils/backendUtils";
import { findTile } from "../../helpers/utils/datasetUtils";
import { EContextLayerDatasets } from "@packages/enum";

export const getBathymetry_cached = async (a_Lon: number, a_Lat: number) => {
    const tile = findTile(a_Lon, a_Lat);

    if (!tile || !tile.image) {
        log("[Bathymetry] Failed to get COG file", ELogType.error)
        return null
    }

    //log("[Bathymetry] Starting for "+a_Lon+"x"+a_Lat)

    const image = tile.image;

    const [minX, minY, maxX, maxY] = tile.bbox;

    const width = image.getWidth();
    const height = image.getHeight();

    const x = Math.floor(((a_Lon - minX) / (maxX - minX)) * width);
    const y = Math.floor(((maxY - a_Lat) / (maxY - minY)) * height);

    const rasters = await image.readRasters({
        window: [x, y, x + 1, y + 1],
    });

    const value: number = rasters[0][0];
    //log("[Bathymetry] Result for "+a_Lon+"x"+a_Lat+ " : "+value)

    if (value === -32767) {
        log("[Bathymetry] There is NO valid data for pixel at: "+a_Lon+"_"+a_Lat, ELogType.error)
        return null;
    }

    return value;
}

export const getBathymetryContext = async (a_Lon: number, a_Lat: number): Promise<IContextLayer> => {
    const bathymetry = await getBathymetry_cached(a_Lon, a_Lat)

    return {
        dataset: EContextLayerDatasets.bathymetry,
        version: "v2.7",
        enrichments: [{
            value: String(bathymetry)
        }]
    }
    
}