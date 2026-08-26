import {
  ELogType,
  EPastTime,
  EURLParams,
  TLogType,
  TURLSearchParams,
} from "@packages/enum";
import { IPastTime } from "@packages/types";

export const log_frontend = (
  a_Message: any,
  a_Type: TLogType = ELogType.info,
  a_logLevel?: string,
): void => {
  const formattedMessage = `[${formatTimestamp()}]`;
  const params =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams();
  const logLevel = params.get(EURLParams.loglevel);
  if ((logLevel && logLevel === "3") || (a_logLevel && a_logLevel === "3")) {
    switch (a_Type) {
      case ELogType.info:
        console.log(formattedMessage, a_Message);
        break;
      case ELogType.warn:
        console.warn(formattedMessage, a_Message);
        break;
      case ELogType.error:
        console.error(formattedMessage, a_Message);
        break;
    }
  }
};

/**
 * Recursively sorts all object keys and nested objects/arrays, removes undefined values
 */
export const deepSortObject = <T>(a_Object: T): T => {
  if (Array.isArray(a_Object)) {
    const mapped = a_Object.map(deepSortObject);

    const isStringArray = mapped.every((v) => typeof v === "string");

    if (isStringArray) {
      return mapped.sort((a, b) => String(a).localeCompare(String(b))) as T;
    }

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

export const deepStripHidden = (
  a_Object: unknown,
  a_HiddenKeys: Set<string>,
): unknown => {
  if (Array.isArray(a_Object)) {
    return a_Object.map((v) => deepStripHidden(v, a_HiddenKeys));
  }

  if (a_Object && typeof a_Object === "object") {
    const result: any = {};
    for (const [k, v] of Object.entries(a_Object)) {
      if (!a_HiddenKeys.has(k)) {
        result[k] = deepStripHidden(v, a_HiddenKeys);
      }
    }
    return result;
  }

  return a_Object;
};

export const getExecutionDuration = (a_Start: string, a_End: string) => {
  const startDate = new Date(a_Start.replace(" ", "T"));
  const endDate = new Date(a_End.replace(" ", "T"));
  return endDate.getTime() - startDate.getTime();
};

export const isObject = (a_Value: unknown): a_Value is Record<string, any> => {
  return (
    typeof a_Value === "object" && a_Value !== null && !Array.isArray(a_Value)
  );
};

export const isString = (a_Value: unknown): a_Value is string => {
  return typeof a_Value === "string";
};

export const isBoolean = (a_Value: unknown): a_Value is boolean => {
  return typeof a_Value === "boolean";
};

export const isNumber = (a_Value: unknown): a_Value is number => {
  return typeof a_Value === "number" && !Number.isNaN(a_Value);
};

export const getExportId = () => {
  const now = new Date();

  const timestamp =
    `${now.getFullYear()}` +
    `${String(now.getMonth() + 1).padStart(2, "0")}` +
    `${String(now.getDate()).padStart(2, "0")}` +
    `_${String(now.getHours()).padStart(2, "0")}` +
    `${String(now.getMinutes()).padStart(2, "0")}` +
    `${String(now.getSeconds()).padStart(2, "0")}` +
    `_${String(now.getMilliseconds()).padStart(3, "0")}`;

  const random = Math.random().toString(36).substring(2, 8).toUpperCase();

  return `${timestamp}_${random}`;
};

export const getLocaleISOString = (a_Date: Date, a_Past?: IPastTime) => {
  let pastMS = 0;
  if (a_Past) {
    switch (a_Past.unit) {
      case EPastTime.days:
        pastMS = a_Past.value * 86400000;
        break;
      case EPastTime.weeks:
        pastMS = a_Past.value * 604800000;
        break;
      case EPastTime.months:
        pastMS = a_Past.value * 2592000000;
        break;
      case EPastTime.years:
        pastMS = a_Past.value * 31536000000;
        break;
    }
  }

  const date = new Date(a_Date.getTime() - pastMS);

  const localeTimeISO = date.toLocaleTimeString("sv-SE", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const localeDateISO = date.toLocaleDateString("sv-SE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return `${localeDateISO}T${localeTimeISO}`;
};

export const shortenText = (a_Text: string, a_Limit: number) => {
  return a_Text.length > a_Limit ? `${a_Text.slice(0, a_Limit)}...` : a_Text;
};

// Format timestamp as [YYYY-MM-DD HH:mm:ss.SSS]
export const formatTimestamp = (a_Date?: Date): string => {
  const now = a_Date ?? new Date();
  const timestamp = now.toISOString().replace("T", " ").replace("Z", "");
  return timestamp.substring(0, 23);
};

export const lightenHexColor = (a_Hex: string, a_Percent: number) => {
  a_Hex = a_Hex.replace("#", "");

  const r = parseInt(a_Hex.substring(0, 2), 16);
  const g = parseInt(a_Hex.substring(2, 4), 16);
  const b = parseInt(a_Hex.substring(4, 6), 16);

  const factor = 1 + a_Percent / 100;
  const newR = Math.min(255, Math.round(r * factor));
  const newG = Math.min(255, Math.round(g * factor));
  const newB = Math.min(255, Math.round(b * factor));

  const lightenHex =
    "#" +
    ((1 << 24) + (newR << 16) + (newG << 8) + newB)
      .toString(16)
      .slice(1)
      .toUpperCase();

  return lightenHex;
};

export const darkenHexColor = (a_Hex: string, a_Percent: number) => {
  a_Hex = a_Hex.replace("#", "");

  const r = parseInt(a_Hex.substring(0, 2), 16);
  const g = parseInt(a_Hex.substring(2, 4), 16);
  const b = parseInt(a_Hex.substring(4, 6), 16);

  const factor = 1 - a_Percent / 100;
  const newR = Math.max(0, Math.round(r * factor));
  const newG = Math.max(0, Math.round(g * factor));
  const newB = Math.max(0, Math.round(b * factor));
  const darkenHex =
    "#" +
    ((1 << 24) + (newR << 16) + (newG << 8) + newB)
      .toString(16)
      .slice(1)
      .toUpperCase();

  return darkenHex;
};

export const getURLParam = <T>(a_String: TURLSearchParams): T | null => {
  const params =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams();
  return params.get(a_String) as T | null;
};
