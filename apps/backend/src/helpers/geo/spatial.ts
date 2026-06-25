import { IConfigJSON, IEventSchema, IGeometry } from '@packages/types';
import { EFetchMethods, EGeoJSONGeometryType } from '@packages/enum';
import {
  bbox,
  booleanContains,
  booleanIntersects,
  booleanPointInPolygon,
} from '@turf/turf';
import { point } from '@turf/helpers';
import {
  cellToBoundary,
  gridDisk,
  latLngToCell,
  polygonToCells,
} from 'h3-js';
import { eezPolygons } from '../../pipeline/sample';
import { log } from '../utils/backendUtils';
import { ELogType } from '../types/generalTypes';
import { HIGH_SEAS } from '../utils/servingUtils';

/**
 * Spatial helpers for the serving path: turn a request into the storage
 * partitions it must read, route events to partitions, and filter events by
 * H3 cell / exact polygon. (The time filter is a pure helper in `servingUtils`.)
 */

type TFeature = { type: 'Feature'; geometry: IGeometry; properties: object };

type TBBox = [number, number, number, number];

const overlaps = (a: TBBox, b: TBBox): boolean =>
  a[0] <= b[2] && a[2] >= b[0] && a[1] <= b[3] && a[3] >= b[1];

/**
 * Resolve the area-of-interest geometry from the request:
 * - POST requests carry a custom polygon in `body_params.geojson`.
 * - Otherwise we fall back to the EEZ polygon named by `region-id` (the only
 *   region kind the pilot resolves spatially).
 *
 * Returns null when no usable geometry can be derived.
 */
export const getAOIPolygon = (a_Config: IConfigJSON): TFeature | null => {
  if (a_Config.method === EFetchMethods.post && a_Config.body_params?.geojson) {
    return {
      type: 'Feature',
      geometry: a_Config.body_params.geojson,
      properties: {},
    };
  }

  const regionId =
    a_Config.method === EFetchMethods.post
      ? a_Config.body_params?.region?.id
      : a_Config.url_params['region-id'];

  if (regionId) {
    const eez = eezPolygons.features.find(
      (f) => String(f.properties.MRGID) === String(regionId),
    );
    if (eez) {
      return { type: 'Feature', geometry: eez.geometry, properties: {} };
    }
  }

  return null;
};

/**
 * Resolve the storage partitions an AOI/time query must read:
 * - every EEZ whose polygon intersects the AOI (keyed by MRGID), plus
 * - the shared `HIGH_SEAS` bucket whenever the AOI is not fully contained
 *   within a single intersecting EEZ (so any open-ocean portion is covered).
 *
 * When no EEZ intersects (or the AOI can't be resolved) the query falls back to
 * `HIGH_SEAS` alone.
 */
export const resolvePartitions = (a_Config: IConfigJSON): string[] => {
  const aoi = getAOIPolygon(a_Config);
  if (!aoi) {
    log(
      '[serving] No AOI geometry on request; falling back to HIGH_SEAS',
      ELogType.warn,
    );
    return [HIGH_SEAS];
  }

  const aoiBBox = bbox(aoi) as TBBox;
  const intersecting = new Set<string>();
  let fullyContained = false;

  for (const feature of eezPolygons.features) {
    const featureBBox = bbox(feature) as TBBox;
    if (!overlaps(aoiBBox, featureBBox)) continue;
    if (!booleanIntersects(aoi, feature)) continue;

    intersecting.add(String(feature.properties.MRGID));
    if (!fullyContained && booleanContains(feature, aoi)) {
      fullyContained = true;
    }
  }

  if (intersecting.size === 0) {
    return [HIGH_SEAS];
  }

  const partitions = Array.from(intersecting);
  // If the AOI spills beyond the EEZ boundaries, part of it is open ocean.
  if (!fullyContained) partitions.push(HIGH_SEAS);
  return partitions;
};

/**
 * The partition a single (already EEZ-enriched) event belongs to: its EEZ MRGID
 * when it falls inside one, otherwise the shared HIGH_SEAS bucket.
 */
