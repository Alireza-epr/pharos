import { I4wingsEntry } from '../../types/gfwTypes';

export const isMatchedCase = (a_4wingsEntry: I4wingsEntry) => {
  return a_4wingsEntry.dataset.length !== 0;
};

export const isNoisyCase = (a_4wingsEntry: I4wingsEntry) => {
  if(!isMatchedCase(a_4wingsEntry) && a_4wingsEntry.vesselId.length !== 0){
    return true
  } else {
    return false
  }
}

export const isValidCoordinate = (a_Lat: any, a_Lon: any) => {
  if (!Number.isFinite(a_Lat) || !Number.isFinite(a_Lon)) return false;

  if (a_Lat < -90 || a_Lat > 90) return false;
  if (a_Lon < -180 || a_Lon > 180) return false;

  return true;
};

export const missingRequiredFields = (a_4wingsEntry: I4wingsEntry) => {
  const requiredFields: (keyof I4wingsEntry)[] = [
    "dataset",
    "date",
    "lat",
    "lon",
    "vesselId",
    "mmsi",
    "shipName",
    "vesselType",
  ];
  const missingFields: (keyof I4wingsEntry)[] = [];

  for(const field of requiredFields){
    const value = a_4wingsEntry[field];
    if (value === undefined || value === null || value === "") {
      missingFields.push(field);
    }

  }

  return missingFields


}