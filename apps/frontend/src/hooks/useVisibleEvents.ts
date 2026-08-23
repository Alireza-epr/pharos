import { useMemo } from 'react';
import { sortEventSchema } from '@packages/utils';
import { IEventSchema } from '@packages/types';
import { useEventStore } from '../stores/eventStore';
import { useBottomStore } from '../stores/bottomStore';

/**
 * The events list in the exact order/subset the bottom panel table renders
 * it: filtered by the matched/unmatched tab, sorted by the active column
 * sort(s), rejected events dropped. Shared with DetailTab so its Next/Prev
 * buttons step through the same sequence the user clicked through, instead
 * of raw fetch order.
 */
export const useVisibleEvents = (): IEventSchema[] => {
  const events = useEventStore((s) => s.events);
  const filter = useBottomStore((s) => s.filter);
  const sorts = useBottomStore((s) => s.sorts);

  return useMemo(() => {
    const filteredEvents =
      filter === 'unmatched'
        ? events.filter((e) => !e.matched_flag)
        : filter === 'matched'
          ? events.filter((e) => !!e.matched_flag)
          : events;

    return sortEventSchema(filteredEvents, sorts).filter((e) => !e.rejected);
  }, [events, filter, sorts]);
};
