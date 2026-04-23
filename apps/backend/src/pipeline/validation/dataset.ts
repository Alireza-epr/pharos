import {
  FeatureCollection,
  IMultiLineStringGeometry,
  IMultiPolygonGeometry,
} from '@packages/types';
import {
  ICoastlinePolylineProperties,
  IEEZPolygonProperties,
  ILandPolygonProperties,
} from '../../helpers/types/validationTypes';
import fs from 'fs';

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
