import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { circle } from '@turf/turf';
import type { Feature, FeatureCollection } from 'geojson';
import { EGeoJSONGeometryType } from '@packages/enum';
import type { IGeometry } from '@packages/types';
import { useAOIStore } from '@/stores/areaOfInterestStore';
import { useMessageStore } from '@/stores/messageStore';
import { useTranslator } from '@/hooks/translator';
import useAOIDrawStyle from "./useAOIDraw.module.scss"

/**
 * Interactive Area-of-Interest drawing on the MapLibre map. Kept as its own
 * module (only imported by the already-lazy MapCanvas) so `maplibre-gl` stays
 * inside the map chunk and never leaks into the initial bundle.
 *
 * Two tools, driven by the AOI store's `zonal` / `point` flags:
 *  - zonal: click to drop polygon vertices; double-click / right-click / Enter
 *    finishes (needs >= 3), clicking the first vertex closes, Esc cancels.
 *    Committing auto-deactivates the tool so a stray click can't destroy it.
 *  - point: one click places a single point; its radius (store `radius`, km) is
 *    rendered as a circle and buffered to a Polygon in getAOI().
 * Both commit into the store's single `feature`; vertices and the point centre
 * stay as draggable handles for editing after commit.
 *
 * All the mutable draw state (handles, in-progress vertices, mode) lives inside
 * the setup effect for the map's lifetime, and the hook reacts to store changes
 * through the store's own subscribe() rather than a chain of React effects.
 */

const SRC = 'aoi-draw-src';
const L_ZONAL_FILL = 'aoi-zonal-fill';
const L_ZONAL_LINE = 'aoi-zonal-line';
const L_POINT_FILL = 'aoi-point-fill';
const L_POINT_LINE = 'aoi-point-line';

const KIND = {
  zonalFill: 'zonal-fill',
  zonalLine: 'zonal-line',
  point: 'point',
} as const;

const MIN_VERTICES = 3;
const CIRCLE_STEPS = 64;
// A click within DUP_MS of the previous one and closer than DUP_PX is treated as
// the second half of a double-click, so finishing doesn't leave a stray vertex.
const DUP_MS = 300;
const DUP_PX = 6;
// Click within CLOSE_PX of the first vertex closes the ring.
const CLOSE_PX = 12;

// Fallbacks only apply if the design tokens can't be read at runtime.
const readToken = (a_Name: string, a_Fallback: string) => {
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue(a_Name)
    .trim();
  return v || a_Fallback;
};

type TMode = 'idle' | 'zonal' | 'point';
type TCommitted = 'zonal' | 'point' | null;

