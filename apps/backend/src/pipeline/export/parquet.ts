import { deepSortObject } from '@packages/utils';
import parquet from 'parquetjs';

export const writeParquet = async (
  a_OutputPath: string,
  a_Rows: { [key: string]: any }[],
  a_ParquetSchema: parquet.ParquetSchema,
) => {
  const writer = await parquet.ParquetWriter.openFile(
    a_ParquetSchema,
    `${a_OutputPath}.parquet`,
  );

  const sortedRows = deepSortObject(a_Rows);

  for (const row of sortedRows) {
    await writer.appendRow(row);
  }

  await writer.close();
};

export const parquetBuffer = async (
  a_Rows: { [key: string]: any }[],
  a_ParquetSchema: parquet.ParquetSchema,
): Promise<Buffer> => {
  const chunks: Buffer[] = [];

  // parquetjs drives the output via write(buf, cb)/close(cb); collect the chunks
  // in memory instead of touching disk so the result can be added to a zip.
  const collector = {
    write: (a_Buf: Buffer, a_Cb: (a_Err?: Error | null) => void) => {
      chunks.push(a_Buf);
      a_Cb();
    },
    close: (a_Cb: (a_Err?: Error | null) => void) => {
      a_Cb();
    },
  };

  const writer = await parquet.ParquetWriter.openStream(
    a_ParquetSchema,
    collector as unknown as Parameters<
      typeof parquet.ParquetWriter.openStream
    >[1],
  );

  const sortedRows = deepSortObject(a_Rows);

  for (const row of sortedRows) {
    await writer.appendRow(row);
  }

  await writer.close();

  return Buffer.concat(chunks);
};
