import { IEventConfigJSON, IEventSearchAPIResponse } from '@packages/types';
import { searchEventsGFW } from '../../pipeline/ingest/events';
import { IEventRepository } from '../../helpers/types/serviceTypes';

/**
 * Event repository backed by the Global Fishing Watch Events API. All
 * GFW/HTTP specifics live behind {@link searchEventsGFW}; the repository
 * just adapts them to the generic {@link IEventRepository} verb.
 */
export class GfwEventRepository implements IEventRepository {
  search(a_Config: IEventConfigJSON): Promise<IEventSearchAPIResponse> {
    return searchEventsGFW(a_Config);
  }
}
