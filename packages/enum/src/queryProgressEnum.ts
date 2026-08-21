/**
 * The GET/POST /v1/events pipeline reports its progress as a fixed,
 * ordered checklist (see docs/api/query-contract.md) so the frontend can render
 * a GitHub-checks-style modal: same steps every run, some resolving to
 * `skipped` depending on the query's cache config and cache hit/miss outcome.
 */
export const EQueryStepId = {
  validate: "validate",
  cacheCheck: "cache-check",
  fetchProvider: "fetch-provider",
  writeCache: "write-cache",
  readCache: "read-cache",
  filterScope: "filter-scope",
  filterPredicates: "filter-predicates",
  hotspots: "hotspots",
  paginate: "paginate",
} as const;
export type TQueryStepId = (typeof EQueryStepId)[keyof typeof EQueryStepId];

/** Fixed render order for the query-progress checklist — identical every run. */
export const QUERY_STEP_ORDER: TQueryStepId[] = [
  EQueryStepId.validate,
  EQueryStepId.cacheCheck,
  EQueryStepId.fetchProvider,
  EQueryStepId.writeCache,
  EQueryStepId.readCache,
  EQueryStepId.filterScope,
  EQueryStepId.filterPredicates,
  EQueryStepId.hotspots,
  EQueryStepId.paginate,
];

export const EQueryStepStatus = {
  pending: "pending",
  running: "running",
  success: "success",
  skipped: "skipped",
  error: "error",
} as const;
export type TQueryStepStatus =
  (typeof EQueryStepStatus)[keyof typeof EQueryStepStatus];

/** Why a step resolved to `skipped` instead of running. */
export const EQuerySkipReason = {
  cacheDisabled: "cache_disabled",
  fullyCached: "fully_cached",
} as const;
export type TQuerySkipReason =
  (typeof EQuerySkipReason)[keyof typeof EQuerySkipReason];
