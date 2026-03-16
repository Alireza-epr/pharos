import config from './config/globalFishingWatch.json';
import { useState } from 'react';
import appStyle from './App.module.scss';
import { E4wingsDatasets, EEventDatasets, EFetchMethods } from './enum/gfwEnum';
import {
  detectionPostGFW,
  detectionGetGFW,
} from './pipeline/ingest/detections';
import {
  I4wingsReportPostBodyParams,
  I4wingsReportPostURLParams,
  IEventPostURLParams,
  I4wingsAPIResponse,
  IPortVisitEvent,
  IEventPostBodyParams,
  IEventAPIResponse,
  T4wingsSource,
  TEventSource,
  T4wingsFilter,
  IEventGetURLParams,
} from './types/gfwTypes';
import {
  getEntriesFrom4wingsResponse,
  getSource,
  getSourceFrom4wingsResponse,
  log,
} from './utils/generalUtils';
import { ELogLevel } from './enum/generlaEnum';
import { IGeometry } from './types/geoJSONTypes';
import { IConfigJSON } from './types/eventTypes';
import { createEventSchema } from './pipeline/normalize/schema';
import { isMatchedCase } from './pipeline/normalize/validation';

export interface AppProps {}

const App = (props: AppProps) => {
  const [response, setResponse] = useState<I4wingsAPIResponse | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFetchSAREvent = async () => {
    const configuration = new Set<IConfigJSON>();

    const startDate = `2025-12-04T00:00:00Z`;
    const endDate = `2025-12-06T23:59:59Z`;
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

    const baseURL4wings = config.url['4wings'].endpoints.report;
    const baseURLEvent = config.url['events'].endpoints.filteredByBody;

    const dataset4wings = E4wingsDatasets.SARVesselDetections;
    const datasetEvent = EEventDatasets.portVisitsEvent;

    const datasetVersion4wings = 'v3.0';
    const datasetVersionEvent = 'v3.0';

    const source4wings = getSource(
      dataset4wings,
      datasetVersion4wings,
    ) as T4wingsSource;
    const sourceEvent = getSource(
      datasetEvent,
      datasetVersionEvent,
    ) as TEventSource;

    const filters: T4wingsFilter = {
      matched: false,
    };
    const filtersArray = (
      Object.keys(filters) as Array<keyof T4wingsFilter>
    ).map((key) => `${key}='${filters[key]}'`);

    const urlParams4wings: I4wingsReportPostURLParams = {
      //"filters[0]": filtersArray[0] ?? '',
      'spatial-resolution': 'HIGH',
      'temporal-resolution': 'HOURLY',
      'datasets[0]': source4wings,
      'date-range': `${startDate},${endDate}`,
      format: 'JSON',
      'group-by': 'VESSEL_ID',
    };

    const bodyParams4wings: I4wingsReportPostBodyParams = {
      geojson: geometry,
    };

    try {
      setLoading(true);
      const resp = await detectionPostGFW<I4wingsAPIResponse>(
        baseURL4wings,
        source4wings,
        urlParams4wings,
        bodyParams4wings,
      );

      if (resp.results.entries.length === 0) {
        throw new Error('4wingsAPI no entry');
      }

      const key4wings = getSourceFrom4wingsResponse(
        resp.results,
        dataset4wings,
      );
      if (!key4wings) {
        throw new Error('4wingsAPI key not defined');
      }

      const entries4wings = getEntriesFrom4wingsResponse(
        resp.results,
        key4wings,
      );
      if (!entries4wings) {
        throw new Error('4wingsAPI not defined entries');
      }
      if (entries4wings.length === 0) {
        throw new Error('4wingsAPI no dataset entry');
      }

      for (const entries4wing of entries4wings) {
        const thisEntry = entries4wing;
        configuration.clear();
        configuration.add(resp.metadata);

        if (isMatchedCase(thisEntry)) {
          const urlParamsEvent: IEventPostURLParams = {
            limit: 1,
            offset: 0,
          };

          /* const bodyParamsEvent: IEventPostBodyParams = {
            vessels: [thisEntry.vesselId],
            startDate: startDate,
            endDate: endDate,
            datasets: [sourceEvent],
            geometry: geometry,
          }; */

          const urlParamsEventGet: IEventGetURLParams = {
            ...urlParamsEvent,
            'end-date': endDate,
            'start-date': startDate,
            'vessels[0]': thisEntry.vesselId,
            'datasets[0]': sourceEvent,
          };

          try {
            /* const portVisitResp = await detectionPostGFW<
              IEventAPIResponse<IPortVisitEvent>
            >(baseURLEvent, sourceEvent, urlParamsEvent, bodyParamsEvent); */
            const portVisitResp = await detectionGetGFW<
              IEventAPIResponse<IPortVisitEvent>
            >(baseURLEvent, sourceEvent, urlParamsEventGet);

            if (configuration) configuration.add(portVisitResp.metadata);

            if (portVisitResp.results.entries.length == 0) {
              try {
                const eventSchema = await createEventSchema(
                  configuration,
                  thisEntry,
                );
                log('Matched Event Schema( No event )', eventSchema);
              } catch (error) {
                log(
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
                  log('Matched Event Schema', eventSchema);
                } catch (error) {
                  log('Matched Event Schema error', error, ELogLevel.error);
                }
              }
            }
          } catch (err) {
            log('detectionPostGFW event error', err, ELogLevel.error);
          }
        } else {
          try {
            const eventSchema = await createEventSchema(
              configuration,
              thisEntry,
            );
            log('Unmatched Event Schema', eventSchema);
          } catch (error) {
            log('Unmatched Event Schema error', error, ELogLevel.error);
          }
        }
      }

      setResponse(resp.results);
      setLoading(false);
      setError(null);
    } catch (err: any) {
      log('detectionPostGFW 4wings error', err, ELogLevel.error);
      setLoading(false);
      setResponse(null);
      setError(err);
    }
  };

  return (
    <div className={` ${appStyle.wrapper}`}>
      <h1>PHAROS</h1>

      <div style={{ marginTop: '1rem', display: 'flex', gap: '16px' }}>
        <label htmlFor="fetchEvent">Fetch Event</label>
        <button id="fetchEvent" onClick={handleFetchSAREvent}>
          Fetch
        </button>
      </div>
      <div>
        {loading
          ? 'loading'
          : response !== null
            ? response.entries[0]
              ? response.entries[0]['public-global-sar-presence:v3.0'] &&
                response.entries[0]['public-global-sar-presence:v3.0'].length >
                  0
                ? response.entries[0]['public-global-sar-presence:v3.0'].map(
                    (sarPresence, index) => (
                      <p
                        key={index}
                        style={{
                          color:
                            sarPresence.vesselType.length === 0 ? 'red' : '',
                        }}
                      >
                        {`${index + 1}- 
                        "Vessel Type: ${sarPresence.vesselType.length > 0 ? sarPresence.vesselType : 'NOT AVAILABLE'}" |
                        "Entry Timestamp: ${sarPresence.entryTimestamp}" |
                        "Exit Timestamp: ${sarPresence.exitTimestamp}" | 
                        "lat: ${sarPresence.lat}" | 
                        "lon: ${sarPresence.lon}" |
                        "Vessel Id: ${sarPresence.vesselId.length > 0 ? sarPresence.vesselId : 'NOT AVAILABLE'}" 
                      `}
                      </p>
                    ),
                  )
                : response.entries[0]['public-global-presence:v3.0'] &&
                    response.entries[0]['public-global-presence:v3.0'].length >
                      0
                  ? response.entries[0]['public-global-presence:v3.0'].map(
                      (sarPresence, index) => (
                        <p
                          key={index}
                          style={{
                            color:
                              sarPresence.vesselType.length === 0 ? 'red' : '',
                          }}
                        >
                          {`${index + 1}- 
                        "Vessel Type: ${sarPresence.vesselType.length > 0 ? sarPresence.vesselType : 'NOT AVAILABLE'}" |
                        "Entry Timestamp: ${sarPresence.entryTimestamp}" |
                        "Exit Timestamp: ${sarPresence.exitTimestamp}" | 
                        "lat: ${sarPresence.lat}" | 
                        "lon: ${sarPresence.lon}" |
                        "Vessel Id: ${sarPresence.vesselId.length > 0 ? sarPresence.vesselId : 'NOT AVAILABLE'}" 
                      `}
                        </p>
                      ),
                    )
                  : '2'
              : '1'
            : error !== null
              ? `${error}`
              : ``}
      </div>
    </div>
  );
};

export default App;
