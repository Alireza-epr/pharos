import fs from 'fs';
import path from 'path';
import { Request } from 'express';
import { is4wingsSource } from '../../pipeline/normalize/validation';
import {
  E4wingsDatasets,
  EContextLayers,
  EEventDatasets,
  EHiddenConfig,
  EHotspotTimeBins,
} from '@packages/enum';
import { config } from '../../config/api';
import { ELogType, TEventProperties } from '../types/generalTypes';
import {
  IEventSchema,
  I4wingsAPIResponse,
  T4wingsSource,
  TEventSource,
  IConfigJSON,
  I4wingsEntry,
  IFeature,
  IGeometry,
  TDatasetVersion,
} from '@packages/types';
import { deepSortObject, deepStripHidden, shortenText } from '@packages/utils';

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
  a_MessageLimit?: number,
): void => {
  const message = a_MessageLimit
    ? shortenText(a_Message, a_MessageLimit)
    : a_Message;
  const formattedMessage = `[${formatTimestamp()}] [${a_Type}] ${message}`;

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
  a_Version: TDatasetVersion,
) => {
  return `${a_Dataset}:${a_Version}` as T4wingsSource | TEventSource;
};

export const getSourceKey = (a_Source: T4wingsSource | TEventSource) => {
  return a_Source.split(':')[0] as E4wingsDatasets | EEventDatasets;
};

export const getSourceVersion = (a_Source: T4wingsSource | TEventSource) => {
  return a_Source.split(':')[1] as TDatasetVersion;
};

export const getSourceFrom4wingsResponse = (
  a_4wingsResponse: I4wingsAPIResponse,
  a_Dataset: E4wingsDatasets,
) => {
  const source = a_4wingsResponse.entries
    .flatMap((entry) => Object.keys(entry))
    .find((source) => source.startsWith(a_Dataset));
  return source as T4wingsSource;
};

export const getSourcesFromEvents = (a_Events: IEventSchema[]) => {
  const sources = new Set<string>();
  for (const event of a_Events) {
    const source = event.source;
    if (!sources.has(source)) sources.add(source);
  }
  return Array.from(sources)
    .map((s) => s)
    .join(', ');
};

export const getContextLayersFromEvents = (a_Events: IEventSchema[]) => {
  const allLayers = new Set<string>();
  for (const event of deepSortObject(a_Events)) {
    const thisEventLayers = event.context_layers;
    let thisContextLayer = [];
    for (const layer in thisEventLayers) {
      const thisLayerDataset = thisEventLayers[layer as EContextLayers].dataset;
      const thisLayerVersion = thisEventLayers[layer as EContextLayers].version;
      thisContextLayer.push(
        layer + ':' + thisLayerDataset + ':' + thisLayerVersion,
      );
    }
    const thisContextLayerJoined = thisContextLayer.join(', ');

    if (!allLayers.has(thisContextLayerJoined))
      allLayers.add(thisContextLayerJoined);
  }
  return Array.from(allLayers)
    .map((s) => s)
    .join(', ');
};

export const getEntriesFrom4wingsResponse = (
  a_Config: IConfigJSON,
  a_4wingsResponse: I4wingsAPIResponse,
) => {
  const entries = new Map<T4wingsSource, I4wingsEntry[]>();
  let requestedSources: T4wingsSource[] = Object.entries(a_Config.url_params)
    .filter(([key]) => key.startsWith('datasets['))
    .map(([, value]) => value);
  requestedSources = requestedSources.filter((s) => {
    if (is4wingsSource(s)) {
      return s;
    } else {
      log(`Not valid dataset: ${s}`);
    }
  });

  if (requestedSources.length === 0) {
    return entries;
  }

  for (const responseEntry of a_4wingsResponse.entries) {
    for (const requestedSource of requestedSources) {
      const requestedSourceEntries = responseEntry[requestedSource];
      if (!requestedSourceEntries) {
        continue;
      }
      const existingEntries = entries.get(requestedSource) ?? [];
      entries.set(requestedSource, [
        ...existingEntries,
        ...requestedSourceEntries,
      ]);
    }
  }

  for (const requestedSource of requestedSources) {
    if (!entries.has(requestedSource)) {
      log(`No entry is found for ${requestedSource}`, ELogType.warn);
    }
  }

  return entries;
};

export const getDate = (a_Datetime: string) => {
  return a_Datetime.slice(0, 10);
};

export const getDateBucket = (
  a_Datetime: string,
  a_TimeBucket: EHotspotTimeBins,
) => {
  return a_TimeBucket === EHotspotTimeBins.DAILY
    ? getDate(a_Datetime)
    : a_Datetime.slice(0, 13).replace('T', ' ') + ':00:00';
};

export const featureFromEvents = (
  a_Events: IEventSchema[],
): IFeature<IGeometry, TEventProperties>[] => {
  return a_Events.map((event) => {
    return {
      type: 'Feature',
      geometry: event.geom,
      properties: {
        event_id: event.event_id,
        timestamp_utc: event.timestamp_utc,
        matched_flag: event.matched_flag,
        lat: event.lat,
        lon: event.lon,
        confidence_proxy: event.confidence_proxy,
        confidence_tier: event.confidence_tier,
        distance_to_coast_km: event.distance_to_coast_km,
        context_layers: event.context_layers,
        scoring: event.scoring,
      },
    };
  });
};

export const stripHiddenConfiguration = (a_Configurations: IConfigJSON[]) => {
  const hiddenKeys = Object.values(EHiddenConfig) as EHiddenConfig[];

  const filteredConfiguration = deepStripHidden(
    a_Configurations,
    new Set(hiddenKeys),
  ) as IConfigJSON[];

  return filteredConfiguration;
};

export const getUserInfoFromReq = <P, R, B={}, Q={}>(
  a_Req: Request<P, R, B, Q>,
): string => {
  const ip =
    (a_Req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    a_Req.ip ||
    'unknown';

  const userAgent = a_Req.headers['user-agent'] || 'unknown';
  const language = a_Req.headers['accept-language'] || 'unknown';
  const method = a_Req.method;
  const url = a_Req.originalUrl;

  return [
    `IP: ${ip}`,
    `User-Agent: ${userAgent}`,
    `Language: ${language}`,
    `Method: ${method}`,
    `URL: ${url}`,
  ].join(' | ');
};
