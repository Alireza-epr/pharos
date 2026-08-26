import eventLegendStyle from './EventMarkersLegend.module.scss';
import { useTranslator } from '@/hooks/translator';
import { useEventStore } from '@/stores/eventStore';
import { useBottomStore } from '@/stores/bottomStore';
import { getVisibleEvents } from '@/hooks/useVisibleEvents';
import { isEventDimmed } from '@/helpers/utils/eventUtils';

export interface IEventMarkersLegendProps {}

/**
 * A small key explaining how useEventMarkers draws detections -- fill
 * color, size, opacity, and the selection/export overlays. Kept as its own
 * box next to MapLegend rather than merged into it: MapLegend explains
 * *which layers* are on screen (swatch = a layer's color), this explains
 * *how one layer* (detections) encodes several things at once. Same "only
 * show what the map is actually doing right now" rule as MapLegend -- a row
 * only appears while its condition is true, so this never claims to explain
 * a dot that isn't drawn.
 */
const EventMarkersLegend = () => {
  const { t } = useTranslator();

  const events = useEventStore((s) => s.events);
  const selectedEvents = useEventStore((s) => s.selectedEvents);
  const activeEvent = useEventStore((s) => s.activeEvent);
  const filter = useBottomStore((s) => s.filter);
  const sorts = useBottomStore((s) => s.sorts);

  const visible = getVisibleEvents(events, filter, sorts);
  const exportedIds = new Set(selectedEvents.map((e) => e.event_id));

  const hasMatched = visible.some((e) => !!e.matched_flag);
  const hasUnmatched = visible.some((e) => !e.matched_flag);
  const hasAnyDot = visible.length > 0 || selectedEvents.length > 0;
  const hasDimmed = visible.some((e) =>
    isEventDimmed(e, activeEvent, exportedIds),
  );

  const items = [
    {
      show: hasMatched,
      icon: (
        <span
          className={`${eventLegendStyle.dot} ${eventLegendStyle.dotMatched}`}
        />
      ),
      label: t('general.label.matched'),
    },
    {
      show: hasUnmatched,
      icon: (
        <span
          className={`${eventLegendStyle.dot} ${eventLegendStyle.dotUnmatched}`}
        />
      ),
      label: t('general.label.unmatched'),
    },
    {
      // A dimmed marker keeps its real matched/unmatched hue on the map,
      // just faded -- one swatch can't show both, so this pairs the exact
      // same two colors/opacity useEventMarkers paints them with, rather
      // than standing in a made-up neutral tone for "dimmed".
      show: hasDimmed,
      icon: (
        <span className={eventLegendStyle.dimmedPair}>
          <span
            className={`${eventLegendStyle.dot} ${eventLegendStyle.dotMatched} ${eventLegendStyle.dimmedSwatch}`}
          />
          <span
            className={`${eventLegendStyle.dot} ${eventLegendStyle.dotUnmatched} ${eventLegendStyle.dimmedSwatch}`}
          />
        </span>
      ),
      label: t('general.label.outsideHotspotGroup'),
    },
    {
      show: hasAnyDot,
      icon: (
        <span className={eventLegendStyle.sizePair}>
          <span
            className={`${eventLegendStyle.dotOutline} ${eventLegendStyle.sizeSmall}`}
          />
          <span
            className={`${eventLegendStyle.dotOutline} ${eventLegendStyle.sizeLarge}`}
          />
        </span>
      ),
      label: t('general.label.triagePriority'),
    },
    {
      show: !!activeEvent,
      icon: <span className={eventLegendStyle.ring} />,
      label: t('bottomPanel.action.selected'),
    },
    {
      show: selectedEvents.length > 0,
      icon: (
        <span className={eventLegendStyle.badgeIcon}>
          <span className={eventLegendStyle.dotOutline} />
          <span className={eventLegendStyle.badgeMark} />
        </span>
      ),
      label: t('general.label.inExportList'),
    },
  ].filter((item) => item.show);

  if (items.length === 0) return null;

  return (
    <div
      className={eventLegendStyle.wrapper}
      data-testid="event-markers-legend"
    >
      {items.map((item) => (
        <div className={eventLegendStyle.item} key={item.label}>
          {item.icon}
          <span className={`font-size-xs ${eventLegendStyle.label}`}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default EventMarkersLegend;
