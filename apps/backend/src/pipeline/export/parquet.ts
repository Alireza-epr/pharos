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
