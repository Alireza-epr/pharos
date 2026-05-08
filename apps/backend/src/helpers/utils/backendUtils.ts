import fs from 'fs';
import path from 'path';
import { isValidCoordinate } from '../../pipeline/normalize/validation';
import {
  E4wingsDatasets,
  EEventDatasets,
  EGeoCoordinate,
  EHotspotTimeBins,
} from '@packages/enum';
import { config } from '../../config/api';
import {
  TGeoJSONEventMissingness,
  ELogType,
  TEventProperties,
  IMatchingStats,
  EVENT_MISSINGNESS_KEYS,
} from '../types/generalTypes';
import {
  IEventSchema,
  IFeature,
  IGeometry,
  I4wingsAPIResponse,
  T4wingsSource,
  TEventSource,
  IConfigJSON,
  I4wingsEntry,
} from '@packages/types';
import { generateSources } from '../../pipeline/normalize/generation';

// Stream for writing logs to file if enabled
let logStream: fs.WriteStream | null = null;

// Format timestamp as [YYYY-MM-DD HH:mm:ss.SSS]
export const formatTimestamp = (a_Date?: Date): string => {
  const now = a_Date ?? new Date();
  const timestamp = now.toISOString().replace('T', ' ').replace('Z', '');
  return timestamp.substring(0, 23);
};

// Initialize log file if logging is enabled
if (config.logging.enable_log) {
  console.log(`[${formatTimestamp()}] [INFO] File logging is enabled.`);
  const logDir = path.dirname(config.logging.log_file_path);

  // Create logs directory if it doesn't exist
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  // Create write stream to append logs
  logStream = fs.createWriteStream(config.logging.log_file_path, {
    flags: 'a',
  });
}

