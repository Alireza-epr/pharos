import { IZipFile } from '@packages/types';
import { ICSVGroup } from '../../helpers/types/generalTypes';
import { csvString } from './csv';
import { parquetBuffer } from './parquet';
import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';
import parquet from 'parquetjs';

// JSZip stamps each entry's local file header with `date` (default:
// `new Date()`), which is otherwise the one thing that makes two exports of
// byte-identical content produce different ZIP bytes. Pin it so the archive
// is a pure function of its contents, not of when it happened to be built —
// see the export-bundle determinism test in `tests/exportBundle.spec.ts`.
const ZIP_ENTRY_DATE = new Date(0);

export const writeZip = async (a_OutputPath: string, a_Files: IZipFile[]) => {
  const zip = new JSZip();

  for (const file of a_Files) {
    if (file.name.endsWith('.json')) {
      zip.file(file.name, JSON.stringify(file.content, null, 2), {
        date: ZIP_ENTRY_DATE,
      });
    } else if (file.name.endsWith('.geojson')) {
      const featureCollection = {
        type: 'FeatureCollection',
        features: file.content,
      };

      zip.file(file.name, JSON.stringify(featureCollection, null, 2), {
        date: ZIP_ENTRY_DATE,
      });
    } else if (file.name.endsWith('.csv')) {
      const csvGroups = file.content as ICSVGroup<any>[][];

      let csvStrings: string[] = [];

      for (const csvGroup of csvGroups) {
        const thisCSVString = csvString(
          csvGroup[0].title,
          csvGroup[0].samples,
          csvGroup[1]?.title,
          csvGroup[1]?.samples,
        );

        csvStrings.push(thisCSVString + '\n\n');
      }

      zip.file(file.name, csvStrings.join(' '), { date: ZIP_ENTRY_DATE });
    } else if (file.name.endsWith('.parquet')) {
      const { data, schema } = file.content as {
        data: { [key: string]: any }[];
        schema: parquet.ParquetSchema;
      };

      const buffer = await parquetBuffer(data, schema);

      zip.file(file.name, buffer, { date: ZIP_ENTRY_DATE });
    } else {
      throw new Error(`[writeZip] Unsupported file type: ${file.name}`);
    }
  }

  const buffer = await zip.generateAsync({
    type: 'nodebuffer',
  });

  fs.mkdirSync(path.dirname(a_OutputPath), { recursive: true });
  fs.writeFileSync(a_OutputPath, buffer);

  return buffer;
};
