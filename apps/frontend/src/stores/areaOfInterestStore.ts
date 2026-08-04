import { create } from 'zustand';
import { combine } from 'zustand/middleware';
import { centroid, circle } from '@turf/turf';
import {
  IAOIStoreActions,
  IAOIStoreStates,
  TAOIQuery,
} from '../helpers/types/storeTypes';
import { ERegionDatasets, EGeoJSONGeometryType } from '@packages/enum';

/**
 * Minimum (and default) radius, in km, for the point tool's circular AOI. The
 * radius input clamps to this floor, and a freshly placed point starts here.
 */
export const AOI_RADIUS_MIN_KM = 10;

// Number of segments used to approximate the point AOI's circle as a polygon
// in getAOI(). Enough to look round at any zoom.
const AOI_CIRCLE_STEPS = 64;

export const useAOIStore = create<IAOIStoreStates & IAOIStoreActions>(
  combine(
    {
      zonal: false,
      point: false,
      feature: null as IAOIStoreStates['feature'],
      radius: AOI_RADIUS_MIN_KM,
      eezOptions: [] as IAOIStoreStates['eezOptions'],
      eezActive: undefined as IAOIStoreStates['eezActive'],
      mpaOptions: [] as IAOIStoreStates['mpaOptions'],
      mpaActive: undefined as IAOIStoreStates['mpaActive'],
    },
    (set, get) => ({
      setZonal: (a_Value) =>
        set((state) => ({
          zonal: typeof a_Value === 'function' ? a_Value(state.zonal) : a_Value,
        })),
      setPoint: (a_Value) =>
        set((state) => ({
          point: typeof a_Value === 'function' ? a_Value(state.point) : a_Value,
        })),
      setFeature: (a_Value) =>
        set((state) => ({
          feature:
            typeof a_Value === 'function' ? a_Value(state.feature) : a_Value,
        })),
      setRadius: (a_Value) =>
        set((state) => {
          const next =
            typeof a_Value === 'function' ? a_Value(state.radius) : a_Value;
          // Clamp to the enforced floor so no downstream buffer can shrink below it.
          return { radius: Math.max(AOI_RADIUS_MIN_KM, next) };
        }),
      setEEZOptions: (a_Value) =>
        set((state) => ({
          eezOptions:
            typeof a_Value === 'function' ? a_Value(state.eezOptions) : a_Value,
        })),
      setEEZActive: (a_Value) =>
        set((state) => ({
          eezActive:
            typeof a_Value === 'function' ? a_Value(state.eezActive) : a_Value,
        })),
      setMPAOptions: (a_Value) =>
        set((state) => ({
          mpaOptions:
            typeof a_Value === 'function' ? a_Value(state.mpaOptions) : a_Value,
        })),
      setMPAActive: (a_Value) =>
        set((state) => ({
          mpaActive:
            typeof a_Value === 'function' ? a_Value(state.mpaActive) : a_Value,
        })),
      // Always a standard Feature: a named region has no local geometry (null,
      // per RFC 7946 §3.2) and carries its descriptor in properties; a drawn
      // AOI carries real geometry and null properties. Never a bare object.
      getAOI: (): TAOIQuery => {
        const { eezActive, mpaActive, feature } = get();
        if (eezActive)
          return {
            type: 'Feature',
            geometry: null,
            properties: {
              'region-dataset': ERegionDatasets.eez,
              'region-id': eezActive.value,
            },
          };
        if (mpaActive)
          return {
            type: 'Feature',
            geometry: null,
            properties: {
              'region-dataset': ERegionDatasets.mpa,
              'region-id': mpaActive.value,
            },
          };
        if (!feature) return null;
        // A point AOI is a circle: buffer the centre into a Polygon of `radius`
        // km so the AOI is always an area, never a bare point. `radius` is only
        // meaningful here, so it's only read here — and it's carried in
        // properties too, since buffering is what erases the fact this came
        // from the Point tool rather than a freehand Zonal polygon.
        if (feature.geometry.type === EGeoJSONGeometryType.Point) {
          const radius = get().radius;
          const buffered = circle(
            feature.geometry.coordinates as [number, number],
            radius,
            { units: 'kilometers', steps: AOI_CIRCLE_STEPS },
          );
          return {
            type: 'Feature',
            geometry: {
              type: EGeoJSONGeometryType.Polygon,
              coordinates: buffered.geometry.coordinates,
            },
            properties: { radius },
          };
        }
        return feature;
      },
      // Consumes exactly what getAOI() produces — no separate export shape.
      // A region descriptor re-resolves against the current EEZ/MPA option
      // list. A `radius` property means the geometry is a buffered Point
      // circle, not a freehand Zonal polygon — recover the original centre
      // (the buffer's centroid) so the Point tool re-arms at the right spot.
      // Anything else is a plain drawn polygon. Either way, no draw tool is
      // left armed.
      importAOI: (a_Data) => {
        const { eezOptions, mpaOptions } = get();
        const properties = a_Data?.properties;

        if (properties && 'region-dataset' in properties) {
          const isEEZ = properties['region-dataset'] === ERegionDatasets.eez;
          const options = isEEZ ? eezOptions : mpaOptions;
          const active = options.find(
            (o) => o.value === properties['region-id'],
          );
          set({
            zonal: false,
            point: false,
            feature: null,
            eezActive: isEEZ ? active : undefined,
            mpaActive: isEEZ ? undefined : active,
          });
          return;
        }

        if (a_Data?.geometry && properties && 'radius' in properties) {
          const center = centroid(a_Data.geometry as any).geometry
            .coordinates as [number, number];
          set({
            zonal: false,
            point: false,
            feature: {
              type: 'Feature',
              geometry: { type: EGeoJSONGeometryType.Point, coordinates: center },
              properties: null,
            },
            radius: Math.max(AOI_RADIUS_MIN_KM, properties.radius),
            eezActive: undefined,
            mpaActive: undefined,
          });
          return;
        }

        set({
          zonal: false,
          point: false,
          feature: a_Data?.geometry
            ? { type: 'Feature', geometry: a_Data.geometry, properties: null }
            : null,
          eezActive: undefined,
          mpaActive: undefined,
        });
      },
    }),
  ),
);
