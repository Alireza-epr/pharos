import parquet from 'parquetjs';
import { EReasonCodesStatic } from '../enum/generlaEnum';

export type TParquetField = {
  type: string;
  optional?: boolean;
};
const allReasonCodes = new Set<string>(Object.values(EReasonCodesStatic));

const baseSchema: Record<string, TParquetField> = {
  event_id: { type: 'UTF8' },
  timestamp_utc: { type: 'UTF8' },
  matched_flag: { type: 'BOOLEAN' },
  lat: { type: 'DOUBLE' },
  lon: { type: 'DOUBLE' },
  confidence_fields: { type: 'UTF8', optional: true },
  distance_to_coast_km: { type: 'DOUBLE', optional: true },
  inside_eez: { type: 'UTF8', optional: true },
};

for (const code of allReasonCodes) {
  baseSchema[code] = { type: 'BOOLEAN', optional: true };
}

export const parquetSchema = new parquet.ParquetSchema(baseSchema);

export const parquetSchema_raw_metadata = new parquet.ParquetSchema({
  callsign: { type: 'UTF8' },
  dataset: { type: 'UTF8' },
  date: { type: 'UTF8' },
  detections: { type: 'INT64' },

  entryTimestamp: { type: 'TIMESTAMP_MILLIS' },
  exitTimestamp: { type: 'TIMESTAMP_MILLIS' },

  firstTransmissionDate: { type: 'UTF8' },
  flag: { type: 'UTF8' },
  geartype: { type: 'UTF8' },
  imo: { type: 'UTF8' },
  lastTransmissionDate: { type: 'UTF8' },

  lat: { type: 'DOUBLE' },
  lon: { type: 'DOUBLE' },

  mmsi: { type: 'UTF8' },
  shipName: { type: 'UTF8' },
  vesselId: { type: 'UTF8' },
  vesselType: { type: 'UTF8' },

  event_metadata: { type: 'UTF8', optional: true },
});