/* import { ELogLevel, EURLParams } from "../types/generalTypes";


export const formatTimestamp = (a_Date?: Date): string => {
  const now = a_Date ?? new Date();
  const timestamp = now.toISOString().replace('T', ' ').replace('Z', '');
  return timestamp.substring(0, 23);
};


export const log = (
  a_Title: string,
  a_Message: any,
  a_Type: ELogLevel = ELogLevel.message,
  a_logLevel?: string,
): void => {
  const formattedMessage = `[${formatTimestamp()}] ${a_Title}`;
  const params =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams();
  const logLevel = params.get(EURLParams.loglevel);
  if ((logLevel && logLevel === '3') || (a_logLevel && a_logLevel === '3')) {
    switch (a_Type) {
      case ELogLevel.message:
        console.log(formattedMessage, a_Message);
        break;
      case ELogLevel.warning:
        console.warn(formattedMessage, a_Message);
        break;
      case ELogLevel.error:
        console.error(formattedMessage, a_Message);
        break;
    }
  }
}; */

/**
 * Recursively sorts all object keys and nested objects/arrays, removes undefined values
 */
export const deepSortObject = (a_Object: any): any => {
  if (Array.isArray(a_Object)) {
    return a_Object.map(deepSortObject);
  }

  if (a_Object && typeof a_Object === 'object') {
    return Object.keys(a_Object)
      .sort()
      .reduce((acc: any, key) => {
        const value = a_Object[key];
        if (value !== undefined) {
          acc[key] = deepSortObject(value);
        }
        return acc;
      }, {});
  }

  return a_Object;
};