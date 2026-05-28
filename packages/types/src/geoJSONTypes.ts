import { IEventSchema } from "./eventTypes";

// Geometry Interfaces
export type TGeoJSONGeometryType =
  | "Point"
  | "LineString"
  | "Polygon"
  | "MultiPoint"
  | "MultiLineString"
  | "MultiPolygon";

export interface IGeometry {
  type: TGeoJSONGeometryType;
  coordinates: any; // depends on type, we refine below
}

// Specific geometries
export interface IPointGeometry extends IGeometry {
  type: "Point";
  coordinates: [number, number]; // [lng, lat]
}

export interface ILineStringGeometry extends IGeometry {
  type: "LineString";
  coordinates: [number, number][];
}

export interface IPolygonGeometry extends IGeometry {
  type: "Polygon";
  coordinates: [[number, number][]]; // array of rings
}

export interface IMultiPolygonGeometry extends IGeometry {
  type: "MultiPolygon";
  coordinates: number[][][][]; // array of rings
}

export interface IMultiLineStringGeometry extends IGeometry {
  type: "MultiLineString";
  coordinates: number[][][]; // array of rings
}

// Feature Interface
export interface IFeature<G extends IGeometry = IGeometry, P = any> {
  type: "Feature";
  geometry: G;
  properties: P; // optional metadata
  bbox?: [number, number, number, number]
}

// FeatureCollection Interface
export interface FeatureCollection<G extends IGeometry = IGeometry, P = any> {
  type: "FeatureCollection";
  features: IFeature<G, P>[];
}

export const EVENT_MISSINGNESS_KEYS = {
  event_id: 'event_id',
  timestamp_utc: 'timestamp_utc',
  lat: 'lat',
  lon: 'lon',
  confidence_proxy: 'confidence_proxy',
  distance_to_coast_km: 'distance_to_coast_km',
} as const satisfies Record<string, keyof IEventSchema>;

export type TGeoJSONEventMissingness =
  keyof typeof EVENT_MISSINGNESS_KEYS;