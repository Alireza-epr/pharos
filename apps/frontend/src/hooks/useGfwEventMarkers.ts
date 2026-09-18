import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import type { Feature, FeatureCollection, Point } from 'geojson';
import { useGfwEventStore } from '@/stores/gfwEventStore';
import { getEventDisplayFields, getEventKey } from '@/helpers/utils/gfwEventUtils';
import { useTranslator } from './translator';
// Reused as-is: MapLibre's own popup DOM chrome is styled globally
// (:global() selectors), not per-hook, so a second copy of those rules
// here would just duplicate the same CSS -- see that file's own comment.
import popupStyle from './useEventMarkers.module.scss';

/**
 * Draws every event currently in the Event tab's results list
 * (gfwEventStore.events) as a dot on the map -- as soon as a search returns,
 * with no separate "pin to map" step, and staying until the next search
 * replaces them (EventTab.tsx clears `events` immediately when a new Run
 * Query fires, same as the list). A separate, deliberately simple layer from
 * useEventMarkers.ts's SAR-detection dots: no clustering, no
 * matched/unmatched color split (GFW events have no such concept), no
 * triage-score radius. One fixed color (--color-primary-purple4, kept in
 * sync with EventMarkersLegend.tsx's own swatch) so a GFW event is visually
 * distinguishable from both the SAR/AIS detection dots (teal/orange) and the
 * AOI/EEZ/MPA shapes (blue family) it can appear alongside.
 *
 * No on-map text label: MapCanvas's basemap style deliberately sets no
 * `glyphs` URL (see useEventMarkers.ts's own comment), so a text `symbol`
 * layer wouldn't render here either -- identifying detail (vessel name,
 * event type, start time) shows in the hover popup instead, same pattern
 * the detection dots already use.
 */

const SRC = 'gfw-event-markers-src';
const L_DOTS = 'gfw-event-markers-dots';
const L_SELECTED = 'gfw-event-markers-selected-ring';

const RADIUS_PX = 6;
const SELECTED_RING_RADIUS_PX = 13;

const readToken = (a_Name: string, a_Fallback: string) => {
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue(a_Name)
    .trim();
  return v || a_Fallback;
};

export const useGfwEventMarkers = (a_Map: maplibregl.Map | null) => {
  const { t } = useTranslator();
  const tRef = useRef(t);
  tRef.current = t;

  useEffect(() => {
    if (!a_Map) return;
    const map = a_Map;

    const pinColor = readToken('--color-primary-purple4', '#453999');
    const haloColor = readToken('--theme-bg-card', '#1a1b2b');
    // Same selection-ring color/size convention as useEventMarkers.ts's own
    // L_SELECTED -- a ring around the selected marker means the same thing
    // on both layers.
    const selectedRingColor = readToken('--color-primary-purple6', '#6c5dd3');

    const addSourceAndLayer = () => {
      if (!map.getSource(SRC)) {
        map.addSource(SRC, {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
        });
      }
      if (!map.getLayer(L_DOTS)) {
        map.addLayer({
          id: L_DOTS,
          type: 'circle',
          source: SRC,
          paint: {
            'circle-radius': RADIUS_PX,
            'circle-color': pinColor,
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
    };

    const buildFeatures = (): Feature<Point>[] => {
      const { events, activeEvent } = useGfwEventStore.getState();
      const activeKey = activeEvent ? getEventKey(activeEvent) : null;
      return events.map((event) => {
        const eventKey = getEventKey(event);
        return {
          type: 'Feature',
          properties: { event_key: eventKey, active: eventKey === activeKey },
          geometry: { type: 'Point', coordinates: [event.position.lon, event.position.lat] },
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

    // ---- selection --------------------------------------------------------
    // Mirrors useEventMarkers.ts's onClick: clicking the already-active dot
    // deselects it, same as re-clicking the active row in EventResults.tsx.
    const onClick = (e: maplibregl.MapLayerMouseEvent) => {
      const feature = e.features?.[0];
      const eventKey = feature?.properties?.event_key as string | undefined;
      if (!eventKey) return;

      const { events, activeEvent } = useGfwEventStore.getState();
      const found = events.find((ev) => getEventKey(ev) === eventKey) ?? null;
      useGfwEventStore
        .getState()
        .setActiveEvent(activeEvent && getEventKey(activeEvent) === eventKey ? null : found);
    };

    // ---- hover popup ----------------------------------------------------
    const popup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: RADIUS_PX + 4,
    });

    const setCursor = (a_Cursor: string) => {
      map.getCanvas().style.cursor = a_Cursor;
    };

    const buildPopupHTML = (a_EventKey: string): string => {
      const { events } = useGfwEventStore.getState();
      const event = events.find((e) => getEventKey(e) === a_EventKey);
      if (!event) return '';

      const fields = getEventDisplayFields(event);
      const line = (a_Text: string) =>
        `<div class="${popupStyle.popupLine}">${a_Text}</div>`;

      const lines: string[] = [
        `<strong class="${popupStyle.popupId}">${
          fields.vesselName ?? tRef.current('sidebar.text.unknownVessel')
        }</strong>`,
        line(fields.type),
      ];
      if (fields.flag) lines.push(line(fields.flag));
      if (fields.start) lines.push(line(fields.start));

      return `<div class="${popupStyle.popup}">${lines.join('')}</div>`;
    };

    const onMouseEnter = (e: maplibregl.MapLayerMouseEvent) => {
      setCursor('pointer');
      const feature = e.features?.[0];
      const eventKey = feature?.properties?.event_key as string | undefined;
      if (!feature?.geometry || feature.geometry.type !== 'Point' || !eventKey) return;

      popup
        .setLngLat(feature.geometry.coordinates as [number, number])
        .setHTML(buildPopupHTML(eventKey))
        .addTo(map);
    };

    const onMouseLeave = () => {
      setCursor('');
      popup.remove();
    };

    // A theme toggle calls map.setStyle(), which wipes every custom source
    // and layer -- re-add and repaint once the new style finishes loading.
    const onStyleData = () => {
      if (map.getSource(SRC)) return;
      addSourceAndLayer();
      render();
    };

    addSourceAndLayer();
    map.on('styledata', onStyleData);
    map.on('click', L_DOTS, onClick);
    map.on('mouseenter', L_DOTS, onMouseEnter);
    map.on('mouseleave', L_DOTS, onMouseLeave);
    render();

    const unsubscribe = useGfwEventStore.subscribe((cur, prev) => {
      if (cur.events !== prev.events || cur.activeEvent !== prev.activeEvent) {
        render();
      }
    });

    return () => {
      unsubscribe();
      popup.remove();
      map.off('styledata', onStyleData);
      map.off('click', L_DOTS, onClick);
      map.off('mouseenter', L_DOTS, onMouseEnter);
      map.off('mouseleave', L_DOTS, onMouseLeave);
      setCursor('');
      [L_DOTS, L_SELECTED].forEach((id) => {
        if (map.getLayer(id)) map.removeLayer(id);
      });
      if (map.getSource(SRC)) map.removeSource(SRC);
    };
  }, [a_Map]);
};
