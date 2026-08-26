import { useEffect, useRef, useState } from 'react';
import { IVesselIdentity } from '@packages/types';
import { useFetchVesselsByIds } from './fetch';
import { buildVesselIdentityRequestParams } from '../helpers/utils/vesselUtils';

/**
 * Fetches a matched detection's vessel identity by id (GFW Vessels API,
 * list-by-ids) on demand -- see VesselIdentityContext.tsx, the Detail
 * panel's only consumer. Fetched identities are cached in-memory per id for
 * the lifetime of this hook instance (VesselIdentityContext stays mounted
 * while stepping through events via Prev/Next), same assumption/shape
 * useSyncRegionGeometry makes for EEZ/MPA boundaries -- a previously-seen
 * vessel never needs a second round trip within one Detail-tab session.
 *
 * Deliberately NOT persisted into IEventSchema/eventStore: registry/
 * ownership data can go stale, and fetching it for every matched event
 * regardless of whether anyone looks at it would multiply GFW API calls for
 * no benefit -- see the design discussion this followed.
 *
 * Returns `vessel: undefined` while unresolved (no vesselId, or still
 * loading), `null` once resolved but GFW had nothing for that id, or the
 * identity record itself.
 */
export const useVesselIdentity = (a_VesselId: string | undefined) => {
  const { execute } = useFetchVesselsByIds();
  const cacheRef = useRef<Map<string, IVesselIdentity | null>>(new Map());
  const [vessel, setVessel] = useState<IVesselIdentity | null | undefined>(
    undefined,
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!a_VesselId) {
      setVessel(undefined);
      return;
    }

    const cached = cacheRef.current.get(a_VesselId);
    if (cached !== undefined) {
      setVessel(cached);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setVessel(undefined);

    execute(buildVesselIdentityRequestParams(a_VesselId)).then((response) => {
      if (cancelled) return;
      const result = response?.entries?.[0] ?? null;
      cacheRef.current.set(a_VesselId, result);
      setVessel(result);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [a_VesselId, execute]);

  return { vessel, loading };
};
