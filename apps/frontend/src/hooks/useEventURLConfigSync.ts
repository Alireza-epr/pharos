import { useEffect, useRef } from 'react';
import { useGfwEventSearchStore } from '../stores/gfwEventSearchStore';
import { useMessageStore } from '../stores/messageStore';
import { useTranslator } from './translator';
import {
  hydrateEventSearchConfigFromURL,
  syncEventSearchConfigToURL,
} from '@/helpers/utils/URLUtils';
import { buildEventSearchConfig } from '@/helpers/utils/eventConfigUtils';

export const useHydrateEventSearchConfigFromURL = (a_Enabled: boolean) => {
  const { t } = useTranslator();
  const hasRunRef = useRef(false);

  useEffect(() => {
    if (!a_Enabled || hasRunRef.current) return;
    hasRunRef.current = true;

    // hydrateEventSearchConfigFromURL() may first fetch the region option
    // list a region-based AOI needs to resolve (see
    // importEventAOIAndTimeRange) -- useEffect callbacks can't be async
    // themselves, so the await lives in this inner IIFE (same pattern as
    // useURLConfigSync.ts's own useHydrateConfigFromURL).
    (async () => {
      if ((await hydrateEventSearchConfigFromURL()) === 'invalid') {
        useMessageStore.getState().setWarn(t('general.text.invalidURLConfig'));
      }
    })();
  }, [a_Enabled, t]);
};

const DEBOUNCE_MS = 500;

export const useSyncEventSearchConfigToURL = (a_Enabled: boolean) => {
  useEffect(() => {
    if (!a_Enabled) return;

    let timer: ReturnType<typeof setTimeout> | null = null;
    const scheduleSync = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = null;
        syncEventSearchConfigToURL(buildEventSearchConfig());
      }, DEBOUNCE_MS);
    };

    // The URL should reflect current state from the moment sync goes live,
    // not only after the first subsequent edit.
    scheduleSync();

    const unsubscribe = useGfwEventSearchStore.subscribe(scheduleSync);

    return () => {
      if (timer) clearTimeout(timer);
      unsubscribe();
    };
  }, [a_Enabled]);
};
