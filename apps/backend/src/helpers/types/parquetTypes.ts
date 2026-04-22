import parquet from 'parquetjs';
import { EReasonCodesStatic } from '@packages/enum';

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
  confidence_proxy: { type: 'DOUBLE', optional: true },
  distance_to_coast_km: { type: 'DOUBLE', optional: true },
  inside_eez: { type: 'UTF8', optional: true },
  triage_score: { type: 'DOUBLE', optional: true},
  uncertainty_score: { type: 'DOUBLE', optional: true},
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

export const parquetSchema_hotspot = new parquet.ParquetSchema({
  cell_id: { type: 'UTF8' },
  time_bin: { type: 'UTF8' },
  count_total: { type: 'DOUBLE' },
  count_unmatched: { type: 'DOUBLE' },
  count_high_score_unmatched: { type: 'DOUBLE' },
  mean_score: { type: 'DOUBLE', optional: true },
  mean_uncertainty: { type: 'DOUBLE', optional: true },
  pct_near_coast: { type: 'DOUBLE' },
  recurrence_count: { type: 'DOUBLE' },
  days: { type: 'DOUBLE' },
  days_with_unmatched: { type: 'DOUBLE' },
});
