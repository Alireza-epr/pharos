import { IVesselIdentity, IVesselListURLParams } from '@packages/types';
import { EVesselDataset, EVesselRegistryInfoData } from '@packages/enum';

export interface IVesselDisplayFields {
  shipName: string | undefined;
  flag: string | undefined;
  mmsi: string | undefined;
  imo: string | undefined;
  callsign: string | undefined;
  vesselType: string | undefined;
  gearType: string | undefined;
}

/**
 * A vessel identity search result carries the same identifying fields in up
 * to three different places (selfReportedInfo, registryInfo,
 * combinedSourcesInfo) -- this picks one reasonable "primary" value per
 * field for a compact result row, preferring the AIS self-reported record
 * (closest to whatever a free-text search by MMSI/name/callsign actually
 * matched) over the registry record.
 */
export const getVesselDisplayFields = (
  a_Vessel: IVesselIdentity,
): IVesselDisplayFields => {
  const primary = a_Vessel.selfReportedInfo?.[0] ?? a_Vessel.registryInfo?.[0];
  return {
    shipName: primary?.shipname,
    flag: primary?.flag,
    mmsi: primary?.ssvid,
    imo: primary?.imo,
    callsign: primary?.callsign,
    vesselType: a_Vessel.combinedSourcesInfo?.[0]?.shiptypes?.[0]?.name,
    gearType: a_Vessel.combinedSourcesInfo?.[0]?.geartypes?.[0]?.name,
  };
};

/**
 * A stable, actually-unique id for a search result -- MMSI/IMO/callsign are
 * vessel *attributes*, not identifiers: GFW can return two different
 * identity records sharing the same MMSI (reassigned over time, spoofed,
 * etc.), so none of them are safe as a React key on their own. GFW's own
 * internal vessel UUID (surfaced identically as both
 * combinedSourcesInfo[0].vesselId and selfReportedInfo[0].id) is the one
 * field that's actually 1:1 with a distinct identity record.
 */
export const getVesselKey = (a_Vessel: IVesselIdentity): string | undefined =>
  a_Vessel.combinedSourcesInfo?.[0]?.vesselId ??
  a_Vessel.selfReportedInfo?.[0]?.id ??
  a_Vessel.registryInfo?.[0]?.id;

/**
 * The exact GET /vessels (list-by-ids) params useVesselIdentity sends for a
 * given vesselId -- pulled out as its own function so the Detail panel's
 * "Download Config" button can show precisely what was requested from the
 * provider, rather than a second, potentially-drifting reconstruction of it.
 */
export const buildVesselIdentityRequestParams = (
  a_VesselId: string,
): IVesselListURLParams => ({
  'datasets[0]': EVesselDataset.vesselIdentity,
  'ids[0]': a_VesselId,
  'registries-info-data': EVesselRegistryInfoData.ALL,
});

// GFW rejects a `query` shorter than 3 characters -- gate the Run Query
// button the same way rather than let every keystroke round-trip to the
// provider. A free-text `query` needs this minimum, but the advanced
// `where` expression is self-contained and can carry a search on its own.
export const MIN_VESSEL_QUERY_LENGTH = 3;

export const isVesselSearchReady = (
  a_Query: string,
  a_Where: string,
): boolean =>
  a_Query.trim().length >= MIN_VESSEL_QUERY_LENGTH || a_Where.trim().length > 0;

export interface IVesselPaginationState {
  /** Vessels fetched across every cached page so far. */
  fetchedCount: number;
  /** The next page was already fetched this session -- no request needed. */
  hasCachedNext: boolean;
  /** More pages exist upstream, beyond what's cached. */
  hasMoreOnServer: boolean;
  hasPrev: boolean;
  hasNext: boolean;
}

/**
 * Derives Prev/Next button state from GFW's forward-only scroll cursor --
 * see vesselStore.ts's own doc comment for why this shape is needed (no
 * backward cursor, no end-of-results flag, the same `since` token reused
 * for every page). Pure so it's testable independent of VesselTab.tsx,
 * which only wires store values into it.
 */
export const getVesselPaginationState = (
  a_Pages: IVesselIdentity[][],
  a_PageIndex: number,
  a_Since: string | null,
  a_Total: number | null,
): IVesselPaginationState => {
  const fetchedCount = a_Pages.reduce((sum, page) => sum + page.length, 0);
  const hasCachedNext = a_PageIndex + 1 < a_Pages.length;
  const hasMoreOnServer =
    a_Since != null && a_Total != null && fetchedCount < a_Total;
  const hasPrev = a_PageIndex > 0;
  const hasNext = hasCachedNext || hasMoreOnServer;

  return { fetchedCount, hasCachedNext, hasMoreOnServer, hasPrev, hasNext };
};
