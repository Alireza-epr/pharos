import { I4wingsEntry } from '../../types/gfwTypes';

export const isMatchedCase = (a_4wingsEntry: I4wingsEntry) => {
  return a_4wingsEntry.dataset.length !== 0;
};

export const isValidCoordinate = (a_Lat: any, a_Lon: any) => {
  if (!Number.isFinite(a_Lat) || !Number.isFinite(a_Lon)) return false;

  if (a_Lat < -90 || a_Lat > 90) return false;
  if (a_Lon < -180 || a_Lon > 180) return false;

  return true;
};
