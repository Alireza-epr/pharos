import { useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import type { Feature, FeatureCollection } from 'geojson';
import { useAOIStore } from '@/stores/areaOfInterestStore';

/**
 * Draws the AOI section's chosen EEZ/MPA region (areaOfInterestStore's
 * eezActive/mpaActive) on the map, using its full boundary once fetched by
 * id (useSyncRegionGeometry, driven from AreaOfInterest.tsx) -- same split
 * as useRegionBoundary: the geometry isn't derivable client-side, so this
 * hook just reads it from the store, same as useAOIDraw reads a committed
 * drawn feature.
 *
 * Styled the same as the Zonal AOI tool (fill + line, same color/opacity) --
 * eez/mpa selection is mutually exclusive with the Zonal/Point tools (see
 * AreaOfInterest.tsx's deactivateExcept), so the two never share the screen
 * and reusing the color reads as "this is the AOI" either way.
 *
 * Kept as its own module (only imported by the already-lazy MapCanvas), same
 * pattern as useAOIDraw / useHotspotBoundary / useRegionBoundary.
 */

const SRC = 'aoi-region-boundary-src';
const L_FILL = 'aoi-region-boundary-fill';
const L_LINE = 'aoi-region-boundary-line';

// Fallbacks only apply if the design tokens can't be read at runtime.
const readToken = (a_Name: string, a_Fallback: string) => {
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue(a_Name)
    .trim();
  return v || a_Fallback;
};

export const useAOIRegionBoundary = (a_Map: maplibregl.Map | null) => {
  useEffect(() => {
    if (!a_Map) return;
    const map = a_Map;

    // Same token/fallback as the Zonal AOI fill in useAOIDraw -- keep in
    // sync if that color ever changes.
    const green = readToken('--color-accent-teal4', '#2bb3a3');

    const addSourceAndLayers = () => {
      if (!map.getSource(SRC)) {
        map.addSource(SRC, {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
        });
      }
      if (!map.getLayer(L_FILL)) {
        map.addLayer({
          id: L_FILL,
          type: 'fill',
          source: SRC,
          paint: { 'fill-color': green, 'fill-opacity': 0.15 },
        });
      }
      if (!map.getLayer(L_LINE)) {
        map.addLayer({
          id: L_LINE,
          type: 'line',
          source: SRC,
          paint: { 'line-color': green, 'line-width': 2 },
        });
      }
    };

    const render = () => {
      const { eezActive, mpaActive, eezGeometries, mpaGeometries } =
        useAOIStore.getState();

      const features: Feature[] = [];
      if (eezActive) {
        eezGeometries.forEach((f) =>
          features.push({
            type: 'Feature',
            properties: null,
            geometry: f.geometry,
          } as Feature),
        );
      }
      if (mpaActive) {
        mpaGeometries.forEach((f) =>
          features.push({
            type: 'Feature',
            properties: null,
            geometry: f.geometry,
          } as Feature),
        );
      }

      const fc: FeatureCollection = { type: 'FeatureCollection', features };
      const src = map.getSource(SRC) as maplibregl.GeoJSONSource | undefined;
      src?.setData(fc);
    };

    // A theme toggle calls map.setStyle(), which wipes every custom source
    // and layer. Re-add and repaint whenever a new style finishes loading.
    const onStyleData = () => {
      if (map.getSource(SRC)) return;
      addSourceAndLayers();
      render();
    };

    addSourceAndLayers();
    map.on('styledata', onStyleData);
    render();

    const unsubscribe = useAOIStore.subscribe((cur, prev) => {
      if (
        cur.eezActive !== prev.eezActive ||
        cur.mpaActive !== prev.mpaActive ||
        cur.eezGeometries !== prev.eezGeometries ||
        cur.mpaGeometries !== prev.mpaGeometries
      ) {
        render();
      }
    });

    return () => {
      unsubscribe();
      map.off('styledata', onStyleData);
      [L_FILL, L_LINE].forEach((id) => {
        if (map.getLayer(id)) map.removeLayer(id);
      });
      if (map.getSource(SRC)) map.removeSource(SRC);
    };
  }, [a_Map]);
};
