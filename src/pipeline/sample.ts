//@ts-nocheck
import config from '../config/globalFishingWatch.json';
import {
  createEventSchema,
  getEntriesFrom4wingsResponse,
  getSourceFrom4wingsResponse,
  isMatchedCase,
} from './normalize';
import { fetchPostGFW } from './ingest';
import fs from 'fs';
import parquet from 'parquetjs-lite';

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

const dataset4wings = 'public-global-sar-presence';
const baseURL4wings = config.url['4wings'].endpoints.report;
const baseURLEvent = config.url['events'].endpoints.filteredByBody;
const source4wings = config.sample.urlParams['datasets[0]'];
const sourceEvent = 'public-global-port-visits-events:v3.0';
const bodyParams4wings = config.sample.body;
const urlParams4wings = config.sample.urlParams;
const geometry: IGeometry = {
  type: 'Polygon',
  coordinates: [
    [
      [14.11, 55.26],
      [14.68, 55.27],
      [14.69, 55.11],
      [14.09, 55.08],
      [14.11, 55.26],
    ],
  ],
};

const startDate = `2025-12-04T00:00:00Z`;
const endDate = `2025-12-06T23:59:59Z`;

async function writeParquet(rows) {
  const writer = await parquet.ParquetWriter.openFile(
    parquetSchema,
    'data/out/events.parquet',
  );

  for (const row of rows) {
    await writer.appendRow(row);
  }

  await writer.close();
}

async function main() {
  console.log('starting...');
  let events = [];
  const configuration = new Set<IConfigJSON>();
  const resp4wings = await fetchPostGFW(
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
        const portVisitResp = await fetchPostGFW(
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
            console.log('Matched Event Schema( No event )', eventSchema);
            events.push(eventSchema);
          } catch (error) {
            console.log(
              'Matched Event Schema( No event ) error',
              error,
              ELogLevel.error,
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
              console.log('Matched Event Schema', eventSchema);
              events.push(eventSchema);
            } catch (error) {
              console.log('Matched Event Schema error', error, ELogLevel.error);
            }
          }
        }
      } catch (err) {
        console.log('fetchPostGFW event error', err, ELogLevel.error);
      }
    } else {
      try {
        const eventSchema = await createEventSchema(configuration, thisEntry);
        console.log('Unmatched Event Schema', eventSchema);
        events.push(eventSchema);
      } catch (error) {
        console.log('Unmatched Event Schema error', error, ELogLevel.error);
      }
    }
  }

  const geojson = {
    type: 'FeatureCollection',
    features: events.map((event) => ({
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

  const rows = events.map((event) => {
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

  console.log('geojson');
  console.log(geojson);
  console.log('rows');
  console.log(rows);

  fs.writeFileSync(
    'data/out/events.geojson',
    JSON.stringify(geojson, null, 2), // pretty-print for readability
  );

  writeParquet(rows);
  console.log('finished.');
}

main().catch(console.error);
