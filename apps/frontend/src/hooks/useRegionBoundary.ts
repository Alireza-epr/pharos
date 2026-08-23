import { useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import type { Feature, FeatureCollection } from 'geojson';
import { useContextLayersStore } from '@/stores/contextLayersStore';
import { useEventStore } from '@/stores/eventStore';

/**
 * Draws the selected event's EEZ/MPA boundaries on the map, when the "show
 * on map" toggles (contextLayersStore.eezBoundaries / mpaZones, set from
 * ContextLayersBlock.tsx in the Detail tab) are on. Unlike hotspot
 * boundaries, this geometry isn't derivable client-side -- it's fetched by
 * id (useSyncRegionGeometry, driven from ContextLayersBlock) and just read
 * here from the store, same as useAOIDraw reads a committed AOI.
 *
 * Kept as its own module (only imported by the already-lazy MapCanvas), same
 * pattern as useAOIDraw / useHotspotBoundary.
 */

const SRC = 'region-boundary-src';
const L_EEZ_FILL = 'region-boundary-eez-fill';
const L_EEZ_LINE = 'region-boundary-eez-line';
const L_MPA_FILL = 'region-boundary-mpa-fill';
const L_MPA_LINE = 'region-boundary-mpa-line';

const KIND = { eez: 'eez', mpa: 'mpa' } as const;

// Fallbacks only apply if the design tokens can't be read at runtime.
const readToken = (a_Name: string, a_Fallback: string) => {
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue(a_Name)
    .trim();
  return v || a_Fallback;
};

export const useRegionBoundary = (a_Map: maplibregl.Map | null) => {
  useEffect(() => {
    if (!a_Map) return;
    const map = a_Map;

    // A distinct ramp from AOI draw (teal/orange) and the hotspot boundary
    // (purple), since a committed AOI and a selected event's layers are
    // commonly on screen together.
    const eezColor = readToken('--color-secondary-blue5', '#42465e');
    const mpaColor = readToken('--color-secondary-blue8', '#959ab1');

    const addSourceAndLayers = () => {
      if (!map.getSource(SRC)) {
        map.addSource(SRC, {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
        });
      }
      if (!map.getLayer(L_EEZ_FILL)) {
        map.addLayer({
          id: L_EEZ_FILL,
          type: 'fill',
          source: SRC,
          filter: ['==', ['get', 'kind'], KIND.eez],
          paint: { 'fill-color': eezColor, 'fill-opacity': 0.1 },
        });
      }
      if (!map.getLayer(L_EEZ_LINE)) {
        map.addLayer({
          id: L_EEZ_LINE,
          type: 'line',
          source: SRC,
          filter: ['==', ['get', 'kind'], KIND.eez],
          paint: { 'line-color': eezColor, 'line-width': 2 },
        });
      }
      if (!map.getLayer(L_MPA_FILL)) {
        map.addLayer({
          id: L_MPA_FILL,
          type: 'fill',
          source: SRC,
          filter: ['==', ['get', 'kind'], KIND.mpa],
          paint: { 'fill-color': mpaColor, 'fill-opacity': 0.1 },
        });
      }
      if (!map.getLayer(L_MPA_LINE)) {
        map.addLayer({
          id: L_MPA_LINE,
          type: 'line',
          source: SRC,
          filter: ['==', ['get', 'kind'], KIND.mpa],
          paint: { 'line-color': mpaColor, 'line-width': 2 },
        });
      }
    };

    const render = () => {
      const { eezBoundaries, mpaZones, eezGeometries, mpaGeometries } =
        useContextLayersStore.getState();
      // ContextLayersBlock only clears eezGeometries/mpaGeometries on its own
      // effect re-running (toggle off, or the newly selected event lacking
      // that layer) -- it does not run that cleanup on unmount, so a
      // deselected event (activeEvent -> null) would otherwise leave a stale
      // boundary on screen. Gate on activeEvent directly, same as
      // useHotspotBoundary, so "nothing selected" always means "nothing
      // drawn" regardless of what's left over in the store.
      const { activeEvent } = useEventStore.getState();

      const features: Feature[] = [];
      if (activeEvent && eezBoundaries) {
        eezGeometries.forEach((f) =>
          features.push({
            type: 'Feature',
            properties: { kind: KIND.eez },
            geometry: f.geometry,
          } as Feature),
        );
      }
      if (activeEvent && mpaZones) {
        mpaGeometries.forEach((f) =>
          features.push({
            type: 'Feature',
            properties: { kind: KIND.mpa },
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

    const unsubContextLayers = useContextLayersStore.subscribe((cur, prev) => {
      if (
        cur.eezBoundaries !== prev.eezBoundaries ||
        cur.mpaZones !== prev.mpaZones ||
        cur.eezGeometries !== prev.eezGeometries ||
        cur.mpaGeometries !== prev.mpaGeometries
      ) {
        render();
      }
    });
    const unsubEvents = useEventStore.subscribe((cur, prev) => {
      if (cur.activeEvent !== prev.activeEvent) render();
    });

    return () => {
      unsubContextLayers();
      unsubEvents();
      map.off('styledata', onStyleData);
      [L_EEZ_FILL, L_EEZ_LINE, L_MPA_FILL, L_MPA_LINE].forEach((id) => {
        if (map.getLayer(id)) map.removeLayer(id);
      });
      if (map.getSource(SRC)) map.removeSource(SRC);
    };
  }, [a_Map]);
};
