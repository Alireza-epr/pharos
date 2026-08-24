import mapLegendStyle from './MapLegend.module.scss';
import { useTranslator } from '@/hooks/translator';
import { useAOIStore } from '@/stores/areaOfInterestStore';
import { useContextLayersStore } from '@/stores/contextLayersStore';
import { useEventStore } from '@/stores/eventStore';
import { EGeoJSONGeometryType } from '@packages/enum';

export interface IMapLegendProps {}

/**
 * A small, non-interactive color key for whatever is actually drawn on the
 * map right now -- AOI (zonal / point / a chosen EEZ/MPA region), the
 * selected event's hotspot cell, and its EEZ/MPA boundaries. Deliberately
 * dynamic, not a static catalog of every possible layer: a swatch only
 * appears while its layer is actually on screen, so the legend never claims
 * something is drawn that isn't (see useAOIDraw / useAOIRegionBoundary /
 * useHotspotBoundary / useRegionBoundary, whose draw conditions this
 * mirrors). Colors are read from the same design tokens those hooks use --
 * keep the two in sync if either changes.
 */
const MapLegend = () => {
  const { t } = useTranslator();

  const aoiFeature = useAOIStore((s) => s.feature);
  const aoiZonal = useAOIStore((s) => s.zonal);
  const aoiPoint = useAOIStore((s) => s.point);
  const aoiEezActive = useAOIStore((s) => s.eezActive);
  const aoiMpaActive = useAOIStore((s) => s.mpaActive);
  const aoiEezGeometries = useAOIStore((s) => s.eezGeometries);
  const aoiMpaGeometries = useAOIStore((s) => s.mpaGeometries);

  const activeEvent = useEventStore((s) => s.activeEvent);

  const hotspotOn = useContextLayersStore((s) => s.hotspots);
  const eezOn = useContextLayersStore((s) => s.eezBoundaries);
  const mpaOn = useContextLayersStore((s) => s.mpaZones);
  const eezGeometries = useContextLayersStore((s) => s.eezGeometries);
  const mpaGeometries = useContextLayersStore((s) => s.mpaGeometries);

  const items = [
    {
      show:
        aoiZonal || aoiFeature?.geometry.type === EGeoJSONGeometryType.Polygon,
      swatch: mapLegendStyle.swatchAoiZonal,
      label: `${t('general.label.aoi')} · ${t('general.label.zonal')}`,
    },
    {
      show: aoiPoint || aoiFeature?.geometry.type === EGeoJSONGeometryType.Point,
      swatch: mapLegendStyle.swatchAoiPoint,
      label: `${t('general.label.aoi')} · ${t('general.label.point')}`,
    },
    {
      show: !!aoiEezActive && aoiEezGeometries.length > 0,
      swatch: mapLegendStyle.swatchAoiRegion,
      label: `${t('general.label.aoi')} · ${t('sidebar.label.eezWeight')}`,
    },
    {
      show: !!aoiMpaActive && aoiMpaGeometries.length > 0,
      swatch: mapLegendStyle.swatchAoiRegion,
      label: `${t('general.label.aoi')} · ${t('sidebar.label.mpaWeight')}`,
    },
    {
      show: !!activeEvent && hotspotOn && !!activeEvent.hotspot,
      swatch: mapLegendStyle.swatchHotspot,
      label: t('sidebar.tab.hotspot'),
    },
    {
      show: !!activeEvent && eezOn && eezGeometries.length > 0,
      swatch: mapLegendStyle.swatchEez,
      label: t('sidebar.label.eezWeight'),
    },
    {
      show: !!activeEvent && mpaOn && mpaGeometries.length > 0,
      swatch: mapLegendStyle.swatchMpa,
      label: t('sidebar.label.mpaWeight'),
    },
  ].filter((item) => item.show);

  if (items.length === 0) return null;

  return (
    <div className={mapLegendStyle.wrapper} data-testid="map-legend">
      {items.map((item) => (
        <div className={mapLegendStyle.item} key={item.label}>
          <span className={`${mapLegendStyle.swatch} ${item.swatch ?? ''}`} />
          <span className={`font-size-xs ${mapLegendStyle.label}`}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default MapLegend;
