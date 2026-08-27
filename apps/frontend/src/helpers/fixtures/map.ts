import type { StyleSpecification } from 'maplibre-gl';
import { ETheme, type TTheme } from '../../helpers/enum/storeEnum';

/**
 * Initial camera, read from env so each deployment can point the map at its own
 * area of interest without a code change. Defaults centre on the Strait of
 * Hormuz / Persian Gulf — a recognisable maritime position rather than null
 * island. See VITE_MAP_* in .env.
 */
export const initialView = {
  center: [
    Number(import.meta.env.VITE_MAP_CENTER_LNG ?? 56.25),
    Number(import.meta.env.VITE_MAP_CENTER_LAT ?? 26.36),
  ] as [number, number], // [lng, lat]
  zoom: Number(import.meta.env.VITE_MAP_ZOOM ?? 7),
  minZoom: Number(import.meta.env.VITE_MAP_MIN_ZOOM ?? 1),
  maxZoom: Number(import.meta.env.VITE_MAP_MAX_ZOOM ?? 12),
};

/**
 * App theme → CARTO basemap slug. The app theme is binary (light/dark): light
 * maps to Voyager (coloured but clean — blue water, green land) and dark to Dark
 * Matter (near-black water). Other CARTO slugs you can drop in here:
 * `light_all` (Positron grey), `light_nolabels`, `rastertiles/voyager_nolabels`,
 * `dark_nolabels`. Typed as Record<TTheme, …> so adding a theme is a compile
 * error here until it's mapped.
 */
const CARTO_SLUG: Record<TTheme, string> = {
  [ETheme.light]: 'rastertiles/voyager',
  [ETheme.dark]: 'dark_all',
};

// CARTO's public CDN serves from four subdomains; MapLibre has no {s}
// placeholder, so they're listed out.
const SUBDOMAINS = ['a', 'b', 'c', 'd'];

const CARTO_API_KEY = import.meta.env.VITE_CARTO_API_KEY as string | undefined;

const getTiles = (a_Theme: TTheme) =>
  SUBDOMAINS.map((s) => {
    const url = `https://${s}.basemaps.cartocdn.com/${CARTO_SLUG[a_Theme]}/{z}/{x}/{y}.png`;
    return CARTO_API_KEY ? `${url}?key=${CARTO_API_KEY}` : url;
  });

/**
 * Lightweight raster-only basemap, themed from the app store. A muted, clean
 * canvas chosen for maritime SAR-AIS work — coloured AIS tracks and SAR markers
 * stay the focus, and (unlike the OSM standard style) no busy dashed maritime
 * boundaries are painted across the sea.
 *
 * Raster (not vector) keeps things minimal: a single source, no sprite/glyph
 * resources to download. CARTO bakes labels into the tiles, so we fetch nothing
 * extra for them. Requires VITE_CARTO_API_KEY (see getTiles above) — CARTO
 * retired anonymous access to this CDN. Attribution for both OSM data and
 * CARTO styling remains mandatory regardless of key.
 *
 * Pure function of `theme` so callers can re-theme the live map on toggle (see
 * MapCanvas) rather than freezing the basemap at module-load time.
 */
export const buildBasemapStyle = (a_Theme: TTheme): StyleSpecification => ({
  version: 8,
  sources: {
    carto: {
      type: 'raster',
      tiles: getTiles(a_Theme),
      tileSize: 256,
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
    },
  },
  layers: [
    {
      id: 'carto-basemap',
      type: 'raster',
      source: 'carto',
    },
  ],
});
