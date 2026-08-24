import { useMemo } from 'react';
import { sortEventSchema } from '@packages/utils';
import { IEventSchema, ISortOption } from '@packages/types';
import { TMatchFilter } from '@packages/enum';
import { useEventStore } from '../stores/eventStore';
import { useBottomStore } from '../stores/bottomStore';

/**
 * Filters a_Events by the matched/unmatched tab, sorts by the active
 * column(s), and drops rejected events -- the exact rule the bottom panel
 * table renders by. Extracted as a plain function (not just the hook below)
 * so a non-component consumer -- useEventMarkers, so the map always agrees
 * with what the table currently shows -- can apply the identical rule
 * without needing React hook context.
 */
export const getVisibleEvents = (
  a_Events: IEventSchema[],
  a_Filter: TMatchFilter,
  a_Sorts: ISortOption[],
): IEventSchema[] => {
  const filteredEvents =
    a_Filter === 'unmatched'
      ? a_Events.filter((e) => !e.matched_flag)
      : a_Filter === 'matched'
        ? a_Events.filter((e) => !!e.matched_flag)
        : a_Events;

  return sortEventSchema(filteredEvents, a_Sorts).filter((e) => !e.rejected);
};

/**
 * The events list in the exact order/subset the bottom panel table renders
 * it (see getVisibleEvents). Shared with DetailTab so its Next/Prev buttons
 * step through the same sequence the user clicked through, instead of raw
 * fetch order.
 */
export const useVisibleEvents = (): IEventSchema[] => {
  const events = useEventStore((s) => s.events);
  const filter = useBottomStore((s) => s.filter);
  const sorts = useBottomStore((s) => s.sorts);

  return useMemo(
    () => getVisibleEvents(events, filter, sorts),
    [events, filter, sorts],
  );
};
