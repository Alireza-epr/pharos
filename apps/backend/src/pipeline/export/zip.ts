import { IZipFile } from '@packages/types';
import { ICSVGroup } from '../../helpers/types/generalTypes';
import { csvString } from './csv';
import { parquetBuffer } from './parquet';
import fs from 'fs';
import JSZip from 'jszip';
import parquet from 'parquetjs';

export const writeZip = async (a_OutputPath: string, a_Files: IZipFile[]) => {
  const zip = new JSZip();

  for (const file of a_Files) {
    if (file.name.endsWith('.json')) {
      zip.file(file.name, JSON.stringify(file.content, null, 2));
    } else if (file.name.endsWith('.geojson')) {
      const featureCollection = {
        type: 'FeatureCollection',
        features: file.content,
      };

      zip.file(file.name, JSON.stringify(featureCollection, null, 2));
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

      zip.file(file.name, csvStrings.join(' '));
    } else if (file.name.endsWith('.parquet')) {
      const { data, schema } = file.content as {
        data: { [key: string]: any }[];
        schema: parquet.ParquetSchema;
      };

      const buffer = await parquetBuffer(data, schema);

      zip.file(file.name, buffer);
    } else {
      throw new Error(`[writeZip] Unsupported file type: ${file.name}`);
    }
  }

  const buffer = await zip.generateAsync({
    type: 'nodebuffer',
  });

  fs.writeFileSync(a_OutputPath, buffer);

  return buffer;
};
