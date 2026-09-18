import { IDropdownOption } from '@/components/common/inputs/DropdownInput';
import {
  EEventVesselType,
  EFormat,
  EGroupBy,
  ERegionBufferOperations,
  ERegionBufferUnits,
  ESpatialResolution,
  ETemporalResolution,
  EVesselMatchField,
  EVesselSearchInclude,
} from '@packages/enum';
import { TEventConfidence, TEventEncounterType } from '@packages/types';

export const sort_field_options = [
  { label: 'Triage Score', value: 'scoring.triage_score' },
  { label: 'Uncertainty Score', value: 'scoring.uncertainty_score' },
  { label: 'Timestamp', value: 'timestamp_utc' },
  { label: 'Distance to Coast', value: 'distance_to_coast_km' },
  { label: 'Confidence Tier', value: 'confidence_tier' },
  { label: 'Confidence Proxy', value: 'confidence_proxy' },
  { label: 'Matched', value: 'matched_flag' },
  { label: 'Event ID', value: 'event_id' },
  { label: 'Longitude', value: 'lon' },
  { label: 'Latitude', value: 'lat' },
  {
    label: 'Bathymetry Value',
    value: 'context_layers.Bathymetry.enrichments[0].value',
  },
];

export const spatialResolutionOptions: IDropdownOption<ESpatialResolution>[] =
  Object.values(ESpatialResolution).map((v) => ({ label: v, value: v }));
export const formatOptions: IDropdownOption<EFormat>[] = Object.values(
  EFormat,
).map((v) => ({ label: v, value: v }));
export const groupByOptions: IDropdownOption<EGroupBy>[] = Object.values(
  EGroupBy,
).map((v) => ({ label: v, value: v }));
export const temporalResolutionOptions: IDropdownOption<ETemporalResolution>[] =
  Object.values(ETemporalResolution).map((v) => ({ label: v, value: v }));

export const bufferOperationOptions: IDropdownOption<ERegionBufferOperations>[] =
  Object.values(ERegionBufferOperations).map((v) => ({ label: v, value: v }));
export const bufferUnitOptions: IDropdownOption<ERegionBufferUnits>[] =
  Object.values(ERegionBufferUnits).map((v) => ({ label: v, value: v }));

export const vesselMatchFieldOptions: IDropdownOption<EVesselMatchField>[] =
  Object.values(EVesselMatchField).map((v) => ({ label: v, value: v }));
export const vesselIncludeOptions: IDropdownOption<EVesselSearchInclude>[] =
  Object.values(EVesselSearchInclude).map((v) => ({ label: v, value: v }));

const EVENT_ENCOUNTER_TYPES: TEventEncounterType[] = [
  'CARRIER-FISHING',
  'FISHING-CARRIER',
  'FISHING-SUPPORT',
  'SUPPORT-FISHING',
  'FISHING-BUNKER',
  'BUNKER-FISHING',
  'FISHING-FISHING',
  'FISHING-TANKER',
  'TANKER-FISHING',
  'CARRIER-BUNKER',
  'BUNKER-CARRIER',
  'SUPPORT-BUNKER',
  'BUNKER-SUPPORT',
];
export const eventEncounterTypeOptions: IDropdownOption<TEventEncounterType>[] =
  EVENT_ENCOUNTER_TYPES.map((v) => ({ label: v, value: v }));

export const eventConfidenceOptions: IDropdownOption<TEventConfidence>[] = [
  { label: '2', value: '2' },
  { label: '3', value: '3' },
  { label: '4', value: '4' },
];

export const eventVesselTypeOptions: IDropdownOption<EEventVesselType>[] =
  Object.values(EEventVesselType).map((v) => ({ label: v, value: v }));
