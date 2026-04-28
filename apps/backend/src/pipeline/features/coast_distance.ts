import { point } from '@turf/helpers';
import { bbox } from '@turf/turf';
import nearestPointOnLine from '@turf/nearest-point-on-line';
import distance from '@turf/distance';
import {
  FeatureCollection,
  IMultiLineStringGeometry,
  TGlobalEvent,
} from '@packages/types';
import { ICoastlinePolylineProperties } from '../../helpers/types/validationTypes';
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

  for (const feature of a_CoastlinePolylines.features) {
    const b = feature.bbox;

    // skip far-away lines immediately
    if (b && !pointInBbox(a_Lon, a_Lat, b)) continue;

    const nearest = nearestPointOnLine(feature, pt);
    const distKm = distance(pt, nearest, { units: "kilometers" });

    if (distKm < minDist) minDist = distKm;

    // optional early exit (big win if dense coastline)
    // if (minDist < 1) break;
  }

  return +minDist.toFixed(2);
};

const pointInBbox = (
  lon: number,
  lat: number,
  b: [number, number, number, number],
  buffer = 0.5 // degrees buffer (~50km)
) => {
  return (
    lon >= b[0] - buffer &&
    lon <= b[2] + buffer &&
    lat >= b[1] - buffer &&
    lat <= b[3] + buffer
  );
};

export const isNearCoast = (a_Distance: number) => {
  const threshold = pilot.threshold.near_coast_threshold;
  return a_Distance <= threshold;
};
