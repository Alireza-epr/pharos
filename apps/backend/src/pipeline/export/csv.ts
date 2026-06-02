import fs from 'fs';
import { fs_writeFileSync } from './fs';
import { ICSVGroup } from '../../helpers/types/generalTypes';


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

export const writeCSV = <T>(
  a_OutputPath: string,
  a_CSVGroups: ICSVGroup<T>[][],
) => {

  let csvStrings: string[] = []
  for (const csvGroup of a_CSVGroups) {
    const thisCSVString = csvString(
      csvGroup[0].title,
      csvGroup[0].samples,
      csvGroup[1].title,
      csvGroup[1].samples,
    )
    csvStrings.push(thisCSVString + '\n' + '\n')
  }
  const joined = csvStrings.join(' ')
  fs_writeFileSync(
    a_OutputPath+".csv",
    joined,
    undefined,
    undefined,
    'utf8',
  )
}