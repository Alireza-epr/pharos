import pilot from '../config/pilot.json';
import {
  createEventSchema,
  getEntriesFrom4wingsResponse,
  getSourceFrom4wingsResponse,
  isMatchedCase,
} from './normalize';
import { detectionPostGFW } from './ingest/detections';
import fs from 'fs';
import parquet from 'parquetjs';
import { IGeometry } from '../types/geoJSONTypes';
import { IConfigJSON } from '../types/eventTypes';
import { I4wingsAPIResponse, IEventAPIResponse, IEventPostBodyParams, IEventPostURLParams, IPortVisitEvent } from '../types/gfwTypes';
import { ELogLevel } from '../enum/generlaEnum';
import { deepSortObject, getGitCommitSHA, hashString, log, writeParquet } from '../utils/generalUtils';

const parquetSchema = new parquet.ParquetSchema({
  event_id: { type: 'UTF8' },
  timestamp_utc: { type: 'UTF8' },
  matched_flag: { type: 'BOOLEAN' },
  lat: { type: 'DOUBLE' },
  lon: { type: 'DOUBLE' },
  confidence_fields: { type: 'UTF8', optional: true },
  distance_to_coast_km: { type: 'DOUBLE', optional: true },
  inside_eez: { type: 'UTF8', optional: true },
});

const parquetSchema_raw_metadata = new parquet.ParquetSchema({
  callsign: { type: "UTF8" },
  dataset: { type: "UTF8" },
  date: { type: "UTF8" },
  detections: { type: "INT64" },

  entryTimestamp: { type: "TIMESTAMP_MILLIS" },
  exitTimestamp: { type: "TIMESTAMP_MILLIS" },

  firstTransmissionDate: { type: "UTF8" },
  flag: { type: "UTF8" },
  geartype: { type: "UTF8" },
  imo: { type: "UTF8" },
  lastTransmissionDate: { type: "UTF8" },

  lat: { type: "DOUBLE" },
  lon: { type: "DOUBLE" },

  mmsi: { type: "UTF8" },
  shipName: { type: "UTF8" },
  vesselId: { type: "UTF8" },
  vesselType: { type: "UTF8" },

  event_metadata: { type: "UTF8", optional: true }
});

const source4wings = pilot.source as any;
const dataset4wings = source4wings.split(":")[0] ?? '';
const dataset4wingsVersion = source4wings.split(":")[1] ?? '';
const baseURL4wings = pilot.URL;

const baseURLEvent = pilot.eventURL;
const sourceEvent = pilot.eventSource as any;
const bodyParams4wings = pilot.aoi as any;
const urlParams4wings = {
  "spatial-resolution": pilot['spatial-resolution'],
  "temporal-resolution": pilot['temporal-resolution'],
  "datasets[0]": pilot.source,
  "date-range": `${pilot.startDate},${pilot.endDate}`,
  format: pilot.format,
  "group-by": pilot['group-by'],
} as any

const geometry = {
  type: pilot.aoi.geojson.type,
  coordinates: pilot.aoi.geojson.coordinates
} as any;

const output = pilot.output

const startDate = `${pilot.startDate}`;
const endDate = `${pilot.endDate}`;

