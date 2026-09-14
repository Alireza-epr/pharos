import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import type { Feature, FeatureCollection, Point } from 'geojson';
import { useEventStore } from '@/stores/eventStore';
import { useBottomStore } from '@/stores/bottomStore';
import { isEventDimmed } from '@/helpers/utils/eventUtils';
import { getVisibleEvents } from './useVisibleEvents';
import { useTranslator } from './translator';
import popupStyle from './useEventMarkers.module.scss';

/**
 * Draws every currently-relevant SAR detection on the map as a dot, plus two
 * small overlay layers for selection and export-list membership. The "which
 * events" question always defers to getVisibleEvents() (the same
 * matched/unmatched-tab + sort rule the bottom panel table uses) unioned
 * with the export list (selectedEvents), which can hold events from a page
 * the user has since navigated away from -- your export queue stays visible
 * regardless of what page or filter you're currently looking at.
 *
 * Visual encoding (kept in sync with EventMarkersLegend.tsx):
 *  - fill color:   matched (teal) / unmatched (orange) -- same hues as the
 *                  table's badges, so a color means the same thing in both.
 *  - radius:       triage score (small range) -- "worth a closer look", not
 *                  a risk color; a null score renders at a neutral midpoint.
 *  - opacity:      dimmed once something is selected, *unless* the dot is
 *                  the selection itself, shares its hotspot cell, or is in
 *                  the export list (isEventDimmed) -- those three stay
 *                  fully visible.
 *  - ring:         the selected event only.
 *  - small badge:  events in the export list.
 * Deliberately no icons/sprites for gear/vessel type or confidence tier --
 * MapCanvas already avoids loading sprite/glyph resources, and neither
 * dimension reads well as a shape at this cardinality anyway; both show in
 * the hover popup instead.
 *
 * Below CLUSTER_MAX_ZOOM, nearby dots merge into a cluster bubble (a plain
 * GeoJSON source `cluster: true` option -- maplibre-gl bundles supercluster
 * for this, no separate dependency or hand-rolled spatial index needed).
 * Size-only, no count label: same "no glyph resources" constraint above
 * rules out a text symbol layer, since the basemap style sets no `glyphs`
 * URL for MapLibre to fetch font ranges from. Clicking a cluster zooms in
 * just enough to split it apart. Individual click/hover hit-testing and
 * "what's in view" are already effectively indexed for free by using a real
 * GL circle layer with layer-scoped events (`map.on(event, layerId, ...)`)
 * instead of per-event DOM markers -- clustering was the one actual gap.
 *
 * Kept as its own module (only imported by the already-lazy MapCanvas), same
 * pattern as useAOIDraw / useHotspotBoundary / useRegionBoundary.
 */

const SRC = 'event-markers-src';
const L_DOTS = 'event-markers-dots';
const L_SELECTED = 'event-markers-selected-ring';
const L_EXPORTED = 'event-markers-exported-badge';
const L_CLUSTERS = 'event-markers-clusters';

const MIN_RADIUS_PX = 5;
const MAX_RADIUS_PX = 9;
const SELECTED_RING_RADIUS_PX = 13;
const EXPORT_BADGE_RADIUS_PX = 3;
const EXPORT_BADGE_OFFSET_PX: [number, number] = [7, -7];
// Below this zoom, nearby dots merge into one cluster bubble instead of
// rendering individually -- keeps hundreds of overlapping dots from turning
// into unreadable clutter (and unusably slow hit-testing) when zoomed out.
// <= initialView.maxZoom (12) so the tightest zoom always shows raw dots,
// never a cluster that can't break apart any further.
const CLUSTER_MAX_ZOOM = 11;
const CLUSTER_RADIUS_PX = 50;
// count >= threshold -> radius, first entry is the below-10 default.
const CLUSTER_RADIUS_STEPS = [14, 10, 20, 50, 26] as const;
// A null/missing triage score renders at this fixed point on the 0-1 scale
// -- a deliberately neutral mid-size, not the smallest or largest dot, so
// "no score yet" doesn't read as "definitely low priority".
const NEUTRAL_SCORE = 0.4;
const DIMMED_OPACITY = 0.35;

