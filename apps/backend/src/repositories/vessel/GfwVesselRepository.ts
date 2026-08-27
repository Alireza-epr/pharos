import {
  IVesselConfigJSON,
  IVesselListAPIResponse,
  IVesselListConfigJSON,
  IVesselSearchAPIResponse,
} from '@packages/types';
import { listVesselsGFW, searchVesselsGFW } from '../../pipeline/ingest/vessels';
import { IVesselRepository } from '../../helpers/types/serviceTypes';

/**
 * Vessel repository backed by the Global Fishing Watch Vessels API. All
 * GFW/HTTP specifics live behind {@link searchVesselsGFW}/{@link listVesselsGFW};
 * the repository just adapts them to the generic {@link IVesselRepository} verbs.
 */
export class GfwVesselRepository implements IVesselRepository {
  search(a_Config: IVesselConfigJSON): Promise<IVesselSearchAPIResponse> {
    return searchVesselsGFW(a_Config);
  }

  list(a_Config: IVesselListConfigJSON): Promise<IVesselListAPIResponse> {
    return listVesselsGFW(a_Config);
  }
}
