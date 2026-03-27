import { TGlobalEvent } from '../../types/gfwTypes';
import { point } from '@turf/helpers';
import nearestPointOnLine from '@turf/nearest-point-on-line';
import distance from '@turf/distance';
import {
  FeatureCollection,
  IMultiLineStringGeometry,
} from '../../types/geoJSONTypes';
import { ICoastlinePolylineProperties } from '../../types/validationTypes';
import pilot from '../../config/pilot.json';

export const generateDistanceToCoast = (
  a_EventEntry: TGlobalEvent | undefined,
): number | null => {
  if (!a_EventEntry) return null;

  return a_EventEntry.distances.startDistanceFromShoreKm;
};

export const distanceToCoast = (
  a_CoastlinePolylines: FeatureCollection<
    IMultiLineStringGeometry,
    ICoastlinePolylineProperties
  >,
  a_Lon: number,
  a_Lat: number,
): number => {
  const pt = point([a_Lon, a_Lat]);
  let minDist = Infinity;

  a_CoastlinePolylines.features.forEach((line) => {
    const nearest = nearestPointOnLine(line, pt);
    const distKm = distance(pt, nearest, { units: 'kilometers' });
    if (distKm < minDist) minDist = distKm;
  });

  return +minDist.toFixed(2);
};

export const isNearCoast = (a_Distance: number) => {
  const threshold = pilot.threshold.near_coast_threshold;
  return a_Distance <= threshold;
};