const main = async () => {
  log('pilot starting...', '', ELogLevel.message, '3');
  let events = [];
  const configuration = new Set<IConfigJSON>();
  const resp4wings = await detectionPostGFW<I4wingsAPIResponse>(
    baseURL4wings,
    source4wings,
    urlParams4wings,
    bodyParams4wings,
  );

  const key4wings = getSourceFrom4wingsResponse(
    resp4wings.results,
    dataset4wings,
  );
  const entries4wings = getEntriesFrom4wingsResponse(
    resp4wings.results,
    key4wings,
  );

  if (!entries4wings) return

  for (const entries4wing of entries4wings) {
    const thisEntry = entries4wing;
    configuration.clear();
    configuration.add(resp4wings.metadata);

    if (isMatchedCase(thisEntry)) {
      const urlParamsEvent: IEventPostURLParams = {
        limit: 2,
        offset: 0,
      };

      const bodyParamsEvent: IEventPostBodyParams = {
        vessels: [thisEntry.vesselId],
        startDate: startDate,
        endDate: endDate,
        datasets: [sourceEvent],
        geometry: geometry,
      };

      try {
        const portVisitResp = await detectionPostGFW<IEventAPIResponse<IPortVisitEvent>>(
          baseURLEvent,
          sourceEvent,
          urlParamsEvent,
          bodyParamsEvent,
        );
        if (configuration) configuration.add(portVisitResp.metadata);

        if (portVisitResp.results.entries.length == 0) {
          try {
            const eventSchema = await createEventSchema(
              configuration,
              thisEntry,
            );
            //console.log('Matched Event Schema( No event )', eventSchema);
            events.push(eventSchema);
          } catch (error) {
            console.error(
              'Matched Event Schema( No event ) error',
              error
            );
          }
        } else {
          for (const entriesEvent of portVisitResp.results.entries) {
            const thisEventEntry = entriesEvent;
            try {
              const eventSchema = await createEventSchema(
                configuration,
                thisEntry,
                thisEventEntry,
              );
              //console.log('Matched Event Schema', eventSchema);
              events.push(eventSchema);
            } catch (error) {
              console.error('Matched Event Schema error', error);
            }
          }
        }
      } catch (err) {
        console.error('detectionPostGFW event error', err);
      }
    } else {
      try {
        const eventSchema = await createEventSchema(configuration, thisEntry);
        //console.log('Unmatched Event Schema', eventSchema);
        events.push(eventSchema);
      } catch (error) {
        console.error('Unmatched Event Schema error', error);
      }
    }
  }

  const sortedEvents = events.sort((a, b) => {
    if (a.timestamp_utc !== b.timestamp_utc)
      return a.timestamp_utc.localeCompare(b.timestamp_utc);

    if (a.event_id !== b.event_id)
      return a.event_id.localeCompare(b.event_id);

    if (a.lon !== b.lon)
      return a.lon - b.lon;

    return a.lat - b.lat;
  });

  //event.geojson
  const geojson = {
    type: 'FeatureCollection',
    features: sortedEvents.map((event) => ({
      type: 'Feature',
      properties: {
        event_id: event.event_id,
        timestamp_utc: event.timestamp_utc,
        matched_flag: event.matched_flag,
        lat: event.lat,
        lon: event.lon,
        confidence_fields: event.confidence_fields,
        distance_to_coast_km: event.raw_event_metadata
          ? event.raw_event_metadata.distances.startDistanceFromShoreKm
          : 'N/A',
        inside_eez:
          event.raw_event_metadata &&
            event.raw_event_metadata.regions.eez.length > 0
            ? event.raw_event_metadata.regions.eez
            : 'N/A',
      },
      geometry: event.geom,
    })),
  };
  fs.writeFileSync(
    `${output}events.geojson`,
    JSON.stringify(geojson, null, 2), // pretty-print for readability
  );

  //event.parquet
  const rows = sortedEvents.map((event) => {
    const distances = event.raw_event_metadata?.distances;
    const eez = event.raw_event_metadata?.regions?.eez;

    return {
      event_id: event.event_id,
      timestamp_utc: event.timestamp_utc,
      matched_flag: event.matched_flag,
      lat: event.lat,
      lon: event.lon,
      confidence_fields: event.confidence_fields ?? null,
      distance_to_coast_km: distances?.startDistanceFromShoreKm ?? null,
      inside_eez: eez && eez.length > 0 ? eez[0] : null,
    };
  });
  await writeParquet(rows, parquetSchema, `${output}events.parquet`);

  //run_metadata.json
  const run_metadata = {
    config: sortedEvents.map(event => ({
      hash: event.run_metadata.config_hash,
      json: deepSortObject(event.run_metadata.config_json) as IConfigJSON[]
    })).sort( (a, b) => a.hash.localeCompare(b.hash) ),
    run_time: new Date().toISOString(),
    data_source_versions: [
      source4wings,
      sourceEvent
    ],
    git_commit_hash: await getGitCommitSHA()
  }
  fs.writeFileSync(
    `${output}run_metadata.json`,
    JSON.stringify(run_metadata, null, 2), // pretty-print for readability
  );

  //raw_metadata.json
  const raw_metadata = events.map(event => (
    {
      ...event.raw_metadata,
      event_metadata: event.raw_event_metadata
    }
  ))
  fs.writeFileSync(
    `${output}raw_metadata.json`,
    JSON.stringify(raw_metadata, null, 2), // pretty-print for readability
  );

  //raw_metadata.parquet
  const rows_raw_metadata = raw_metadata.map((r) => ({
    ...r,
    event_metadata: r.event_metadata
      ? JSON.stringify(r.event_metadata)
      : null
  }));
  await writeParquet(rows_raw_metadata, parquetSchema_raw_metadata, `${output}raw_metadata.parquet`);

  log('pilot finished.', '', ELogLevel.message, '3');
}

main().catch(console.error);
