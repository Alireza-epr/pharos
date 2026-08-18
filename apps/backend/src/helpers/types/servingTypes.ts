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
