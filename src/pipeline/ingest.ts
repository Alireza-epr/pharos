import config from '../config/globalFishingWatch.json';
import { EFetchMethods } from '../enum/gfwEnum';
import { IConfigJSON } from '../types/eventTypes';
import {
  I4wingsReportGetURLParams,
  I4wingsReportPostBodyParams,
  I4wingsReportPostURLParams,
  IEventGetURLParams,
  IEventPostBodyParams,
  IEventPostURLParams,
  T4wingsSource,
  TEventSource,
} from '../types/gfwTypes';
import { log } from '../utils/generalUtils';

export const fetchPostGFW = async <T>(
  a_BaseURL: string,
  a_Source: T4wingsSource | TEventSource,
  a_URLParam: I4wingsReportPostURLParams | IEventPostURLParams,
  a_BodyParam: I4wingsReportPostBodyParams | IEventPostBodyParams,
) => {
  const metadata: IConfigJSON = {
    source: a_Source,
    base_url: a_BaseURL,
    method: EFetchMethods.post,
    url_params: a_URLParam,
    body_params: a_BodyParam,
  };
  const token = config.token;
  const searchParams = Object.entries(a_URLParam).reduce<
    Record<string, string>
  >((acc, [key, value]) => {
    acc[key] = String(value);
    return acc;
  }, {});

  const params = new URLSearchParams(searchParams);
  log('fetchPostGFW Metadata', metadata);
  const res = await fetch(`${a_BaseURL}?${params.toString()}`, {
    method: metadata.method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: a_BodyParam ? JSON.stringify(a_BodyParam) : null,
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`fetchPostGFW error ${res.status}: ${txt}`);
  }
  const results: T = await res.json();
  log('fetchPostGFW Response', results);
  return {
    metadata,
    results,
  };
};

export const fetchGetGFW = async <T>(
  a_BaseURL: string,
  a_Source: T4wingsSource | TEventSource,
  a_URLParam: I4wingsReportGetURLParams | IEventGetURLParams,
) => {
  const metadata: IConfigJSON = {
    source: a_Source,
    base_url: a_BaseURL,
    method: EFetchMethods.get,
    url_params: a_URLParam,
    body_params: null,
  };
  const token = config.token;
  const searchParams = Object.entries(a_URLParam).reduce<
    Record<string, string>
  >((acc, [key, value]) => {
    acc[key] = String(value);
    return acc;
  }, {});

  const params = new URLSearchParams(searchParams);
  log('fetchGetGFW Metadata', metadata);
  const res = await fetch(`${a_BaseURL}?${params.toString()}`, {
    method: metadata.method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`fetchGetGFW error ${res.status}: ${txt}`);
  }
  const results: T = await res.json();
  log('fetchGetGFW Response', results);
  return {
    metadata,
    results,
  };
};
/* export const fetchEvent = async <T>(a_URLParam: IEventGetURLParams, a_Method: EFetchMethods = EFetchMethods.get, a_BodyParam?: IEventPostBodyParams) => {
  const base = config.url["events"].endpoints.filteredByBody;
  const token = config.token;
  const searchParams = Object.entries( a_URLParam ).reduce<Record<string, string>>(
    (acc, [key, value])=>{
      acc[key] = String(value)
      return acc
    }, {}
  )

  const params = new URLSearchParams(searchParams);

  const res = await fetch(`${base}?${params.toString()}`, {
    method: a_Method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: a_BodyParam ? JSON.stringify(a_BodyParam) : null,
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`fetchEvent error ${res.status}: ${txt}`);
  }
  const json: T = await res.json();
  return json
} */
