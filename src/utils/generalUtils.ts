import { readFileSync } from 'fs';
import { EGeoCoordinate, ELogLevel, EURLParams } from '../enum/generlaEnum';
import { E4wingsDatasets, EEventDatasets } from '../enum/gfwEnum';
import { isValidCoordinate } from '../pipeline/normalize/validation';
import {
  EGeoJSONEventMissingness,
  IGeoJSONEventFeature,
} from '../types/generalTypes';
import {
  I4wingsAPIResponse,
  T4wingsSource,
  TEventSource,
} from '../types/gfwTypes';

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
};

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

export const getGitCommitSHA = async (a_Short = true): Promise<string> => {
  try {
    if (typeof window == 'undefined') {
      // Node.js version
      const { execSync } = await import('child_process');
      const gitCommit = execSync('git rev-parse HEAD').toString().trim();
      if (gitCommit) {
        return gitCommit;
      } else {
        return 'N/A';
      }
    } else {
      return 'N/A';
    }
  } catch (e) {
    return 'N/A';
  }
};

export const hashString = async (a_String: string) => {
  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    // Browser version
    const msgBuffer = new TextEncoder().encode(a_String);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } else {
    // Node.js version
    const { createHash } = await import('crypto');
    return createHash('sha256').update(a_String, 'utf8').digest('hex');
  }
};

export const hashFile = async (a_Path: string) => {
  const content = readFileSync(a_Path);
  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    // Browser version
    const str =
      typeof content === 'string' ? content : content.toString('utf-8');
    const encoder = new TextEncoder();
    const data = encoder.encode(str); // convert string to Uint8Array
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  } else {
    // Node.js version
    const { createHash } = await import('crypto');
    return createHash('sha256').update(content).digest('hex');
  }
};

export const getSource = (
  a_Dataset: E4wingsDatasets | EEventDatasets,
  a_Version: `v${number}.${number}`,
) => {
  return `${a_Dataset}:${a_Version}` as T4wingsSource | TEventSource;
};

export const getSourceKey = (a_Source: T4wingsSource | TEventSource) => {
  return a_Source.split(':')[0] as E4wingsDatasets | EEventDatasets;
};

export const getSourceVersion = (a_Source: T4wingsSource | TEventSource) => {
  return a_Source.split(':')[1] as `v${number}.${number}`;
};

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const getSourceFrom4wingsResponse = (
  a_4wingsResponse: I4wingsAPIResponse,
  a_Dataset: E4wingsDatasets,
) => {
  const source = a_4wingsResponse.entries
    .flatMap((entry) => Object.keys(entry))
    .find((source) => source.startsWith(a_Dataset));
  return source as T4wingsSource;
};

export const getEntriesFrom4wingsResponse = (
  a_4wingsResponse: I4wingsAPIResponse,
  a_Source: T4wingsSource,
) => {
  for (const responseEntry of a_4wingsResponse.entries) {
    const entries = responseEntry[a_Source];
    if (entries) return entries;
  }

  return undefined;
};

export const getEventMissingness = (
  a_Features: IGeoJSONEventFeature[],
): Record<EGeoJSONEventMissingness, string> => {
  const total = a_Features.length;
  const counts: Record<EGeoJSONEventMissingness, number> = Object.fromEntries(
    Object.values(EGeoJSONEventMissingness).map((e) => [e, 0]),
  ) as Record<EGeoJSONEventMissingness, number>;

  for (const feature of a_Features) {
    for (const key of Object.values(EGeoJSONEventMissingness)) {
      const value = feature.properties[key];

      if (value === null || value === undefined) {
        counts[key]++;
      }
    }
  }

  const missingness: Record<EGeoJSONEventMissingness, string> =
    Object.fromEntries(
      Object.entries(counts).map(([key, count]) => [
        key,
        `${((count / total) * 100).toFixed(2)}%`,
      ]),
    ) as Record<EGeoJSONEventMissingness, string>;

  return missingness;
};

export const getGeoMin = (
  a_GeoCoordinate: EGeoCoordinate,
  a_Features: IGeoJSONEventFeature[],
): number => {
  let min = Infinity;

  for (const feature of a_Features) {
    if (!isValidCoordinate(feature.properties.lat, feature.properties.lon))
      continue;

    const value =
      a_GeoCoordinate === EGeoCoordinate.latitude
        ? feature.properties.lat
        : feature.properties.lon;

    if (value < min) {
      min = value;
    }
  }

  return min;
};

export const getGeoMax = (
  a_GeoCoordinate: EGeoCoordinate,
  a_Features: IGeoJSONEventFeature[],
): number => {
  let max = -Infinity;

  for (const feature of a_Features) {
    if (!isValidCoordinate(feature.properties.lat, feature.properties.lon))
      continue;
    const value =
      a_GeoCoordinate === EGeoCoordinate.latitude
        ? feature.properties.lat
        : feature.properties.lon;

    if (value > max) {
      max = value;
    }
  }

  return max;
};

export const getTimeRange = (a_Features: IGeoJSONEventFeature[]) => {
  let min = Infinity;
  let max = -Infinity;

  for (const feature of a_Features) {
    const t = Date.parse(feature.properties.timestamp_utc);

    if (t < min) {
      min = t;
    }

    if (t > max) {
      max = t;
    }
  }

  return {
    start: new Date(min).toISOString(),
    end: new Date(max).toISOString(),
  };
};
