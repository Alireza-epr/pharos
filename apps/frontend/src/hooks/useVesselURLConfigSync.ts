import { useEffect, useRef } from 'react';
import { useVesselSearchStore } from '../stores/vesselSearchStore';
import { useMessageStore } from '../stores/messageStore';
import { useTranslator } from './translator';
import {
  hydrateVesselSearchConfigFromURL,
  syncVesselSearchConfigToURL,
} from '@/helpers/utils/URLUtils';
import { buildVesselSearchConfig } from '@/helpers/utils/vesselConfigUtils';

export const useHydrateVesselSearchConfigFromURL = (a_Enabled: boolean) => {
  const { t } = useTranslator();
  const hasRunRef = useRef(false);

  useEffect(() => {
    if (!a_Enabled || hasRunRef.current) return;
    hasRunRef.current = true;

    if (hydrateVesselSearchConfigFromURL() === 'invalid') {
      useMessageStore.getState().setWarn(t('general.text.invalidURLConfig'));
    }
  }, [a_Enabled, t]);
};

const DEBOUNCE_MS = 500;

export const useSyncVesselSearchConfigToURL = (a_Enabled: boolean) => {
  useEffect(() => {
    if (!a_Enabled) return;

    let timer: ReturnType<typeof setTimeout> | null = null;
    const scheduleSync = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = null;
        syncVesselSearchConfigToURL(buildVesselSearchConfig());
      }, DEBOUNCE_MS);
    };

    // The URL should reflect current state from the moment sync goes live,
    // not only after the first subsequent edit.
    scheduleSync();

    const unsubscribe = useVesselSearchStore.subscribe(scheduleSync);

    return () => {
      if (timer) clearTimeout(timer);
      unsubscribe();
    };
  }, [a_Enabled]);
};
