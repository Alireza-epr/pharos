import { TGlobalEvent } from '../../types/gfwTypes';

export const generateDistanceToCoast = (
  a_EventEntry: TGlobalEvent | undefined,
): number | null => {
  if (!a_EventEntry) return null;

  return a_EventEntry.distances.startDistanceFromShoreKm;
};
