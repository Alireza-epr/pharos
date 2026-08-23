import {
  IAISVesselPresenceFilters,
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

/**
 * The subset of a request's `datasets[i]`/`filters[i]` values that genuinely
 * scope *what* the provider is asked for — a value here can't be recovered
 * from a cached raw event afterward, so it must (a) reach the provider on a
 * miss-fetch, and (b) key the partition (coverage manifest *and* physical
 * storage), so two requests with different values here are never merged into
 * — or served from — the same partition. See "Partition fetch options" in
 * `docs/tech/serving-strategy.md`.
 *
 * Everything else `filters[i]` can carry (`matched`, `flag`, `vessel_type`,
 * `geartype`, `vessel_id`) *is* recoverable from a cached event's
 * `matched_flag` / `raw_metadata`, so it's deliberately excluded here and
 * enforced at read time instead — see {@link IRecoverableEventFilters}.
 */
export interface IPartitionFetchOptions
  extends Partial<Pick<IFishingEffortFilters, 'distance_from_port_km'>>,
    Partial<Pick<ISARVesselDetectionsFilters, 'neural_vessel_type'>> {
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
export interface IRecoverableEventFilters
  extends Partial<Pick<ISARVesselDetectionsFilters, 'matched'>> {
  flag?: IFishingEffortFilters['flag'][];
  vessel_type?: IAISVesselPresenceFilters['vessel_type'][];
  geartype?: IFishingEffortFilters['geartype'][];
  vessel_id?: IFishingEffortFilters['vessel_id'][];
}
