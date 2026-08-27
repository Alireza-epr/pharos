import { useEffect, useRef, useState } from 'react';
import { IVesselIdentity } from '@packages/types';
import { useFetchVesselsByIds } from './fetch';
import { buildVesselIdentityRequestParams } from '../helpers/utils/vesselUtils';
import { buildVesselListConfig } from '../helpers/utils/vesselConfigUtils';

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

    execute(
      buildVesselListConfig(buildVesselIdentityRequestParams(a_VesselId)),
    ).then((response) => {
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