export const useAOIDraw = (a_Map: maplibregl.Map | null) => {
  const { t } = useTranslator();
  // t comes from context and changes with the language; keep it fresh behind a
  // ref so the long-lived event closures below always read the current one.
  const tRef = useRef(t);
  tRef.current = t;

  useEffect(() => {
    if (!a_Map) return;
    const map = a_Map;

    // ---- mutable draw state (lives for this map's lifetime) ----------------
    let mode: TMode = 'idle';
    let committed: TCommitted = null;
    let vertexHandles: maplibregl.Marker[] = [];
    let pointHandle: maplibregl.Marker | null = null;
    // The exact geometry object last pushed to the store, so we can recognise
    // the store echo in syncFeature and skip re-rendering our own commit.
    let lastApplied: IGeometry | null = null;
    let lastClick = { t: 0, x: 0, y: 0 };

    const teal = readToken('--color-accent-teal4', '#2bb3a3');
    const orange = readToken('--color-alert-orange4', '#e8833a');

    // ---- store access (setters/values are stable via getState) -------------
    const commitFeature = (a_Geom: IGeometry | null) => {
      lastApplied = a_Geom;
      useAOIStore.getState().setFeature(a_Geom);
    };
    const endZonal = () => useAOIStore.getState().setZonal(false);
    const endPoint = () => useAOIStore.getState().setPoint(false);
    const getRadius = () => useAOIStore.getState().radius;
    const warnMinPoints = () =>
      useMessageStore.getState().setWarn(tRef.current('sidebar.text.zonalMinPoints'));

    // ---- source / layers ---------------------------------------------------
    const addSourceAndLayers = () => {
      if (!map.getSource(SRC)) {
        map.addSource(SRC, {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
        });
      }
      if (!map.getLayer(L_ZONAL_FILL)) {
        map.addLayer({
          id: L_ZONAL_FILL,
          type: 'fill',
          source: SRC,
          filter: ['==', ['get', 'kind'], KIND.zonalFill],
          paint: { 'fill-color': teal, 'fill-opacity': 0.15 },
        });
      }
      if (!map.getLayer(L_ZONAL_LINE)) {
        map.addLayer({
          id: L_ZONAL_LINE,
          type: 'line',
          source: SRC,
          filter: ['==', ['get', 'kind'], KIND.zonalLine],
          paint: { 'line-color': teal, 'line-width': 2 },
        });
      }
      if (!map.getLayer(L_POINT_FILL)) {
        map.addLayer({
          id: L_POINT_FILL,
          type: 'fill',
          source: SRC,
          filter: ['==', ['get', 'kind'], KIND.point],
          paint: { 'fill-color': orange, 'fill-opacity': 0.12 },
        });
      }
      if (!map.getLayer(L_POINT_LINE)) {
        map.addLayer({
          id: L_POINT_LINE,
          type: 'line',
          source: SRC,
          filter: ['==', ['get', 'kind'], KIND.point],
          paint: { 'line-color': orange, 'line-width': 2 },
        });
      }
    };

    // A theme toggle calls map.setStyle(), which wipes every custom source and
    // layer. The DOM handles survive; re-add the source/layers and repaint from
    // them whenever a new style finishes loading.
    const onStyleData = () => {
      if (map.getSource(SRC)) return;
      addSourceAndLayers();
      render();
    };

    // ---- rendering ---------------------------------------------------------
    const positions = (): [number, number][] =>
      vertexHandles.map((m) => {
        const p = m.getLngLat();
        return [p.lng, p.lat];
      });

    const render = () => {
      const features: Feature[] = [];
      const ring = positions();
      const drawing = mode === 'zonal';

      // Fill only once the ring is closed (committed). While drawing we show just
      // the outline, so an open shape never looks finished / query-ready.
      if (!drawing && ring.length >= MIN_VERTICES) {
        const first = ring[0]!;
        features.push({
          type: 'Feature',
          properties: { kind: KIND.zonalFill },
          geometry: { type: 'Polygon', coordinates: [[...ring, first]] },
        });
      }
      if (ring.length >= 2) {
        const first = ring[0]!;
        // Open polyline while drawing; closed ring once committed.
        const line = drawing ? ring : [...ring, first];
        features.push({
          type: 'Feature',
          properties: { kind: KIND.zonalLine },
          geometry: { type: 'LineString', coordinates: line },
        });
      }

      const center = pointHandle?.getLngLat();
      if (center) {
        const c = circle([center.lng, center.lat], getRadius(), {
          units: 'kilometers',
          steps: CIRCLE_STEPS,
        });
        features.push({ ...c, properties: { kind: KIND.point } });
      }

      const fc: FeatureCollection = { type: 'FeatureCollection', features };
      const src = map.getSource(SRC) as maplibregl.GeoJSONSource | undefined;
      src?.setData(fc);
    };

    const setCursor = (a_Cursor: string) => {
      map.getCanvas().style.cursor = a_Cursor;
    };

    // ---- handles -----------------------------------------------------------
    const addVertexHandle = (a_LngLat: [number, number]) => {
      const el = document.createElement('div');
      el.className = useAOIDrawStyle.vertexHandle ?? '';
      const marker = new maplibregl.Marker({ element: el, draggable: true })
        .setLngLat(a_LngLat)
        .addTo(map);
      marker.on('drag', render);
      marker.on('dragend', () => {
        if (committed === 'zonal') recommitZonal();
      });
      vertexHandles.push(marker);
    };

    const setPointHandle = (a_LngLat: [number, number]) => {
      if (pointHandle) {
        pointHandle.setLngLat(a_LngLat);
        return;
      }
      const el = document.createElement('div');
      el.className = useAOIDrawStyle.pointHandle ?? '';
      const marker = new maplibregl.Marker({ element: el, draggable: true })
        .setLngLat(a_LngLat)
        .addTo(map);
      marker.on('drag', render);
      marker.on('dragend', () => {
        const p = marker.getLngLat();
        commitPoint([p.lng, p.lat]);
      });
      pointHandle = marker;
    };

    const removeVertexHandles = () => {
      vertexHandles.forEach((m) => m.remove());
      vertexHandles = [];
    };

    const removePointHandle = () => {
      pointHandle?.remove();
      pointHandle = null;
    };

    const clearGeometry = () => {
      removeVertexHandles();
      removePointHandle();
      committed = null;
      render();
    };

    const buildRing = (): IGeometry | null => {
      const ring = positions();
      const first = ring[0];
      if (!first) return null;
      return {
        type: EGeoJSONGeometryType.Polygon,
        coordinates: [[...ring, first]],
      };
    };

    const recommitZonal = () => {
      const geom = buildRing();
      if (geom) commitFeature(geom);
    };

    const commitPoint = (a_Center: [number, number]) => {
      commitFeature({
        type: EGeoJSONGeometryType.Point,
        coordinates: a_Center,
      });
    };

    // ---- zonal -------------------------------------------------------------
    const onZonalClick = (e: maplibregl.MapMouseEvent) => {
      const now = Date.now();
      const dist = Math.hypot(e.point.x - lastClick.x, e.point.y - lastClick.y);
      if (now - lastClick.t < DUP_MS && dist < DUP_PX) return; // dbl-click tail
      lastClick = { t: now, x: e.point.x, y: e.point.y };

      // Clicking the first vertex closes the ring.
      if (vertexHandles.length >= MIN_VERTICES) {
        const first = vertexHandles[0];
        if (first) {
          const p = map.project(first.getLngLat());
          if (Math.hypot(e.point.x - p.x, e.point.y - p.y) < CLOSE_PX) {
            finishZonal();
            return;
          }
        }
      }
      addVertexHandle([e.lngLat.lng, e.lngLat.lat]);
      render();
    };

    const onDblClick = (e: maplibregl.MapMouseEvent) => {
      e.preventDefault();
      finishZonal();
    };

    const onContextMenu = (e: maplibregl.MapMouseEvent) => {
      e.preventDefault();
      finishZonal();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (mode !== 'zonal') return;
      if (e.key === 'Enter') finishZonal();
      else if (e.key === 'Escape') cancelZonal();
    };

    const bindZonal = () => {
      map.on('click', onZonalClick);
      map.on('dblclick', onDblClick);
      map.on('contextmenu', onContextMenu);
      window.addEventListener('keydown', onKeyDown);
    };

    const unbindZonal = () => {
      map.off('click', onZonalClick);
      map.off('dblclick', onDblClick);
      map.off('contextmenu', onContextMenu);
      window.removeEventListener('keydown', onKeyDown);
      map.doubleClickZoom.enable();
      setCursor('');
    };

    const enterZonal = () => {
      clearGeometry();
      mode = 'zonal';
      map.doubleClickZoom.disable();
      setCursor('crosshair');
      bindZonal();
    };

    const exitZonal = () => {
      unbindZonal();
      mode = 'idle';
      if (committed !== 'zonal') clearGeometry();
      render();
    };

    const finishZonal = () => {
      if (vertexHandles.length < MIN_VERTICES) {
        warnMinPoints();
        return;
      }
      const geom = buildRing();
      if (!geom) return;
      committed = 'zonal';
      mode = 'idle';
      unbindZonal();
      commitFeature(geom);
      endZonal();
      render();
    };

    // Esc: drop the in-progress vertices but stay armed to redraw.
    const cancelZonal = () => {
      removeVertexHandles();
      lastClick = { t: 0, x: 0, y: 0 };
      render();
    };

    // ---- point -------------------------------------------------------------
    const onPointClick = (e: maplibregl.MapMouseEvent) => {
      const center: [number, number] = [e.lngLat.lng, e.lngLat.lat];
      setPointHandle(center);
      committed = 'point';
      mode = 'idle';
      map.off('click', onPointClick);
      setCursor('');
      commitPoint(center);
      endPoint();
      render();
    };

    const enterPoint = () => {
      mode = 'point';
      setCursor('crosshair');
      map.on('click', onPointClick);
    };

    const exitPoint = () => {
      map.off('click', onPointClick);
      setCursor('');
      mode = 'idle';
    };

    // ---- tool activation / store reactions ---------------------------------
    const setZonalActive = (a_Active: boolean) => {
      if (a_Active) {
        if (mode !== 'zonal') enterZonal();
      } else if (mode === 'zonal') {
        // Button toggled off mid-draw (not a commit): abort and exit cleanly.
        exitZonal();
      }
    };

    const setPointActive = (a_Active: boolean) => {
      if (a_Active) {
        if (mode !== 'point') enterPoint();
      } else if (mode === 'point') {
        exitPoint();
      }
    };

    // Radius lives outside the feature; a change only re-renders the circle.
    const onRadiusChange = () => {
      if (committed === 'point' || mode === 'point') render();
    };

    // React to external feature changes (Clear button, or a programmatic set).
    const syncFeature = (a_Feature: IGeometry | null) => {
      if (a_Feature === lastApplied) return; // our own commit echo
      clearGeometry();
      lastApplied = a_Feature;
      if (!a_Feature) return;
      if (a_Feature.type === EGeoJSONGeometryType.Polygon) {
        const ring = (a_Feature.coordinates as [number, number][][])[0] ?? [];
        // Drop the closing vertex (ring is [v0..vn, v0]).
        ring.slice(0, Math.max(0, ring.length - 1)).forEach((c) => {
          addVertexHandle(c as [number, number]);
        });
        committed = 'zonal';
      } else if (a_Feature.type === EGeoJSONGeometryType.Point) {
        setPointHandle(a_Feature.coordinates as [number, number]);
        committed = 'point';
      }
      render();
    };

    // ---- setup / teardown --------------------------------------------------
    addSourceAndLayers();
    map.on('styledata', onStyleData);

    // Apply whatever state already exists when the map becomes ready.
    const initial = useAOIStore.getState();
    syncFeature(initial.feature);
    setZonalActive(initial.zonal);
    setPointActive(initial.point);

    const unsubscribe = useAOIStore.subscribe((cur, prev) => {
      if (cur.zonal !== prev.zonal) setZonalActive(cur.zonal);
      if (cur.point !== prev.point) setPointActive(cur.point);
      if (cur.radius !== prev.radius) onRadiusChange();
      if (cur.feature !== prev.feature) syncFeature(cur.feature);
    });

    return () => {
      unsubscribe();
      unbindZonal();
      map.off('styledata', onStyleData);
      map.off('click', onPointClick);
      removeVertexHandles();
      removePointHandle();
      [L_ZONAL_FILL, L_ZONAL_LINE, L_POINT_FILL, L_POINT_LINE].forEach((id) => {
        if (map.getLayer(id)) map.removeLayer(id);
      });
      if (map.getSource(SRC)) map.removeSource(SRC);
    };
  }, [a_Map]);
};
