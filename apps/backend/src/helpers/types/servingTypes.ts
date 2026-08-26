import {
  IAISVesselPresenceFilters,
  I4wingsReportPostURLParams,
  IFishingEffortFilters,
  ISARVesselDetectionsFilters,
  T4wingsSource,
} from '@packages/types';

/**
 * Records, per day and per non-spatial query key, the set of H3 cells already
 * fetched into the cache. A day is "covered" for a query when every cell its AOI
 * needs is already present — so a zoomed-in AOI whose cells are a subset of an
 * earlier fetch is a pure cache hit (no provider call), even though its exact
 * polygon differs from the earlier request.
 */
export interface ICoverageManifest {
  [date: string]: { [queryKey: string]: string[] };
}

/** A parsed inclusive time window. */
export interface ITimeRange {
  start: Date;
  end: Date;
}

// refetch triggers
export interface IPartitionFetchOptions
  extends
    Partial<Pick<IFishingEffortFilters, 'distance_from_port_km'>>,
    Partial<Pick<ISARVesselDetectionsFilters, 'neural_vessel_type'>>,
    Partial<
      Pick<
        I4wingsReportPostURLParams,
        | 'spatial-resolution'
        | 'temporal-resolution'
        | 'spatial-aggregation'
        | 'group-by'
        | 'format'
      >
    > {
  /**
   * `IAISVesselPresenceFilters.speed` models a single value, but the UI can
   * select several at once (`speed in ('<2','2-4')`) — kept as a list to
   * reflect that.
   */
  speed?: IAISVesselPresenceFilters['speed'][];
  /** Which upstream dataset(s) this partition was fetched with. */
  datasets: T4wingsSource[];
}

/**
 * The `filters[i]` predicates that ARE recoverable from a cached raw event —
 * excluded from {@link IPartitionFetchOptions} and enforced at read time via
 * `applyRecoverableEventFilters` instead, regardless of whether the response
 * came from cache or a fresh fetch.
 *
 * Each field's element type is taken from the existing GFW filter interfaces
 * (`gfwTypes.ts`) rather than a generic `string`, so e.g. `flag` stays
 * `ECountryFlag`, not an unconstrained string. Picked from whichever of the
 * three filter interfaces declares the field non-optional, so the element
 * type itself doesn't carry a spurious `| undefined`.
 */
export interface IRecoverableEventFilters extends Partial<
  Pick<ISARVesselDetectionsFilters, 'matched'>
> {
  flag?: IFishingEffortFilters['flag'][];
  vessel_type?: IAISVesselPresenceFilters['vessel_type'][];
  geartype?: IFishingEffortFilters['geartype'][];
  vessel_id?: IFishingEffortFilters['vessel_id'][];
}
