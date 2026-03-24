import { EContextLayers } from '../enum/gfwEnum';
import { IContextLayer } from './eventTypes';
import { IGeometry } from './geoJSONTypes';

export interface IEventProperties {
  event_id: string;
  timestamp_utc: string;
  matched_flag: boolean;
  lat: number;
  lon: number;
  confidence_fields: 2 | 3 | 4 | null;
  distance_to_coast_km: number | null;
  context_layers: Record<EContextLayers, IContextLayer>;
}

export enum EGeoJSONEventMissingness {
  event_id = 'event_id',
  timestamp_utc = 'timestamp_utc',
  lat = 'lat',
  lon = 'lon',
  confidence_fields = 'confidence_fields',
  distance_to_coast_km = 'distance_to_coast_km',
}
