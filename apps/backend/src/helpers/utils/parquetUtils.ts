import { deepSortObject } from '@packages/utils';
import parquet from 'parquetjs';

export const writeParquet = async (
  a_Rows: { [key: string]: any }[],
  a_ParquetSchema: parquet.ParquetSchema,
  a_OutputPath: string,
) => {
  const writer = await parquet.ParquetWriter.openFile(
    a_ParquetSchema,
    `${a_OutputPath}`,
  );

  const sortedRows = deepSortObject(a_Rows);

  for (const row of sortedRows) {
    await writer.appendRow(row);
  }

  await writer.close();
};
