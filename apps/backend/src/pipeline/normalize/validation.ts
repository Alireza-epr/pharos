import { I4wingsEntry } from '@packages/types';

export const isMatchedCase = (a_4wingsEntry: I4wingsEntry) => {
  return a_4wingsEntry.dataset.length !== 0;
};

export const isNoisyCase = (a_4wingsEntry: I4wingsEntry) => {
  if (!isMatchedCase(a_4wingsEntry) && a_4wingsEntry.vesselId.length !== 0) {
    return true;
  } else {
    return false;
  }
};

export const isValidCoordinate = (a_Lat: any, a_Lon: any) => {
  if (!Number.isFinite(a_Lat) || !Number.isFinite(a_Lon)) return false;

  if (a_Lat < -90 || a_Lat > 90) return false;
  if (a_Lon < -180 || a_Lon > 180) return false;

  return true;
};

export const missingRequiredFields = (a_4wingsEntry: I4wingsEntry) => {
  const requiredFields: (keyof I4wingsEntry)[] = [
    'dataset',
    'date',
    'lat',
    'lon',
    'vesselId',
    'mmsi',
    'shipName',
    'vesselType',
  ];
  const missingFields: (keyof I4wingsEntry)[] = [];

  for (const field of requiredFields) {
    const value = a_4wingsEntry[field];
    if (
      value === undefined ||
      value === null ||
      value === '' ||
      Number.isNaN(value)
    ) {
      missingFields.push(field);
    }
  }

  return missingFields;
};

export const isISO8601Timestamp = (a_Value: string): boolean => {
  const isoRegex =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;

  if (!isoRegex.test(a_Value)) {
    return false;
  }

  const date = new Date(a_Value);
  return !isNaN(date.getTime());
};
