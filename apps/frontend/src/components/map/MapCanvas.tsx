import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import mapCanvasStyle from './MapCanvas.module.scss';
import { buildBasemapStyle, initialView } from '../../helpers/fixtures/map';
import { useAppStore } from '@/stores/appStore';
import { useAOIStore } from '@/stores/areaOfInterestStore';
import { useAOIDraw } from '@/hooks/useAOIDraw';
import { useAOIRegionBoundary } from '@/hooks/useAOIRegionBoundary';
import { useHotspotBoundary } from '@/hooks/useHotspotBoundary';
import { useRegionBoundary } from '@/hooks/useRegionBoundary';
import { useEventMarkers } from '@/hooks/useEventMarkers';
import { useTranslator } from '@/hooks/translator';
import MapLegend from './MapLegend';
import EventMarkersLegend from './EventMarkersLegend';
import { log_frontend } from '@packages/utils';
import { ELogType } from '@packages/enum';

export interface IMapCanvasProps {}

/**
 * Lazy-loaded on purpose: this is the only module that imports maplibre-gl (and
 * its CSS), so the heavy map runtime is code-split into its own chunk and never
 * ships in the initial bundle. The lazy split is the main lightness lever; the
 * map options below trim secondary cost (raster basemap with no sprite/glyph
 * resources to fetch, no 3D rotation handlers, capped zoom range).
 */
const MapCanvas = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const theme = useAppStore((s) => s.theme);
  const { t } = useTranslator();

  // Exposed only once the style has loaded, so the AOI draw hook can safely add
  // its source/layers.
  const [map, setMap] = useState<maplibregl.Map | null>(null);
  const zonal = useAOIStore((s) => s.zonal);
  const point = useAOIStore((s) => s.point);
  useAOIDraw(map);
  useAOIRegionBoundary(map);
  useHotspotBoundary(map);
  useRegionBoundary(map);
  useEventMarkers(map);

  useEffect(() => {
    if (!containerRef.current) return;
    const mapInstance = new maplibregl.Map({
      container: containerRef.current,
      // Initial basemap uses the theme at mount; runtime toggles are handled by
      // the effect below so we don't recreate the whole map.
      style: buildBasemapStyle(useAppStore.getState().theme),
      center: initialView.center,
      zoom: initialView.zoom,
      minZoom: initialView.minZoom,
      maxZoom: initialView.maxZoom,
      // Required attribution for the CARTO/OSM tiles, kept compact to save space.
      attributionControl: { compact: true },
      // 2D-only map: drop rotation/pitch so we don't pay for those interaction
      // handlers or 3D matrix work.
      dragRotate: false,
      pitchWithRotate: false,
      touchPitch: false,
      // No labels to fade, so skip the tile cross-fade render work.
      fadeDuration: 0,
    });

    mapRef.current = mapInstance;

    // Runtime failures (e.g. a tile request failing mid-session) surface here,
    // NOT through the React error boundary. Log rather than crash so the map
    // stays usable.
    mapInstance.on('error', (e) => {
      log_frontend(`maplibre runtime error: ${e.error}`, ELogType.error);
    });

    // Only hand the map to the draw hook once the style is ready; adding sources
    // / layers before 'load' throws.
    mapInstance.on('load', () => setMap(mapInstance));

    return () => {
      setMap(null);
      mapInstance.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    mapRef.current?.setStyle(buildBasemapStyle(theme));
  }, [theme]);

  const drawHint = zonal
    ? t('sidebar.text.zonalHint')
    : point
      ? t('sidebar.text.pointHint')
      : null;

  return (
    <div className={` ${mapCanvasStyle.wrapper}`}>
      <div
        ref={containerRef}
        className={` ${mapCanvasStyle.canvas}`}
        data-testid="map-canvas"
      />
      {drawHint && (
        <div className={`font-size-xs ${mapCanvasStyle.drawHint}`}>
          {drawHint}
        </div>
      )}
      <div className={mapCanvasStyle.legends}>
        <MapLegend />
        <EventMarkersLegend />
      </div>
    </div>
  );
};

export default MapCanvas;