export const partitionForEvent = (a_Event: IEventSchema): string => {
  const eezId = a_Event.context_layers.EEZ?.enrichments?.[0]?.id;
  return eezId ? String(eezId) : HIGH_SEAS;
};

/**
 * The set of H3 cells covering an AOI at the given resolution. The
 * polygon-derived cells are expanded by one ring (`gridDisk(k=1)`) so the set
 * fully covers the polygon (including edges) — important both for the read-time
 * prune and for coverage bookkeeping. Always returns at least one cell: an AOI
 * smaller than a single cell is seeded from a representative interior point.
 */
export const getAOIH3Cells = (
  a_Geometry: IGeometry,
  a_Resolution: number,
): Set<string> => {
  const polygons =
    a_Geometry.type === EGeoJSONGeometryType.MultiPolygon
      ? (a_Geometry.coordinates as number[][][][])
      : [a_Geometry.coordinates as number[][][]];

  const cells = new Set<string>();
  for (const polygon of polygons) {
    let base: string[] = [];
    try {
      // isGeoJSON = true → coordinates are [lng, lat] rings, as in GeoJSON.
      base = polygonToCells(polygon, a_Resolution, true);
    } catch {
      base = [];
    }
    for (const cell of base) {
      cells.add(cell);
      for (const neighbour of gridDisk(cell, 1)) cells.add(neighbour);
    }
  }

  // AOI smaller than one cell → seed from the average of the first ring so the
  // set is never empty (keeps the cache/filter working for tiny boxes).
  if (cells.size === 0) {
    const ring = (polygons[0]?.[0] ?? []) as number[][];
    if (ring.length > 0) {
      let sumLon = 0;
      let sumLat = 0;
      for (const [lon, lat] of ring) {
        sumLon += lon ?? 0;
        sumLat += lat ?? 0;
      }
      const cell = latLngToCell(sumLat / ring.length, sumLon / ring.length, a_Resolution);
      cells.add(cell);
      for (const neighbour of gridDisk(cell, 1)) cells.add(neighbour);
    }
  }

  return cells;
};

/**
 * A Polygon geometry for the bounding box of a cell set. Used to align the
 * miss-fetch to cell boundaries: by fetching the bbox that contains every cell
 * we are about to mark covered, each covered cell is guaranteed fully fetched —
 * so a later subset query can safely be served from the cache without losing
 * events at cell edges.
 */
export const cellSetBBoxGeometry = (a_Cells: Set<string>): IGeometry => {
  let minLon = 180;
  let minLat = 90;
  let maxLon = -180;
  let maxLat = -90;

  for (const cell of a_Cells) {
    for (const [lat, lon] of cellToBoundary(cell)) {
      if (lon < minLon) minLon = lon;
      if (lon > maxLon) maxLon = lon;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    }
  }

  return {
    type: EGeoJSONGeometryType.Polygon,
    coordinates: [
      [
        [minLon, minLat],
        [maxLon, minLat],
        [maxLon, maxLat],
        [minLon, maxLat],
        [minLon, minLat],
      ],
    ],
  };
};

/**
 * Coarse H3 pre-filter. When the cell set is empty (AOI smaller than one cell)
 * it is a no-op, deferring entirely to the exact polygon check.
 */
export const filterByH3 = (
  a_Events: IEventSchema[],
  a_Cells: Set<string>,
  a_Resolution: number,
): IEventSchema[] => {
  if (a_Cells.size === 0) return a_Events;
  return a_Events.filter((event) =>
    a_Cells.has(latLngToCell(event.lat, event.lon, a_Resolution)),
  );
};

/** Authoritative exact filter: keep events whose point is inside the AOI. */
export const filterByPolygon = (
  a_Events: IEventSchema[],
  a_AOI: TFeature,
): IEventSchema[] =>
  a_Events.filter((event) =>
    booleanPointInPolygon(point([event.lon, event.lat]), a_AOI as any),
  );
