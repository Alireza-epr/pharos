import {
  FeatureCollection,
  IMultiLineStringGeometry,
  IMultiPolygonGeometry,
} from '@packages/types';
import {
  ICoastlinePolylineProperties,
  IEEZPolygonProperties,
  ILandPolygonProperties,
  IMPAPolygonProperties,
} from '../../helpers/types/validationTypes';
import fs from 'fs';
import { IBathymetryCachedTile } from '../types/generalTypes';
//import { fromFile } from "geotiff";
import path from "path";
import { log } from './backendUtils';

export const readLandPolygons = () => {
  const landPolygons: FeatureCollection<
    IMultiPolygonGeometry,
    ILandPolygonProperties
  > = JSON.parse(
    fs.readFileSync('./data/land_polygons/land_polygons.geojson', 'utf8'),
  );

  if (!landPolygons) {
    throw new Error('Failed to read land polygons');
  }

  return landPolygons;
};

export const readCoastlinePolylines = () => {
  const coastlinePolylines: FeatureCollection<
    IMultiLineStringGeometry,
    ICoastlinePolylineProperties
  > = JSON.parse(
    fs.readFileSync(
      './data/coastline_polylines/coastline_polylines.geojson',
      'utf8',
    ),
  );

  if (!coastlinePolylines) {
    throw new Error('Failed to read coastline polylines');
  }

  return coastlinePolylines;
};

export const readEEZPolygons = () => {
  const eezPolygons: FeatureCollection<
    IMultiPolygonGeometry,
    IEEZPolygonProperties
  > = JSON.parse(
    fs.readFileSync('./data/eez_polygons/eez_polygons.geojson', 'utf8'),
  );

  if (!eezPolygons) {
    throw new Error('Failed to read EEZ polygons');
  }

  return eezPolygons;
};

export const readMPAPolygons = () => {
  const mpaPolygons: FeatureCollection<
    IMultiPolygonGeometry,
    IMPAPolygonProperties
  > = JSON.parse(
    fs.readFileSync('./data/mpa_polygons/mpa_polygons.geojson', 'utf8'),
  );

  if (!mpaPolygons) {
    throw new Error('Failed to read MPA polygons');
  }

  return mpaPolygons;
};

const bathymetryTiles: IBathymetryCachedTile[] = [];

export const readBathymetryTiles = async () => {
    const geotiff =  await import("geotiff"); 
    const BASE_PATH = "data/bathymetry_rasters"
    const dir = path.resolve(BASE_PATH);
    const files = fs.readdirSync(dir).filter(f => f.endsWith(".tif"));

    for (const file of files) {
        const fullPath = path.join(dir, file);

        const tiff = await geotiff.fromFile(fullPath);
        const image = await tiff.getImage();

        bathymetryTiles.push({
            file,
            image,
            bbox: image.getBoundingBox() as IBathymetryCachedTile["bbox"]
        });
    }

    log(`[Bathymetry] Loaded ${bathymetryTiles.length} bathymetry tiles into memory`);
}

export const findTile = (a_Lon: number, a_Lat: number) => {
    return bathymetryTiles.find(t => {
        const [minX, minY, maxX, maxY] = t.bbox;

        return (
            a_Lon >= minX &&
            a_Lon <= maxX &&
            a_Lat >= minY &&
            a_Lat <= maxY
        );
    }) || null;
}