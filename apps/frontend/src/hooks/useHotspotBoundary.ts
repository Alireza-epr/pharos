import { useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import { cellToBoundary } from 'h3-js';
import type { Feature, FeatureCollection } from 'geojson';
import { useContextLayersStore } from '@/stores/contextLayersStore';
import { useEventStore } from '@/stores/eventStore';

/**
 * Draws the H3 cell boundary for the selected event's hotspot on the map,
 * when the "show on map" toggle (contextLayersStore.hotspots, set from
 * HotspotContext.tsx in the Detail tab) is on. The boundary is derived
 * purely client-side from the cell id -- no backend call, no dataset --
 * since h3-js's cellToBoundary is a pure function over the index string.
 *
 * Scoped to whichever event is currently selected, not a general map layer:
 * the drawn cell is recomputed from (toggle, activeEvent) on every change,
 * so Next/Prev navigation always reflects the current event -- redrawing
 * for one with a hotspot, clearing for one without -- rather than leaving a
 * stale shape from a previously selected event.
 *
 * Kept as its own module (only imported by the already-lazy MapCanvas), same
 * pattern as useAOIDraw.
 */

const SRC = 'hotspot-boundary-src';
const L_FILL = 'hotspot-boundary-fill';
const L_LINE = 'hotspot-boundary-line';

// Fallback only applies if the design token can't be read at runtime.
const readToken = (a_Name: string, a_Fallback: string) => {
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue(a_Name)
    .trim();
  return v || a_Fallback;
};

export const useHotspotBoundary = (a_Map: maplibregl.Map | null) => {
  useEffect(() => {
    if (!a_Map) return;
    const map = a_Map;

    const purple = readToken('--color-primary-purple6', '#6c5dd3');

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
          paint: { 'fill-color': purple, 'fill-opacity': 0.12 },
        });
      }
      if (!map.getLayer(L_LINE)) {
        map.addLayer({
          id: L_LINE,
          type: 'line',
          source: SRC,
          paint: { 'line-color': purple, 'line-width': 2 },
        });
      }
    };

    const render = () => {
      const { hotspots } = useContextLayersStore.getState();
      const { activeEvent } = useEventStore.getState();
      const cellId = hotspots ? (activeEvent?.hotspot?.cell_id ?? null) : null;

      const features: Feature[] = [];
      if (cellId) {
        // isGeoJSON = true -> [lng, lat] pairs; close the ring, same as the
        // backend's featureFromHotspot (pipeline/aggregate/hotspots.ts).
        const ring = cellToBoundary(cellId, true) as [number, number][];
        ring.push(ring[0]!);
        features.push({
          type: 'Feature',
          properties: {},
          geometry: { type: 'Polygon', coordinates: [ring] },
        });
      }

      const fc: FeatureCollection = { type: 'FeatureCollection', features };
      const src = map.getSource(SRC) as maplibregl.GeoJSONSource | undefined;
      src?.setData(fc);
    };

    // A theme toggle calls map.setStyle(), which wipes every custom source
    // and layer. The stores survive; re-add and repaint whenever a new style
    // finishes loading.
    const onStyleData = () => {
      if (map.getSource(SRC)) return;
      addSourceAndLayers();
      render();
    };

    addSourceAndLayers();
    map.on('styledata', onStyleData);
    render();

    const unsubContextLayers = useContextLayersStore.subscribe((cur, prev) => {
      if (cur.hotspots !== prev.hotspots) render();
    });
    const unsubEvents = useEventStore.subscribe((cur, prev) => {
      if (cur.activeEvent !== prev.activeEvent) render();
    });

    return () => {
      unsubContextLayers();
      unsubEvents();
      map.off('styledata', onStyleData);
      [L_FILL, L_LINE].forEach((id) => {
        if (map.getLayer(id)) map.removeLayer(id);
      });
      if (map.getSource(SRC)) map.removeSource(SRC);
    };
  }, [a_Map]);
};
