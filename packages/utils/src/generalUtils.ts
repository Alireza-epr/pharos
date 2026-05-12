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
export const deepSortObject = <T>(a_Object: T): T => {
  if (Array.isArray(a_Object)) {
    const mapped = a_Object.map(deepSortObject);

    // Only sort arrays of primitives (safe case)
    const isPrimitiveArray = mapped.every(
      (v) =>
        typeof v === "string" ||
        typeof v === "number" ||
        typeof v === "boolean" ||
        v === null
    );

    if (isPrimitiveArray) {
      return mapped.sort((a, b) =>
        String(a).localeCompare(String(b))
      ) as T;
    }

    // Keep order for arrays of objects / arrays (e.g. coordinates)
    return mapped as T;
  }

  if (a_Object && typeof a_Object === "object") {
    return Object.keys(a_Object as Record<string, any>)
      .sort()
      .reduce((acc, key) => {
        const value = (a_Object as any)[key];
        if (value !== undefined) {
          (acc as any)[key] = deepSortObject(value);
        }
        return acc;
      }, {} as any) as T;
  }

  return a_Object;
};

export const getExecutionDuration = (a_Start: string, a_End: string) => {
  const startDate = new Date(a_Start.replace(" ", "T"));
  const endDate = new Date(a_End.replace(" ", "T"));
  return endDate.getTime() - startDate.getTime();
};
