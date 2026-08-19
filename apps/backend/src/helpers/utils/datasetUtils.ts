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
import path from 'path';
import { log } from './backendUtils';
import { EContextDatasetQuality } from '@packages/enum';

// Each reader below is memoized after its first call: these backing files are
// tens of MB of GeoJSON, so the live server must never read/parse them more
// than once per process, and must never do so unless something actually asks
// for them (see below -- eager top-level reads of these caused a boot-time
// heap OOM on memory-constrained hosts once anything imported `pipeline/sample`).

// EEZ/MPA/coastline each ship two versions of their source file: a simplified
// one (default -- fits a memory-constrained host) and a `.full` one with the
// unsimplified upstream geometry, for once hosting moves to a tier with
// enough RAM to hold it. Toggle via CONTEXT_DATASET_QUALITY; see
// docs/data/context-layers.md.
const contextDatasetQuality = (): EContextDatasetQuality =>
  process.env.CONTEXT_DATASET_QUALITY === EContextDatasetQuality.full
    ? EContextDatasetQuality.full
    : EContextDatasetQuality.simplified;

const withQualitySuffix = (a_Path: string): string =>
  contextDatasetQuality() === EContextDatasetQuality.full
    ? a_Path.replace(/\.geojson$/, '.full.geojson')
    : a_Path;

let landPolygonsCache: FeatureCollection<
  IMultiPolygonGeometry,
  ILandPolygonProperties
> | null = null;

export const readLandPolygons = () => {
  if (landPolygonsCache) return landPolygonsCache;

  const landPolygons: FeatureCollection<
    IMultiPolygonGeometry,
    ILandPolygonProperties
  > = JSON.parse(
    fs.readFileSync('./data/land_polygons/land_polygons.geojson', 'utf8'),
  );

  if (!landPolygons) {
    throw new Error('Failed to read land polygons');
  }

  landPolygonsCache = landPolygons;
  return landPolygonsCache;
};

let coastlinePolylinesCache: FeatureCollection<
  IMultiLineStringGeometry,
  ICoastlinePolylineProperties
> | null = null;

export const readCoastlinePolylines = () => {
  if (coastlinePolylinesCache) return coastlinePolylinesCache;

  const coastlinePolylines: FeatureCollection<
    IMultiLineStringGeometry,
    ICoastlinePolylineProperties
  > = JSON.parse(
    fs.readFileSync(
      withQualitySuffix('./data/coastline_polylines/coastline_polylines.geojson'),
      'utf8',
    ),
  );

  if (!coastlinePolylines) {
    throw new Error('Failed to read coastline polylines');
  }

  coastlinePolylinesCache = coastlinePolylines;
  return coastlinePolylinesCache;
};

let eezPolygonsCache: FeatureCollection<
  IMultiPolygonGeometry,
  IEEZPolygonProperties
> | null = null;

export const readEEZPolygons = () => {
  if (eezPolygonsCache) return eezPolygonsCache;

  const eezPolygons: FeatureCollection<
    IMultiPolygonGeometry,
    IEEZPolygonProperties
  > = JSON.parse(
    fs.readFileSync(
      withQualitySuffix('./data/eez_polygons/eez_polygons.geojson'),
      'utf8',
    ),
  );

  if (!eezPolygons) {
    throw new Error('Failed to read EEZ polygons');
  }

  eezPolygonsCache = eezPolygons;
  return eezPolygonsCache;
};

let mpaPolygonsCache: FeatureCollection<
  IMultiPolygonGeometry,
  IMPAPolygonProperties
> | null = null;

export const readMPAPolygons = () => {
  if (mpaPolygonsCache) return mpaPolygonsCache;

  const mpaPolygons: FeatureCollection<
    IMultiPolygonGeometry,
    IMPAPolygonProperties
  > = JSON.parse(
    fs.readFileSync(
      withQualitySuffix('./data/mpa_polygons/mpa_polygons.geojson'),
      'utf8',
    ),
  );

  if (!mpaPolygons) {
    throw new Error('Failed to read MPA polygons');
  }

  mpaPolygonsCache = mpaPolygons;
  return mpaPolygonsCache;
};

const bathymetryTiles: IBathymetryCachedTile[] = [];

export const readBathymetryTiles = async () => {
  const geotiff = await import('geotiff');
  const BASE_PATH = 'data/bathymetry_rasters';
  const dir = path.resolve(BASE_PATH);
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.tif'));

  for (const file of files) {
    const fullPath = path.join(dir, file);

    const tiff = await geotiff.fromFile(fullPath);
    const image = await tiff.getImage();

    bathymetryTiles.push({
      file,
      image,
      bbox: image.getBoundingBox() as IBathymetryCachedTile['bbox'],
    });
  }

  log(
    `[Bathymetry] Loaded ${bathymetryTiles.length} bathymetry tiles into memory`,
  );
};

export const findTile = (a_Lon: number, a_Lat: number) => {
  return (
    bathymetryTiles.find((t) => {
      const [minX, minY, maxX, maxY] = t.bbox;

      return a_Lon >= minX && a_Lon <= maxX && a_Lat >= minY && a_Lat <= maxY;
    }) || null
  );
};
