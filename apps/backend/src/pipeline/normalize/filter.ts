import { IEventSchema, IFilteringParams } from '@packages/types';
import { IRecoverableEventFilters } from '../../helpers/types/servingTypes';

/**
 * The read-time counterpart to `sanitizeFetchUrlParams` (`helpers/utils/servingUtils.ts`):
 * enforces the `filters[i]` predicates that are recoverable from a cached raw
 * event (`matched_flag` / `raw_metadata`) instead of letting them narrow the
 * provider fetch — see `IRecoverableEventFilters` and "Partition fetch
 * options" in `docs/tech/serving-strategy.md`. Runs uniformly regardless of
 * cache state, right alongside `applyFilter`.
 */
export const applyRecoverableEventFilters = (
  a_Events: IEventSchema[],
  a_Filters: IRecoverableEventFilters,
): IEventSchema[] => {
  let filteredEvents = a_Events;

  if (a_Filters.matched !== undefined) {
    const matched = a_Filters.matched;
    filteredEvents = filteredEvents.filter(
      (e) => Boolean(e.matched_flag) === matched,
    );
  }

  // `raw_metadata` is the provider's raw entry — its flag/vesselType/geartype
  // are plain `string` (the provider doesn't type-guarantee enum membership),
  // while the filter values are the known enum. The casts below only bridge
  // that gap for comparison; they don't assert the raw value is a valid member.
  const flagFilter = a_Filters.flag;
  if (flagFilter && flagFilter.length > 0) {
    const flags = new Set(flagFilter);
    filteredEvents = filteredEvents.filter((e) =>
      flags.has(e.raw_metadata?.flag as (typeof flagFilter)[number]),
    );
  }

  const vesselTypeFilter = a_Filters.vessel_type;
  if (vesselTypeFilter && vesselTypeFilter.length > 0) {
    const vesselTypes = new Set(vesselTypeFilter);
    filteredEvents = filteredEvents.filter((e) =>
      vesselTypes.has(
        e.raw_metadata?.vesselType as (typeof vesselTypeFilter)[number],
      ),
    );
  }

  const geartypeFilter = a_Filters.geartype;
  if (geartypeFilter && geartypeFilter.length > 0) {
    const geartypes = new Set(geartypeFilter);
    filteredEvents = filteredEvents.filter((e) =>
      geartypes.has(
        e.raw_metadata?.geartype as (typeof geartypeFilter)[number],
      ),
    );
  }

  if (a_Filters.vessel_id && a_Filters.vessel_id.length > 0) {
    const vesselIds = new Set(a_Filters.vessel_id);
    filteredEvents = filteredEvents.filter((e) =>
      vesselIds.has(e.raw_metadata?.vesselId),
    );
  }

  return filteredEvents;
};

export const applyFilter = (
  a_Events: IEventSchema[],
  a_Filters: IFilteringParams,
): IEventSchema[] => {
  let filteredEvents = a_Events;

  if (a_Filters.event_id !== undefined) {
    const search = a_Filters.event_id.toLowerCase();
    filteredEvents = filteredEvents.filter((e) =>
      e.event_id.toLowerCase().includes(search),
    );
  }

  if (a_Filters.triage_score_min !== undefined) {
    const min = a_Filters.triage_score_min;
    filteredEvents = filteredEvents.filter(
      (e) =>
        e.scoring.triage_score !== undefined &&
        e.scoring.triage_score !== null &&
        e.scoring.triage_score >= min,
    );
  }

  if (a_Filters.triage_score_max !== undefined) {
    const max = a_Filters.triage_score_max;
    filteredEvents = filteredEvents.filter(
      (e) =>
        e.scoring.triage_score !== undefined &&
        e.scoring.triage_score !== null &&
        e.scoring.triage_score <= max,
    );
  }

  if (a_Filters.uncertainty_score_min !== undefined) {
    const min = a_Filters.uncertainty_score_min;
    filteredEvents = filteredEvents.filter(
      (e) =>
        e.scoring.uncertainty_score !== undefined &&
        e.scoring.uncertainty_score !== null &&
        e.scoring.uncertainty_score >= min,
    );
  }

  if (a_Filters.uncertainty_score_max !== undefined) {
    const max = a_Filters.uncertainty_score_max;
    filteredEvents = filteredEvents.filter(
      (e) =>
        e.scoring.uncertainty_score !== undefined &&
        e.scoring.uncertainty_score !== null &&
        e.scoring.uncertainty_score <= max,
    );
  }

  if (a_Filters.distance_to_coast_km_min !== undefined) {
    const min = a_Filters.distance_to_coast_km_min;
    filteredEvents = filteredEvents.filter(
      (e) => e.distance_to_coast_km >= min,
    );
  }

  if (a_Filters.distance_to_coast_km_max !== undefined) {
    const max = a_Filters.distance_to_coast_km_max;
    filteredEvents = filteredEvents.filter(
      (e) => e.distance_to_coast_km <= max,
    );
  }

  if (
    a_Filters.reason_codes_include !== undefined &&
    a_Filters.reason_codes_include.length > 0
  ) {
    filteredEvents = filteredEvents.filter((event) =>
      a_Filters.reason_codes_include!.some((reason) =>
        event.scoring.reason_codes?.includes(reason),
      ),
    );
  }

  if (
    a_Filters.reason_codes_exclude !== undefined &&
    a_Filters.reason_codes_exclude.length > 0
  ) {
    filteredEvents = filteredEvents.filter(
      (event) =>
        !a_Filters.reason_codes_exclude!.some((reason) =>
          event.scoring.reason_codes?.includes(reason),
        ),
    );
  }

  if (a_Filters.only_inside_eez) {
    filteredEvents = filteredEvents.filter(
      (e) => e.context_layers.EEZ.enrichments.length > 0,
    );
  }

  if (a_Filters.only_inside_mpa) {
    filteredEvents = filteredEvents.filter(
      (e) => e.context_layers.MPA.enrichments.length > 0,
    );
  }

  if (a_Filters.bathymetry_min !== undefined) {
    const min = a_Filters.bathymetry_min;

    filteredEvents = filteredEvents.filter((event) => {
      const bathymetry = Number(
        event.context_layers.Bathymetry.enrichments[0]?.value,
      );

      if (Number.isNaN(bathymetry)) {
        return true;
      }

      return !Number.isNaN(bathymetry) && bathymetry >= min;
    });
  }

  if (a_Filters.bathymetry_max !== undefined) {
    const max = a_Filters.bathymetry_max;

    filteredEvents = filteredEvents.filter((event) => {
      const bathymetry = Number(
        event.context_layers.Bathymetry.enrichments[0]?.value,
      );

      if (Number.isNaN(bathymetry)) {
        return true;
      }

      return !Number.isNaN(bathymetry) && bathymetry <= max;
    });
  }

  return filteredEvents;
};
