import fs from "fs";
import path from "path";
import { ELogType, IBathymetryTile } from "../../helpers/types/generalTypes";
import { fromFile } from "geotiff";
import { log } from "../../helpers/utils/backendUtils";
const BASE_PATH = "data/bathymetry_rasters"
const INDEX_PATH = path.resolve(`${BASE_PATH}/index.json`);

let tiles: IBathymetryTile[] = [];

try {
    const raw = fs.readFileSync(INDEX_PATH, "utf-8");
    tiles = JSON.parse(raw).tiles || [];
} catch (e) {
    log("[Bathymetry] Index not found", ELogType.error);
}

const findTile = (a_Lon: number, a_Lat: number): string | null => {
    try {
        for (const tile of tiles) {
            const [minLon, minLat, maxLon, maxLat] = tile.bbox;

            if (
                a_Lon >= minLon &&
                a_Lon <= maxLon &&
                a_Lat >= minLat &&
                a_Lat <= maxLat
            ) {
                const filePath = path.resolve(
                    BASE_PATH,
                    tile.file
                );

                if (!fs.existsSync(filePath)) {
                    log("[Bathymetry] Failed to get COG file: "+filePath, ELogType.error)
                    return null;
                }

                return filePath;
            }
        }

        return null;
    } catch {
        return null;
    }
}

const getBathymetry = async (
  a_Lon: number,
  a_Lat: number
): Promise<number | null> => {
  try {
    const tilePath = findTile(a_Lon, a_Lat);

    if (!tilePath) {
      return null;
    }

    //log("[Bathymetry] Starting for "+a_Lon+"x"+a_Lat)

    const tiff = await fromFile(tilePath);
    const image = await tiff.getImage();

    const [minX, minY, maxX, maxY] = image.getBoundingBox();
    const width = image.getWidth();
    const height = image.getHeight();
    const x = Math.floor(((a_Lon - minX) / (maxX - minX)) * width);
    const y = Math.floor(((maxY - a_Lat) / (maxY - minY)) * height);

    const rasters = await image.readRasters({
      window: [x, y, x + 1, y + 1],
    });

    const value = rasters[0][0];
    //log("[Bathymetry] Result for "+a_Lon+"x"+a_Lat+ " : "+value)
    
    // handle nodata
    if (value === -32767) {
        log("[Bathymetry] There is NO valid data for pixel at: "+a_Lon+"_"+a_Lat, ELogType.error)
        return null;
    }

    return value;

  } catch {

    return null;
  }
}