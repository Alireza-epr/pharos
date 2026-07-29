import { create } from 'zustand';
import { combine } from 'zustand/middleware';
import { circle } from '@turf/turf';
import { IAOIStoreActions, IAOIStoreStates } from '../helpers/types/storeTypes';
import { ERegionDatasets, EGeoJSONGeometryType } from '@packages/enum';

/**
 * Minimum (and default) radius, in km, for the point tool's circular AOI. The
 * radius input clamps to this floor, and a freshly placed point starts here.
 */
export const AOI_RADIUS_MIN_KM = 10;

// Number of segments used to approximate the point AOI's circle as a polygon
// when handing it to the backend via getAOI(). Enough to look round at any zoom.
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
      getAOI: () => {
        const { eezActive, mpaActive, feature, radius } = get();
        if (eezActive)
          return {
            'region-dataset': ERegionDatasets.eez,
            'region-id': eezActive.value,
          };
        if (mpaActive)
          return {
            'region-dataset': ERegionDatasets.mpa,
            'region-id': mpaActive.value,
          };
        // A point AOI is a circle: buffer the centre into a Polygon of `radius`
        // km so the backend always receives an area geometry, never a bare point.
        if (feature && feature.type === EGeoJSONGeometryType.Point) {
          const buffered = circle(
            feature.coordinates as [number, number],
            radius,
            { units: 'kilometers', steps: AOI_CIRCLE_STEPS },
          );
          return {
            type: EGeoJSONGeometryType.Polygon,
            coordinates: buffered.geometry.coordinates,
          };
        }
        return feature;
      },
    }),
  ),
);
