export type TGeoJSONGeometryType = 'Point' | 'LineString' | 'Polygon' | 'MultiPoint' | 'MultiLineString' | 'MultiPolygon';
export interface IGeometry {
    type: TGeoJSONGeometryType;
    coordinates: any;
}
export interface IPointGeometry extends IGeometry {
    type: 'Point';
    coordinates: [number, number];
}
export interface ILineStringGeometry extends IGeometry {
    type: 'LineString';
    coordinates: [number, number][];
}
export interface IPolygonGeometry extends IGeometry {
    type: 'Polygon';
    coordinates: [[number, number][]];
}
export interface IMultiPolygonGeometry extends IGeometry {
    type: 'MultiPolygon';
    coordinates: number[][][][];
}
export interface IMultiLineStringGeometry extends IGeometry {
    type: 'MultiLineString';
    coordinates: number[][][];
}
export interface IFeature<G extends IGeometry = IGeometry, P = any> {
    type: 'Feature';
    geometry: G;
    properties: P;
}
export interface FeatureCollection<G extends IGeometry = IGeometry, P = any> {
    type: 'FeatureCollection';
    features: IFeature<G, P>[];
}
