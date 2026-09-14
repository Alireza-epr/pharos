import { IHistoryEntry } from '../types/storeTypes';
import { ESidebarTab } from '../enum/storeEnum';
import { useSidebarStore } from '../../stores/sidebarStore';
import { useConfigStore } from '../../stores/configStore';
import { useEventStore } from '../../stores/eventStore';
import { useVesselSearchStore } from '../../stores/vesselSearchStore';
import { useVesselStore } from '../../stores/vesselStore';
import { importConfigWithRegionPreload } from './configUtils';
import { buildVesselSearchConfig } from './vesselConfigUtils';
import { syncConfigToURL, syncVesselSearchConfigToURL } from './URLUtils';

/**
 * Restores a history entry's query and result into its originating tab --
 * no fetch, since the result was captured alongside the query when it
 * actually ran (see ReportTab.tsx / VesselTab.tsx). Switches the sidebar to
 * that tab afterwards so the restore is immediately visible.
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
  } else {
    useVesselSearchStore.getState().importVesselSearchParams(a_Entry.config);
    syncVesselSearchConfigToURL(buildVesselSearchConfig(a_Entry.config));

    useVesselStore.getState().setVessels(a_Entry.result.vessels);
    useVesselStore.getState().setPages(a_Entry.result.pages);
    useVesselStore.getState().setPageIndex(a_Entry.result.pageIndex);
    useVesselStore.getState().setSince(a_Entry.result.since);
    useVesselStore.getState().setTotal(a_Entry.result.total);
    useVesselStore.getState().setLastParams(a_Entry.result.lastParams);
  }

  useSidebarStore.getState().setActiveTab(a_Entry.tab);
};
