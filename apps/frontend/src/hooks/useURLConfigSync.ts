import { useEffect, useRef } from 'react';
import { buildConfig } from '../helpers/utils/configUtils';
import { useAOIStore } from '../stores/areaOfInterestStore';
import { useTimeRangeStore } from '../stores/timeRangeStore';
import { useSortOrderStore } from '../stores/sortOrderStore';
import { useFilterStore } from '../stores/filterStore';
import { useHotspotConfigStore } from '../stores/hotspotConfigStore';
import { useThresholdStore } from '../stores/thresholdStore';
import { usePaginationStore } from '../stores/paginationStore';
import { useAdvancedQueryStore } from '../stores/advancedQueryStore';
import { useMessageStore } from '../stores/messageStore';
import { useTranslator } from './translator';
import { hydrateConfigFromURL, syncConfigToURL } from '@/helpers/utils/URLUtils';

/**
 * Applies a `config` URL param (if present) to every section's store,
 * exactly once, as soon as a_Enabled flips true (i.e. once the user is
 * authenticated -- see App.tsx, which is what gates every store from being
 * meaningfully render-ready). Runs only once per app session, guarded by a
 * ref rather than gating the effect on a_Enabled alone: a_Enabled can flip
 * true more than once in a session (e.g. logout then log back in), and
 * re-hydrating at that point would stomp whatever the user has since done
 * with a URL that's already stale.
 *
 * Only ever warns the user when a `config` param is present but invalid --
 * a plain empty URL (nothing to hydrate) is the common case, not an error.
 *
 * Must be mounted (in App.tsx) *before* useSyncConfigToURL below, so this
 * one-time import finishes before that hook's store subscriptions exist --
 * see its comment for why that ordering matters.
 */
export const useHydrateConfigFromURL = (a_Enabled: boolean) => {
  const { t } = useTranslator();
  const hasRunRef = useRef(false);

  useEffect(() => {
    if (!a_Enabled || hasRunRef.current) return;
    hasRunRef.current = true;

    // hydrateConfigFromURL() may first fetch the region option list a
    // region-based AOI needs to resolve (see importConfigWithRegionPreload)
    // -- useEffect callbacks can't be async themselves, so the await lives
    // in this inner IIFE.
    (async () => {
      if ((await hydrateConfigFromURL()) === 'invalid') {
        useMessageStore.getState().setWarn(t('general.text.invalidURLConfig'));
      }
    })();
  }, [a_Enabled, t]);
};

// Every store buildConfig() reads from, i.e. everything that makes up the
// report config a query is run with. Deliberately excludes useConfigStore:
// that store holds the *result* of the last run (config/getExport()), not
// an input to the next one, so it's an output to mirror, not a trigger to
// resync on. Keep this list in sync with buildConfig()'s own reads -- a
// section that's part of the config but missing here would still export/
// import/run correctly, it would just lag behind on the URL until the next
// Run Query.
const CONFIG_STORES = [
  useAOIStore,
  useTimeRangeStore,
  useSortOrderStore,
  useFilterStore,
  useHotspotConfigStore,
  useThresholdStore,
  usePaginationStore,
  useAdvancedQueryStore,
];

// Batches rapid-fire store changes (e.g. typing into a threshold field, or
// the several sequential store writes importConfig()/useHydrateConfigFromURL
// makes on load) into a single URL write, rather than replacing history on
// every keystroke.
const DEBOUNCE_MS = 500;

/**
 * Keeps the URL's `config` param live-synced to every section's store, not
 * just at Run Query time: any change to AOI, time range, sort, filter,
 * threshold, hotspot config, pagination, or advanced query re-derives the
 * config (buildConfig()) and writes it to the URL (debounced). Copy-pasting
 * the URL at any point -- mid-edit, not just after a run -- reproduces the
 * same sections in a new tab.
 *
 * ReportTab's Run Query additionally calls syncConfigToURL() directly,
 * un-debounced, so the URL is guaranteed current at the exact moment a
 * query runs even if the user's last edit landed inside this hook's
 * debounce window.
 */
export const useSyncConfigToURL = (a_Enabled: boolean) => {
  useEffect(() => {
    if (!a_Enabled) return;

    let timer: ReturnType<typeof setTimeout> | null = null;
    const scheduleSync = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = null;
        syncConfigToURL(buildConfig());
      }, DEBOUNCE_MS);
    };

    // The URL should reflect current state from the moment sync goes live,
    // not only after the first subsequent edit.
    scheduleSync();

    const unsubscribes = CONFIG_STORES.map((store) =>
      store.subscribe(scheduleSync),
    );

    return () => {
      if (timer) clearTimeout(timer);
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, [a_Enabled]);
};
