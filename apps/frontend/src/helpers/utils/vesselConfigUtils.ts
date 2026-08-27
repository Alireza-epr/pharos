import {
  IVesselConfigJSON,
  IVesselListConfigJSON,
  IVesselListURLParams,
  IVesselSearchURLParams,
} from '@packages/types';
import { EFetchMethods } from '@packages/enum';
import { useVesselSearchStore } from '../../stores/vesselSearchStore';
import { globalfishingwatch } from '../fixtures/url';

/**
 * The Vessel tab's analogue of configUtils.ts's buildConfig() -- builds the
 * IVesselConfigJSON sent to POST /v1/vessels/search. `a_UrlParams` lets a
 * caller reuse a scroll session's frozen params (VesselTab.tsx's Next
 * button, with `since` merged in) instead of the live search form; omitted,
 * it reads the current vesselSearchStore state.
 */
export const buildVesselSearchConfig = (
  a_UrlParams?: IVesselSearchURLParams,
): IVesselConfigJSON => ({
  url: globalfishingwatch.url.vessels.endpoints.filteredByQuery,
  method: EFetchMethods.get,
  url_params:
    a_UrlParams ?? useVesselSearchStore.getState().getVesselSearchParams(),
});

/**
 * Same idea as buildVesselSearchConfig(), for POST /v1/vessels (list by
 * IDs) instead -- the Detail panel's on-demand vessel identity enrichment
 * (useVesselIdentity.ts). No store to default from here: a caller always
 * has a specific id list in hand (see buildVesselIdentityRequestParams()
 * in vesselUtils.ts), so `a_UrlParams` is required, not optional.
 */
export const buildVesselListConfig = (
  a_UrlParams: IVesselListURLParams,
): IVesselListConfigJSON => ({
  url: globalfishingwatch.url.vessels.endpoints.filteredByIds,
  method: EFetchMethods.get,
  url_params: a_UrlParams,
});