// Main log function
export const log = (
  a_Message: string,
  a_Type: ELogType = ELogType.info,
): void => {
  const formattedMessage = `[${formatTimestamp()}] [${a_Type}] ${a_Message}`;

  // Log to console if console logging is enabled
  if (config.logging.enable_console_log) {
    console.log(formattedMessage);
  }

  // Append to file if logging enabled
  if (config.logging.enable_log && logStream) {
    logStream.write(formattedMessage + '\n');
  }
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

export const hashFile = async (a_Path: string | File) => {
  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    // Browser: assume 'a_Path' is a File object
    const file = a_Path as File;
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  } else {
    // Node.js
    const fs = await import('fs'); // dynamic import
    const { createHash } = await import('crypto');
    const content = fs.readFileSync(a_Path as string);
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

export const getSourcesFromEvents = (
  a_Events: IEventSchema[],
) => {
  const sources = new Set<string>()
  for(const event of a_Events) {
    const source = event.source
    if(!sources.has(source)) sources.add(source)
  }
  return Array.from(sources).map( s => s ).join(", ");
};

export const getEntriesFrom4wingsResponse = (
  a_Config: IConfigJSON,
  a_4wingsResponse: I4wingsAPIResponse,
) => {
  const requestedSources: T4wingsSource[] = Object.entries(a_Config.url_params).filter(([key]) => key.startsWith("datasets[")).map(([, value]) => value)
  if (requestedSources.length === 0) {
    throw new Error("No dataset is requested")
  }

  const entries = new Map<T4wingsSource, I4wingsEntry[]>()

  for (const responseEntry of a_4wingsResponse.entries) {
    for (const requestedSource of requestedSources) {
      const requestedSourceEntries = responseEntry[requestedSource];
      if (!requestedSourceEntries) {
        continue;
      }
      const existingEntries = entries.get(requestedSource) ?? [];
      entries.set(
        requestedSource,
        [...existingEntries, ...requestedSourceEntries]
      );
    }
  }

  for (const requestedSource of requestedSources) {
    if (!entries.has(requestedSource)) {
      log(`No entry is found for ${requestedSource}`, ELogType.warn)
    }
  }

  return entries;
};

export const getEventMissingness = (
  a_Features: IFeature<IGeometry, TEventProperties>[],
): Record<TGeoJSONEventMissingness, string> => {
  const total = a_Features.length;

  const keys = Object.values(EVENT_MISSINGNESS_KEYS);

  const counts: Record<TGeoJSONEventMissingness, number> = Object.fromEntries(
    keys.map((k) => [k, 0]),
  ) as Record<TGeoJSONEventMissingness, number>;

  for (const feature of a_Features) {
    if (!feature.properties) continue;

    for (const key of keys) {
      const value = feature.properties[key];

      if (value === null || value === undefined) {
        counts[key]++;
      }
    }
  }

  return Object.fromEntries(
    keys.map((key) => [
      key,
      `${((counts[key] / total) * 100).toFixed(2)}%`,
    ]),
  ) as Record<TGeoJSONEventMissingness, string>;
};

export const getGeoMin = (
  a_GeoCoordinate: EGeoCoordinate,
  a_Features: IFeature<IGeometry, TEventProperties>[],
): number => {
  let min = Infinity;

  for (const feature of a_Features) {
    if (!feature.properties) continue;
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
  a_Features: IFeature<IGeometry, TEventProperties>[],
): number => {
  let max = -Infinity;

  for (const feature of a_Features) {
    if (!feature.properties) continue;
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

export const getTimeRange = (
  a_Features: IFeature<IGeometry, TEventProperties>[],
) => {
  let min = Infinity;
  let max = -Infinity;

  for (const feature of a_Features) {
    if (!feature.properties) continue;
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

export const getDate = (a_Datetime: string) => {
  return a_Datetime.slice(0, 10);
};

export const getDateBucket = (a_Datetime: string, a_TimeBucket: EHotspotTimeBins) => {
  return a_TimeBucket === EHotspotTimeBins.DAILY ? getDate(a_Datetime) : a_Datetime.slice( 0, 13 ).replace("T", " ") + ":00:00"
}

export const jsonToCsv = <T>(a_Title: string, a_Samples: T[]) => {
  if (!a_Samples.length) return '';
  let s0 = a_Samples[0];
  if (!s0) return '';
  const headers = Object.keys(s0);

  const delimiter = ';';

  const csvRows = [
    `### ${a_Title} ###`,
    headers.join(delimiter), // header row
    ...a_Samples.map((sample) =>
      headers
        .map((header) => {
          const value = sample[header as keyof T];
          // handle null / undefined safely
          return value === null || value === undefined
            ? 'N/A'
            : typeof value === 'number'
              ? `="${value}"`
              : `"${String(value).replace(/"/g, '""')}"`; //If a value itself contains a double quote ("), CSV requires it to be escaped by doubling it.
        })
        .join(delimiter),
    ),
  ];

  return csvRows.join('\n');
};

export const csvString = <T, N>(
  a_Title1: string,
  a_Samples1: T[],
  a_Title2?: string,
  a_Samples2?: N[],
) => {
  const sections: string[] = [];

  sections.push(jsonToCsv<T>(a_Title1, a_Samples1));

  if (a_Samples2 && a_Title2) {
    sections.push(''); // blank line
    sections.push(''); // blank line

    sections.push(jsonToCsv<N>(a_Title2, a_Samples2));
  }

  const csvString = sections.join('\n');

  return csvString;
};

export const sortEventSchema = (
  a_EventSchema: IEventSchema[],
): IEventSchema[] => {
  return a_EventSchema.sort((a, b) => {
    if (a.timestamp_utc !== b.timestamp_utc)
      return a.timestamp_utc.localeCompare(b.timestamp_utc);

    if (a.event_id !== b.event_id) return a.event_id.localeCompare(b.event_id);

    if (a.lon !== b.lon) return a.lon - b.lon;

    return a.lat - b.lat;
  });
};

export const getMatchingStats = (
  a_Features: IFeature<IGeometry, TEventProperties>[],
): IMatchingStats => {
  let matched = 0;
  let unmatched = 0;

  for (const feature of a_Features) {
    if (feature.properties.matched_flag) {
      ++matched;
    } else if(feature.properties.matched_flag === false) {
      ++unmatched;
    }
  }

  return {
    matched,
    unmatched,
  };
};
