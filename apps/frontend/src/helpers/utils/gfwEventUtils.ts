import { TDatasetVersion, TEventSource, TGlobalEvent } from '@packages/types';
import { EEventDatasets } from '@packages/enum';
import { IGfwEventSearchStoreStates } from '../types/storeTypes';

// Pinned the same way DEFAULT_DATASETS (gfwEventSearchStore.ts) and
// filterStore.ts's own per-dataset default both already are -- see either
// for why 'v3.0' specifically.
const ALL_DATASETS_VERSION: TDatasetVersion = 'v3.0';

export interface IEventDisplayFields {
  vesselName: string | undefined;
  flag: string | undefined;
  type: string;
  start: string | undefined;
  end: string | undefined;
}

/** A compact display row for one GFW event result -- vessel name/flag plus
 * the event type and start/end time, the fields common to every
 * TGlobalEvent variant (IBaseEvent), rather than the type-specific detail
 * each variant also carries (fishing/encounter/loitering/port_visit/gap). */
export const getEventDisplayFields = (
  a_Event: TGlobalEvent,
): IEventDisplayFields => ({
  vesselName: a_Event.vessel?.name,
  flag: a_Event.vessel?.flag,
  type: a_Event.type,
  start: a_Event.start,
  end: a_Event.end,
});

/** A date-only (no time) "start - end" label for EventList.tsx's subtitle --
 * a full HH:mm:ss pair reads as noise at this row's compact grain. A plain
 * slice (not a Date parse/re-render) avoids any local-timezone shift across
 * a midnight boundary, since GFW's own timestamps are already
 * 'YYYY-MM-DDTHH:mm:ssZ'. Collapses to a single date when start and end
 * fall on the same day, and falls back to whichever end is present if only
 * one is. */
export const getEventDateRangeLabel = (
  a_Start: string | undefined,
  a_End: string | undefined,
): string | undefined => {
  const startDate = a_Start?.slice(0, 10);
  const endDate = a_End?.slice(0, 10);

  if (startDate && endDate) {
    return startDate === endDate ? startDate : `${startDate} - ${endDate}`;
  }
  return startDate ?? endDate;
};

/** GFW's own event id -- unlike vessel identity records, every TGlobalEvent
 * variant carries one directly (IBaseEvent.id), so no multi-field fallback
 * is needed the way getVesselKey() has. */
export const getEventKey = (a_Event: TGlobalEvent): string => a_Event.id;

// Mirrors isVesselSearchReady's role, but the Event tab's gate is simpler:
// GFW's own contract requires at least one dataset to search at all (see
// validateEventSearchBodyParams on the backend) -- the only precondition
// (Author call, "datasets-only" -- see conversation).
export const isEventSearchReady = (
  a_Datasets: IGfwEventSearchStoreStates['datasets'],
): boolean => Object.values(a_Datasets).some((d) => d.active);

export interface IEventPaginationState {
  /** Events fetched across every cached page so far. */
  fetchedCount: number;
  /** The next page was already fetched this session -- no request needed. */
  hasCachedNext: boolean;
  /** More pages exist upstream, beyond what's cached. */
  hasMoreOnServer: boolean;
  hasPrev: boolean;
  hasNext: boolean;
}

/**
 * Derives Prev/Next button state from GFW's plain offset/limit paging --
 * simpler than getVesselPaginationState's scroll-cursor version, since
 * "more on server" is just `fetchedCount < total`, no `since`-token check
 * needed. Pure so it's testable independent of EventTab.tsx.
 */
export const getEventPaginationState = (
  a_Pages: TGlobalEvent[][],
  a_PageIndex: number,
  a_Total: number | null,
): IEventPaginationState => {
  const fetchedCount = a_Pages.reduce((sum, page) => sum + page.length, 0);
  const hasCachedNext = a_PageIndex + 1 < a_Pages.length;
  const hasMoreOnServer = a_Total != null && fetchedCount < a_Total;
  const hasPrev = a_PageIndex > 0;
  const hasNext = hasCachedNext || hasMoreOnServer;

  return { fetchedCount, hasCachedNext, hasMoreOnServer, hasPrev, hasNext };
};

/** The offset a "next" fetch should request -- the sum of every page
 * fetched so far in this paging session (each page's own length, not
 * `limit`, so a short/partial last page still advances correctly). */
export const getNextOffset = (a_Pages: TGlobalEvent[][]): number =>
  a_Pages.reduce((sum, page) => sum + page.length, 0);

/** Every GFW event dataset, versioned -- used where a query must cover
 * every dataset rather than the user's own Datasets checkboxes (currently
 * only DetailEvents.tsx's "relevant events for this vessel"). */
export const getAllEventDatasetSources = (): TEventSource[] =>
  Object.values(EEventDatasets).map(
    (ds) => `${ds}:${ALL_DATASETS_VERSION}` as TEventSource,
  );

/** Same "every dataset" set as getAllEventDatasetSources(), shaped for
 * gfwEventSearchStore's own `datasets` field instead of the POST body --
 * used to keep the Event tab's search form in sync with a query that
 * bypassed it (DetailEvents.tsx), so opening that tab afterward shows a
 * form that actually reproduces what's on screen. */
export const buildAllDatasetsActive =
  (): IGfwEventSearchStoreStates['datasets'] =>
    Object.fromEntries(
      Object.values(EEventDatasets).map((ds) => [
        ds,
        { active: true, version: ALL_DATASETS_VERSION },
      ]),
    ) as IGfwEventSearchStoreStates['datasets'];