// Fallbacks only apply if the design tokens can't be read at runtime.
const readToken = (a_Name: string, a_Fallback: string) => {
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue(a_Name)
    .trim();
  return v || a_Fallback;
};

export const useEventMarkers = (a_Map: maplibregl.Map | null) => {
  const { t } = useTranslator();
  // t comes from context and changes with the language; keep it fresh behind
  // a ref so the long-lived popup closure below always reads the current one
  // (same trick useAOIDraw uses for its hint text).
  const tRef = useRef(t);
  tRef.current = t;

  useEffect(() => {
    if (!a_Map) return;
    const map = a_Map;

    const matchedColor = readToken('--color-accent-teal2', '#0a8f87');
    const unmatchedColor = readToken('--color-alert-orange3', '#ff9f1c');
    const selectedRingColor = readToken('--color-primary-purple6', '#6c5dd3');
    const exportBadgeColor = readToken('--color-primary-purple8', '#aca0fc');
    const haloColor = readToken('--theme-bg-card', '#1a1b2b');
    // A neutral tone, deliberately not the teal/orange match-state colors
    // (a cluster mixes both) and not the accent-blue reserved for the AOI
    // shape -- the "secondary" ramp is otherwise only used for UI chrome, so
    // it's free for a structural map element like this.
    const clusterColor = readToken('--color-secondary-blue7', '#747a9a');

    const addSourceAndLayers = () => {
      if (!map.getSource(SRC)) {
        map.addSource(SRC, {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
          cluster: true,
          clusterMaxZoom: CLUSTER_MAX_ZOOM,
          clusterRadius: CLUSTER_RADIUS_PX,
        });
      }
      if (!map.getLayer(L_CLUSTERS)) {
        map.addLayer({
          id: L_CLUSTERS,
          type: 'circle',
          source: SRC,
          filter: ['has', 'point_count'],
          paint: {
            'circle-radius': ['step', ['get', 'point_count'], ...CLUSTER_RADIUS_STEPS],
            'circle-color': clusterColor,
            'circle-opacity': 0.75,
            'circle-stroke-width': 1,
            'circle-stroke-color': haloColor,
          },
        });
      }
      if (!map.getLayer(L_DOTS)) {
        map.addLayer({
          id: L_DOTS,
          type: 'circle',
          source: SRC,
          // Clustered points are drawn by L_CLUSTERS instead -- without this
          // filter they'd render twice once clustering groups them.
          filter: ['!', ['has', 'point_count']],
          paint: {
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['coalesce', ['get', 'score'], NEUTRAL_SCORE],
              0,
              MIN_RADIUS_PX,
              1,
              MAX_RADIUS_PX,
            ],
            'circle-color': [
              'case',
              ['get', 'matched'],
              matchedColor,
              unmatchedColor,
            ],
            'circle-opacity': ['case', ['get', 'dim'], DIMMED_OPACITY, 1],
            'circle-stroke-width': 1,
            'circle-stroke-color': haloColor,
          },
        });
      }
      if (!map.getLayer(L_SELECTED)) {
        map.addLayer({
          id: L_SELECTED,
          type: 'circle',
          source: SRC,
          filter: ['==', ['get', 'active'], true],
          paint: {
            'circle-radius': SELECTED_RING_RADIUS_PX,
            'circle-opacity': 0,
            'circle-stroke-width': 2,
            'circle-stroke-color': selectedRingColor,
          },
        });
      }
      if (!map.getLayer(L_EXPORTED)) {
        map.addLayer({
          id: L_EXPORTED,
          type: 'circle',
          source: SRC,
          filter: ['==', ['get', 'exported'], true],
          paint: {
            'circle-radius': EXPORT_BADGE_RADIUS_PX,
            'circle-color': exportBadgeColor,
            'circle-translate': EXPORT_BADGE_OFFSET_PX,
            'circle-stroke-width': 1,
            'circle-stroke-color': haloColor,
          },
        });
      }
    };

    const buildFeatures = (): Feature<Point>[] => {
      const { events, activeEvent, selectedEvents } = useEventStore.getState();
      const { filter, sorts } = useBottomStore.getState();

      const visible = getVisibleEvents(events, filter, sorts);
      const exportedIds = new Set(selectedEvents.map((e) => e.event_id));

      // The export list can reference events from a page the user has since
      // navigated away from -- merge it in rather than only drawing the
      // current page, deduped so a currently-visible + exported event isn't
      // drawn twice.
      const byId = new Map<string, (typeof visible)[number]>();
      visible.forEach((e) => byId.set(e.event_id, e));
      selectedEvents.forEach((e) => {
        if (!byId.has(e.event_id)) byId.set(e.event_id, e);
      });

      return Array.from(byId.values()).map((event) => {
        const isActive = activeEvent?.event_id === event.event_id;
        const isExported = exportedIds.has(event.event_id);

        return {
          type: 'Feature',
          properties: {
            event_id: event.event_id,
            matched: !!event.matched_flag,
            score: event.scoring.triage_score,
            uncertainty: event.scoring.uncertainty_score,
            active: isActive,
            exported: isExported,
            dim: isEventDimmed(event, activeEvent, exportedIds),
          },
          geometry: { type: 'Point', coordinates: [event.lon, event.lat] },
        };
      });
    };

    const render = () => {
      const fc: FeatureCollection = {
        type: 'FeatureCollection',
        features: buildFeatures(),
      };
      const src = map.getSource(SRC) as maplibregl.GeoJSONSource | undefined;
      src?.setData(fc);
    };

    // ---- selection ----------------------------------------------------
    const onClick = (e: maplibregl.MapLayerMouseEvent) => {
      const feature = e.features?.[0];
      const eventId = feature?.properties?.event_id as string | undefined;
      if (!eventId) return;

      const { events, activeEvent, selectedEvents } = useEventStore.getState();
      const found =
        events.find((ev) => ev.event_id === eventId) ??
        selectedEvents.find((ev) => ev.event_id === eventId) ??
        null;
      // Clicking the already-active dot deselects it, same as re-clicking
      // the active row in the table.
      useEventStore
        .getState()
        .setActiveEvent(activeEvent?.event_id === eventId ? null : found);
    };

    // ---- hover popup ----------------------------------------------------
    // Line 1: match state. Then one line each for triage score and
    // uncertainty score (kept separate, not joined on one line -- a
    // combined line was long enough to wrap mid-phrase). Then, only for a
    // matched detection (raw_metadata is only meaningfully populated once
    // an AIS identity is attached), one line per identifying field that's
    // actually present.
    const popup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: MAX_RADIUS_PX + 4,
    });

    const setCursor = (a_Cursor: string) => {
      map.getCanvas().style.cursor = a_Cursor;
    };

    const buildPopupHTML = (a_EventId: string, a_Matched: boolean): string => {
      const { events, selectedEvents } = useEventStore.getState();
      const event =
        events.find((e) => e.event_id === a_EventId) ??
        selectedEvents.find((e) => e.event_id === a_EventId) ??
        null;

      const line = (a_Text: string) =>
        `<div class="${popupStyle.popupLine}">${a_Text}</div>`;

      const lines: string[] = [
        `<strong class="${popupStyle.popupId}">${
          a_Matched
            ? tRef.current('general.label.matched')
            : tRef.current('general.label.unmatched')
        }</strong>`,
      ];

      const score = event?.scoring.triage_score;
      const uncertainty = event?.scoring.uncertainty_score;
      if (typeof score === 'number') {
        lines.push(
          line(
            `${tRef.current('sidebar.label.triageScore')}: ${score.toFixed(2)}`,
          ),
        );
      }
      if (typeof uncertainty === 'number') {
        lines.push(
          line(
            `${tRef.current('sidebar.label.uncertaintyScore')}: ${uncertainty.toFixed(2)}`,
          ),
        );
      }

      // Not "NA"/"" -- raw_metadata.vesselType/flag/etc use those as an
      // explicit "not applicable" sentinel (see EVessleType), not just an
      // absent value.
      const isPresent = (a_Value: string | undefined) =>
        !!a_Value && a_Value !== 'NA';

      if (a_Matched && event?.raw_metadata) {
        const raw = event.raw_metadata;
        const fields: [string, string | undefined][] = [
          [tRef.current('general.label.name'), raw.shipName],
          [tRef.current('general.label.vesselType'), raw.vesselType],
          [tRef.current('general.label.gearType'), raw.geartype],
          [tRef.current('general.label.flag'), raw.flag],
        ];
        fields
          .filter(([, value]) => isPresent(value))
          .forEach(([label, value]) => lines.push(line(`${label}: ${value}`)));
      }

      return `<div class="${popupStyle.popup}">${lines.join('')}</div>`;
    };

    const onMouseEnter = (e: maplibregl.MapLayerMouseEvent) => {
      setCursor('pointer');
      const feature = e.features?.[0];
      const p = feature?.properties;
      if (!feature?.geometry || feature.geometry.type !== 'Point' || !p) return;

      popup
        .setLngLat(feature.geometry.coordinates as [number, number])
        .setHTML(buildPopupHTML(String(p.event_id), !!p.matched))
        .addTo(map);
    };

    const onMouseLeave = () => {
      setCursor('');
      popup.remove();
    };

    // ---- clusters ---------------------------------------------------------
    // Clicking a cluster bubble zooms in just enough to split it apart,
    // rather than selecting anything -- there's no single event to select.
    const onClusterClick = async (e: maplibregl.MapLayerMouseEvent) => {
      const feature = e.features?.[0];
      const clusterId = feature?.properties?.cluster_id as number | undefined;
      if (clusterId === undefined || feature?.geometry.type !== 'Point') return;

      const src = map.getSource(SRC) as maplibregl.GeoJSONSource;
      const expansionZoom = await src.getClusterExpansionZoom(clusterId);
      map.easeTo({
        center: feature.geometry.coordinates as [number, number],
        zoom: expansionZoom,
      });
    };

    const onClusterMouseEnter = () => setCursor('pointer');
    const onClusterMouseLeave = () => setCursor('');

    // A theme toggle calls map.setStyle(), which wipes every custom source
    // and layer. Re-add and repaint whenever a new style finishes loading.
    const onStyleData = () => {
      if (map.getSource(SRC)) return;
      addSourceAndLayers();
      render();
    };

    addSourceAndLayers();
    map.on('styledata', onStyleData);
    map.on('click', L_DOTS, onClick);
    map.on('mouseenter', L_DOTS, onMouseEnter);
    map.on('mouseleave', L_DOTS, onMouseLeave);
    map.on('click', L_CLUSTERS, onClusterClick);
    map.on('mouseenter', L_CLUSTERS, onClusterMouseEnter);
    map.on('mouseleave', L_CLUSTERS, onClusterMouseLeave);
    render();

    const unsubEvents = useEventStore.subscribe((cur, prev) => {
      if (
        cur.events !== prev.events ||
        cur.activeEvent !== prev.activeEvent ||
        cur.selectedEvents !== prev.selectedEvents
      ) {
        render();
      }
    });
    const unsubBottom = useBottomStore.subscribe((cur, prev) => {
      if (cur.filter !== prev.filter || cur.sorts !== prev.sorts) render();
    });

    return () => {
      unsubEvents();
      unsubBottom();
      popup.remove();
      map.off('styledata', onStyleData);
      map.off('click', L_DOTS, onClick);
      map.off('mouseenter', L_DOTS, onMouseEnter);
      map.off('mouseleave', L_DOTS, onMouseLeave);
      map.off('click', L_CLUSTERS, onClusterClick);
      map.off('mouseenter', L_CLUSTERS, onClusterMouseEnter);
      map.off('mouseleave', L_CLUSTERS, onClusterMouseLeave);
      setCursor('');
      [L_DOTS, L_SELECTED, L_EXPORTED, L_CLUSTERS].forEach((id) => {
        if (map.getLayer(id)) map.removeLayer(id);
      });
      if (map.getSource(SRC)) map.removeSource(SRC);
    };
  }, [a_Map]);
};
