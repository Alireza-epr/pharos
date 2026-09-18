import { IHistoryEntry } from '../types/storeTypes';
import { ESidebarTab } from '../enum/storeEnum';
import { useSidebarStore } from '../../stores/sidebarStore';
import { useConfigStore } from '../../stores/configStore';
import { useEventStore } from '../../stores/eventStore';
import { useVesselSearchStore } from '../../stores/vesselSearchStore';
import { useVesselStore } from '../../stores/vesselStore';
import { useGfwEventSearchStore } from '../../stores/gfwEventSearchStore';
import { useGfwEventStore } from '../../stores/gfwEventStore';
import { importConfigWithRegionPreload } from './configUtils';
import { buildVesselSearchConfig } from './vesselConfigUtils';
import {
  buildEventSearchConfig,
  importEventAOIAndTimeRange,
} from './eventConfigUtils';
import {
  syncConfigToURL,
  syncEventSearchConfigToURL,
  syncVesselSearchConfigToURL,
} from './URLUtils';

/**
 * Restores a history entry's query and result into its originating tab --
 * no fetch, since the result was captured alongside the query when it
 * actually ran (see ReportTab.tsx / VesselTab.tsx / EventTab.tsx). Switches
 * the sidebar to that tab afterwards so the restore is immediately visible.
 */
export const applyHistoryEntry = async (
  a_Entry: IHistoryEntry,
): Promise<void> => {
  if (a_Entry.tab === ESidebarTab.report) {
    await importConfigWithRegionPreload(a_Entry.config);
    useConfigStore.getState().setConfig(a_Entry.config);
    syncConfigToURL(a_Entry.config);

    useEventStore.getState().setEvents(a_Entry.result.events);
    useEventStore.getState().setPagination(a_Entry.result.pagination);
  } else if (a_Entry.tab === ESidebarTab.vessel) {
    useVesselSearchStore.getState().importVesselSearchParams(a_Entry.config);
    syncVesselSearchConfigToURL(buildVesselSearchConfig(a_Entry.config));

    useVesselStore.getState().setVessels(a_Entry.result.vessels);
    useVesselStore.getState().setPages(a_Entry.result.pages);
    useVesselStore.getState().setPageIndex(a_Entry.result.pageIndex);
    useVesselStore.getState().setSince(a_Entry.result.since);
    useVesselStore.getState().setTotal(a_Entry.result.total);
    useVesselStore.getState().setLastParams(a_Entry.result.lastParams);
  } else {
    useGfwEventSearchStore
      .getState()
      .importEventSearchParams(a_Entry.config.body_params);
    // AOI and date range are shared with the Report tab -- fully REPLACE
    // them, same as the Report tab's own restore does for itself.
    await importEventAOIAndTimeRange(a_Entry.config.body_params);
    syncEventSearchConfigToURL(buildEventSearchConfig(a_Entry.config));

    useGfwEventStore.getState().setEvents(a_Entry.result.events);
    useGfwEventStore.getState().setPages(a_Entry.result.pages);
    useGfwEventStore.getState().setPageIndex(a_Entry.result.pageIndex);
    useGfwEventStore.getState().setTotal(a_Entry.result.total);
    useGfwEventStore.getState().setLastParams(a_Entry.result.lastParams);
  }

  useSidebarStore.getState().setActiveTab(a_Entry.tab);
};
