import { IEventSchema } from '@packages/types';
import { EReasonCodes, EReasonCodesStatic } from '@packages/enum';
import { TTranslator } from '../types/generalTypes';

export const getMatchingStatus = (a_Event: IEventSchema, a_T: TTranslator) => {
  return a_Event.matched_flag
    ? a_T('general.label.matched')
    : a_T('general.label.unmatched');
};

// One short, plain-language explanation per reason code -- shown as a
// tooltip wherever a raw reason-code chip renders (Scoring's reason-codes
// display, Filter's include/exclude pickers), since the enum value itself
// (`bathymetry_shallow_eez_hotspot`) means nothing to someone who isn't the
// pipeline author. The two template variants aren't in EReasonCodesStatic
// (TS can't switch on a template-literal type), so they're matched by
// prefix first and the field name they carry is interpolated in.
export const reasonCodeHint = (
  a_Code: EReasonCodes,
  a_T: TTranslator,
): string => {
  const missingFieldPrefix = 'missing_required_field:';
  const missingThresholdFieldPrefix = 'missing_required_threshold_field:';
  if (a_Code.startsWith(missingFieldPrefix)) {
    return a_T('general.reasonCode.missingRequiredField', {
      field: a_Code.slice(missingFieldPrefix.length),
    });
  }
  if (a_Code.startsWith(missingThresholdFieldPrefix)) {
    return a_T('general.reasonCode.missingRequiredThresholdField', {
      field: a_Code.slice(missingThresholdFieldPrefix.length),
    });
  }

  const staticHints: Record<EReasonCodesStatic, string> = {
    [EReasonCodesStatic.near_coast]: a_T('general.reasonCode.nearCoast'),
    [EReasonCodesStatic.low_confidence_proxy]: a_T(
      'general.reasonCode.lowConfidenceProxy',
    ),
    [EReasonCodesStatic.missing_confidence_proxy]: a_T(
      'general.reasonCode.missingConfidenceProxy',
    ),
    [EReasonCodesStatic.inside_eez]: a_T('general.reasonCode.insideEez'),
    [EReasonCodesStatic.inside_mpa]: a_T('general.reasonCode.insideMpa'),
    [EReasonCodesStatic.unmatched_to_public_ais]: a_T(
      'general.reasonCode.unmatchedToPublicAis',
    ),
    [EReasonCodesStatic.matched_to_public_ais]: a_T(
      'general.reasonCode.matchedToPublicAis',
    ),
    [EReasonCodesStatic.noisy_vessel]: a_T('general.reasonCode.noisyVessel'),
    [EReasonCodesStatic.bathymetry_fishing_zone]: a_T(
      'general.reasonCode.bathymetryFishingZone',
    ),
    [EReasonCodesStatic.bathymetry_shallow_eez_hotspot]: a_T(
      'general.reasonCode.bathymetryShallowEezHotspot',
    ),
    [EReasonCodesStatic.bathymetry_mpa_shallow_zone]: a_T(
      'general.reasonCode.bathymetryMpaShallowZone',
    ),
    [EReasonCodesStatic.bathymetry_cargo_anomaly_zone]: a_T(
      'general.reasonCode.bathymetryCargoAnomalyZone',
    ),
    [EReasonCodesStatic.bathymetry_deep_mpa]: a_T(
      'general.reasonCode.bathymetryDeepMpa',
    ),
    [EReasonCodesStatic.low_confidence_tier]: a_T(
      'general.reasonCode.lowConfidenceTier',
    ),
    [EReasonCodesStatic.medium_confidence_tier]: a_T(
      'general.reasonCode.mediumConfidenceTier',
    ),
    [EReasonCodesStatic.high_confidence_tier]: a_T(
      'general.reasonCode.highConfidenceTier',
    ),
    [EReasonCodesStatic.invalid_threshold_config]: a_T(
      'general.reasonCode.invalidThresholdConfig',
    ),
  };

  return staticHints[a_Code as EReasonCodesStatic];
};

/**
 * True when a_Event shares a_Active's hotspot cell -- the "siblings" group
 * useEventMarkers keeps at full opacity alongside the selection itself.
 * a_Active being null, or a_Event *being* a_Active, is never a sibling.
 */
export const isHotspotSibling = (
  a_Event: IEventSchema,
  a_Active: IEventSchema | null,
): boolean => {
  if (!a_Active || a_Event.event_id === a_Active.event_id) return false;
  return (
    !!a_Active.hotspot && a_Event.hotspot?.cell_id === a_Active.hotspot.cell_id
  );
};

/**
 * True when a_Event should render dimmed on the map: something else is
 * selected, and a_Event is neither that selection, one of its hotspot
 * siblings, nor in the export list -- the export queue stays legible no
 * matter what's currently selected. Shared by useEventMarkers (per-feature)
 * and EventMarkersLegend (whether the "dimmed" row applies at all).
 */
export const isEventDimmed = (
  a_Event: IEventSchema,
  a_Active: IEventSchema | null,
  a_ExportedIds: Set<string>,
): boolean => {
  if (!a_Active || a_Event.event_id === a_Active.event_id) return false;
  if (isHotspotSibling(a_Event, a_Active)) return false;
  return !a_ExportedIds.has(a_Event.event_id);
};
