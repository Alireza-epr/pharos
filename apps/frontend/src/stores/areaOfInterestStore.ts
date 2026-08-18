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
      // Mirrors literally where this AOI lives in IConfigJSON: a named region
      // is a url_params fragment; a drawn Zonal/Point polygon is a
      // body_params.geojson fragment — never a synthetic envelope of our own.
      getAOI: (): TAOIQuery => {
        const { eezActive, mpaActive, feature } = get();
        if (eezActive)
          return {
            url_params: {
              'region-dataset': ERegionDatasets.eez,
              'region-id': eezActive.value,
            },
          };
        if (mpaActive)
          return {
            url_params: {
              'region-dataset': ERegionDatasets.mpa,
              'region-id': mpaActive.value,
            },
          };
        if (!feature) return null;
        // A point AOI is a circle: buffer the centre into a Polygon of `radius`
        // km so the AOI is always an area, never a bare point. `radius` is only
        // meaningful here, so it's only read here — and it rides alongside
        // type/coordinates on geojson itself (the backend ignores unknown
        // keys there), since buffering is what erases the fact this came from
        // the Point tool rather than a freehand Zonal polygon.
        if (feature.geometry.type === EGeoJSONGeometryType.Point) {
          const radius = get().radius;
          const buffered = circle(
            feature.geometry.coordinates as [number, number],
            radius,
            { units: 'kilometers', steps: AOI_CIRCLE_STEPS },
          );
          return {
            body_params: {
              geojson: {
                type: EGeoJSONGeometryType.Polygon,
                coordinates: buffered.geometry.coordinates,
                properties: { radius },
              },
            },
          };
        }
        return {
          body_params: {
            geojson: { ...feature.geometry, properties: null },
          },
        };
      },
      // Consumes exactly what getAOI() produces — no separate export shape.
      // A url_params fragment re-resolves against the current EEZ/MPA option
      // list. A body_params fragment whose geojson carries a `radius`
      // property came from a buffered Point circle, not a freehand Zonal
      // polygon — recover the original centre (the buffer's centroid) so the
      // Point tool re-arms at the right spot. Anything else is a plain drawn
      // polygon. Either way, no draw tool is left armed.
      importAOI: (a_Data) => {
        const { eezOptions, mpaOptions } = get();

        if (a_Data && 'url_params' in a_Data) {
          const { 'region-dataset': dataset, 'region-id': id } =
            a_Data.url_params;
          const isEEZ = dataset === ERegionDatasets.eez;
          const options = isEEZ ? eezOptions : mpaOptions;
          const active = options.find((o) => o.value === id);
          set({
            zonal: false,
            point: false,
            feature: null,
            eezActive: isEEZ ? active : undefined,
            mpaActive: isEEZ ? undefined : active,
          });
          return;
        }

        if (a_Data && 'body_params' in a_Data) {
          const { properties, ...geometry } = a_Data.body_params.geojson;
          if (properties) {
            const center = centroid(geometry as any).geometry.coordinates as [
              number,
              number,
            ];
            set({
              zonal: false,
              point: false,
              feature: {
                type: 'Feature',
                geometry: {
                  type: EGeoJSONGeometryType.Point,
                  coordinates: center,
                },
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
            feature: { type: 'Feature', geometry, properties: null },
            eezActive: undefined,
            mpaActive: undefined,
          });
          return;
        }

        set({
          zonal: false,
          point: false,
          feature: null,
          eezActive: undefined,
          mpaActive: undefined,
        });
      },
    }),
  ),
);
