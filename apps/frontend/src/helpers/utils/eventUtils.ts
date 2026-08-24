import { IEventSchema } from '@packages/types';
import { TTranslator } from '../types/generalTypes';

export const getMatchingStatus = (a_Event: IEventSchema, a_T: TTranslator) => {
  return a_Event.matched_flag
    ? a_T('general.label.matched')
    : a_T('general.label.unmatched');
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
  return !!a_Active.hotspot && a_Event.hotspot?.cell_id === a_Active.hotspot.cell_id;
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
