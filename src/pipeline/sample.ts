//@ts-nocheck
import pilot from '../config/pilot.json';
import {
  createEventSchema,
  getEntriesFrom4wingsResponse,
  getSourceFrom4wingsResponse,
  isMatchedCase,
} from './normalize';
import { fetchPostGFW } from './ingest';
import fs from 'fs';
import parquet from 'parquetjs-lite';
import { IGeometry } from '../types/geoJSONTypes';
import { IConfigJSON } from '../types/eventTypes';
import { I4wingsAPIResponse, IEventAPIResponse, IEventPostBodyParams, IEventPostURLParams, IPortVisitEvent } from '../types/gfwTypes';
import { ELogLevel } from '../enum/generlaEnum';
import { hashString } from '../utils/generalUtils';

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

const source4wings = pilot.source;
const dataset4wings = source4wings.split(":")[0] ?? '';
const dataset4wingsVersion = source4wings.split(":")[1] ?? '';
const baseURL4wings = pilot.URL;

const baseURLEvent = pilot.eventURL;
const sourceEvent = pilot.eventSource;
const bodyParams4wings = pilot.aoi;
const urlParams4wings = {
  "spatial-resolution": pilot['spatial-resolution'],
  "temporal-resolution": pilot['temporal-resolution'],
  "datasets[0]": pilot.source,
  "date-range": `${pilot.startDate},${pilot.endDate}`,
  format: pilot.format,
  "group-by": pilot['group-by'],
}

const geometry = {
  type: pilot.aoi.geojson.type,
  coordinates: pilot.aoi.geojson.coordinates
};

const output = pilot.output

const startDate = `${pilot.startDate}`;
const endDate = `${pilot.endDate}`;

const writeParquet= async (rows) => {
  const writer = await parquet.ParquetWriter.openFile(
    parquetSchema,
    `${output}events.parquet`,
  );

  for (const row of rows) {
    await writer.appendRow(row);
  }

  await writer.close();
}

const main = async () => {
  console.log('pilot starting...');
  let events = [];
  const configuration = new Set<IConfigJSON>();
  const resp4wings = await fetchPostGFW<I4wingsAPIResponse>(
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

  if(!entries4wings) return

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
        const portVisitResp = await fetchPostGFW<IEventAPIResponse<IPortVisitEvent>>(
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
        console.error('fetchPostGFW event error', err);
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

  fs.writeFileSync(
    `${output}events.geojson`,
    JSON.stringify(geojson, null, 2), // pretty-print for readability
  );

  writeParquet(rows);
  console.log('pilot finished.');
}

main().catch(console.error);
