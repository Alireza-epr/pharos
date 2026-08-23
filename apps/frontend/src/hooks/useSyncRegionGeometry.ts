import { useEffect, useRef } from 'react';
import { EContextLayers } from '@packages/enum';
import { TRegionGeometry } from '@packages/types';
import { useFetchRegionGeometry } from './fetch';

/**
 * Fetches the boundary geometry for a set of EEZ/MPA region ids (an event
 * can carry more than one enrichment per layer -- overlapping/disputed EEZ
 * claims) and pushes the result into the given setter. Populates whenever
 * `enabled` is on and `regionIds` is non-empty; clears otherwise (toggle
 * off, or the current event has no such layer) -- see ContextLayersBlock.tsx,
 * one instance per dataset (EEZ, MPA).
 *
 * Fetched features are cached in-memory per id for the lifetime of this hook
 * instance (i.e. across event navigation within one Detail-tab session,
 * since ContextLayersBlock stays mounted while stepping through events) --
 * a region's boundary never changes mid-session, so a previously-fetched id
 * never needs a second round trip.
 */
export const useSyncRegionGeometry = (
  a_Dataset: EContextLayers,
  a_Enabled: boolean,
  a_RegionIds: string[],
  a_SetGeometries: (a_Value: TRegionGeometry[]) => void,
) => {
  const { execute } = useFetchRegionGeometry();
  const cacheRef = useRef<Map<string, TRegionGeometry>>(new Map());
  // Dedupe the effect on content, not array identity -- callers derive
  // `a_RegionIds` fresh from event.context_layers on every render.
  const idsKey = a_RegionIds.join(',');

  useEffect(() => {
    if (!a_Enabled || a_RegionIds.length === 0) {
      a_SetGeometries([]);
      return;
    }

    let cancelled = false;

    const load = async () => {
      const features = await Promise.all(
        a_RegionIds.map(async (id) => {
          const cached = cacheRef.current.get(id);
          if (cached) return cached;
          const json = await execute(a_Dataset, id);
          const feature = json?.entries?.[0] ?? null;
          if (feature) cacheRef.current.set(id, feature);
          return feature;
        }),
      );
      if (!cancelled) {
        a_SetGeometries(features.filter((f): f is TRegionGeometry => !!f));
      }
    };

    load();

    return () => {
      cancelled = true;
    };
    // idsKey stands in for a_RegionIds -- see its definition above.
  }, [a_Enabled, idsKey, a_Dataset, execute, a_SetGeometries]);
};
