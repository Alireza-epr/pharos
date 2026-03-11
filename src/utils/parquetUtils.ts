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

  for (const row of a_Rows) {
    await writer.appendRow(row);
  }

  await writer.close();
};