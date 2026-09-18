import { useEffect } from 'react';
import { useGfwEventStore } from '../stores/gfwEventStore';
import { useGfwEventSearchStore } from '../stores/gfwEventSearchStore';
import { useFetchGfwEvents } from './fetch';
import {
  buildEventSearchConfig,
  buildVesselRelevantEventsParams,
} from '../helpers/utils/eventConfigUtils';
import {
  buildAllDatasetsActive,
  getEventPaginationState,
} from '../helpers/utils/gfwEventUtils';

/**
 * Populates gfwEventStore -- the exact same store the Event tab's own
 * search/results/map already use -- with the events relevant to a matched
 * SAR detection's vessel, whenever that detection is selected
 * (DetailEvents.tsx). Deliberately the same store, not a parallel one:
 * DetailEvents.tsx renders the shared EventResults list as-is, and
 * useGfwEventMarkers.ts draws the same dots on the map with the same
 * click-to-select ring -- "relevant events" is just a different way of
 * arriving at gfwEventStore.events, not a separate feature.
 *
 * Replaces whatever the Event tab currently holds (including a lingering
 * manual search -- cleared before the new request even starts, same
 * pattern EventTab.tsx's own Run Query uses) and syncs the Event tab's own
 * search form (datasets, vessels) so opening that tab, or re-running Run
 * Query from it, reproduces the same result instead of showing a form that
 * doesn't match what's on screen. Fetched events draw on the map
 * immediately, same as the Event tab's own results.
 *
 * Only fetches the first page (DETAIL_EVENTS_LIMIT) -- there's no in-place
 * "More" here; when `total` exceeds what's shown, DetailEvents.tsx points
 * the user at the Event tab instead, whose Prev/Next already continue this
 * exact paging session (`lastParams` is set here for exactly that reason).
 */
export const useVesselRelevantEvents = (a_VesselId: string | undefined) => {
  const { execute, loading, error } = useFetchGfwEvents();

  const pages = useGfwEventStore((s) => s.pages);
  const pageIndex = useGfwEventStore((s) => s.pageIndex);
  const total = useGfwEventStore((s) => s.total);

  useEffect(() => {
    if (!a_VesselId) return;
    let cancelled = false;

    const { setEvents, setActiveEvent, setPages, setPageIndex, setTotal, setLastParams } =
      useGfwEventStore.getState();

    setActiveEvent(null);
    setEvents([]);
    setPages([]);
    setPageIndex(0);
    setTotal(null);

    useGfwEventSearchStore.getState().setDatasets(buildAllDatasetsActive());
    useGfwEventSearchStore.getState().setVessels(a_VesselId);

    const params = buildVesselRelevantEventsParams(a_VesselId);
    const config = buildEventSearchConfig(params);

    execute(config).then((response) => {
      if (cancelled || !response?.success || !response.entries) return;
      setPages([response.entries]);
      setPageIndex(0);
      setEvents(response.entries);
      setTotal(response.total ?? null);
      setLastParams(params);
    });

    return () => {
      cancelled = true;
    };
  }, [a_VesselId, execute]);

  const { hasNext } = getEventPaginationState(pages, pageIndex, total);

  return { loading, error, hasMore: hasNext, total };
};
