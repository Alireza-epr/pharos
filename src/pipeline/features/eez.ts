import EEZs from '../../../docs/data/context/EEZ.json';
import { EContextLayerDatasets } from '../../enum/gfwEnum';
import { IContextLayer, IContextLayerEnrichment } from '../../types/eventTypes';
import { TGlobalEvent } from '../../types/gfwTypes';

export const generateEEZ = (
  a_EventEntry: TGlobalEvent | undefined,
): IContextLayer => {
  let contextLayer: IContextLayer = {
    dataset: EContextLayerDatasets.eez,
    version: 'v3',
    enrichments: [],
  };
  if (!a_EventEntry) return contextLayer;

  const eezs = a_EventEntry.regions.eez;

  if (eezs && eezs.length > 0) {
    let enrichments: IContextLayerEnrichment[] = [];
    for (const eezId of eezs) {
      const eezEntry = EEZs.find((eez) => eez.id === +eezId);
      if (eezEntry && eezEntry.label) {
        enrichments.push({
          id: String(eezId),
          label: eezEntry.label,
        });
      }
    }

    contextLayer.enrichments = enrichments;

    return contextLayer;
  } else {
    return contextLayer;
  }
};
