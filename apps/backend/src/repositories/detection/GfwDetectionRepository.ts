import { I4wingsAPIResponse, IConfigJSON } from '@packages/types';
import { detectionGFW } from '../../pipeline/ingest/detections';
import { IDetectionRepository } from '../../helpers/types/serviceTypes';

/**
 * Detection repository backed by the Global Fishing Watch 4Wings report API.
 * All GFW/HTTP specifics live behind {@link detectionGFW}; the repository just
 * adapts them to the generic {@link IDetectionRepository} verb.
 */
export class GfwDetectionRepository implements IDetectionRepository<I4wingsAPIResponse> {
  fetch(a_Config: IConfigJSON): Promise<I4wingsAPIResponse> {
    return detectionGFW<I4wingsAPIResponse>(a_Config);
  }
}
