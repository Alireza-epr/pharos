import fs from 'fs';
import { fs_writeFileSync } from './fs';
import { ICSVGroup, TEventCSVRow } from '../../helpers/types/generalTypes';
import { IEventSchema } from '@packages/types';
import { EReasonCodes, EReasonCodesStatic } from '@packages/enum';


const jsonToCsv = <T>(a_Title: string, a_Samples: T[]) => {
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

const csvString = <T, N>(
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

export const createCSVRows = (
  a_Events: IEventSchema[]
) => {
  const rows: TEventCSVRow[] = a_Events.map((event) => {
    const reason_codes = event.scoring.reason_codes;
    let edge_case_flags: { [key in EReasonCodes]?: boolean } =
      Object.fromEntries(
        Object.keys(EReasonCodesStatic).map((key) => [key, false]),
      );

    if (reason_codes) {
      for (const reason_code of reason_codes) {
        edge_case_flags[reason_code] = true;
      }
    }

    const eez = event.context_layers.EEZ.enrichments.length > 0 ?
      event.context_layers.EEZ.enrichments.map( e => e.label).join(", ")
      : undefined
    
      
    const mpa = event.context_layers.MPA.enrichments.length > 0 ?
      event.context_layers.MPA.enrichments.map( e => e.label).join(", ")
      : undefined

      
    return {
      event_id: event.event_id,
      timestamp_utc: event.timestamp_utc,
      matched_flag: event.matched_flag,
      lat: event.lat,
      lon: event.lon,
      confidence_proxy: event.confidence_proxy ?? null,
      confidence_tier: event.confidence_tier,
      distance_to_coast_km: event.distance_to_coast_km,
      bathymetry_m: event.context_layers.Bathymetry.enrichments[0].value,
      triage_score: event.scoring.triage_score ?? null,
      uncertainty_score: event.scoring.uncertainty_score ?? null,
      mpa,
      eez,
      ...edge_case_flags,
    };
  });

  return rows
}

export const writeCSV = <T>(
  a_OutputPath: string,
  a_CSVGroups: ICSVGroup<T>[][],
) => {

  let csvStrings: string[] = []
  for (const csvGroup of a_CSVGroups) {
    const thisCSVString = csvString(
      csvGroup[0].title,
      csvGroup[0].samples,
      csvGroup[1]?.title,
      csvGroup[1]?.samples,
    )
    csvStrings.push(thisCSVString + '\n' + '\n')
  }
  const joined = csvStrings.join(' ')
  fs_writeFileSync(
    a_OutputPath + ".csv",
    joined,
    undefined,
    undefined,
    'utf8',
  )
}