import EEZs from '../../../data/context/EEZ.json';
import { EContextLayerDatasets } from '@packages/enum';
import { FeatureCollection, IContextLayer, IContextLayerEnrichment, IMultiPolygonGeometry } from '@packages/types';
import { TGlobalEvent } from '@packages/types';
import { IEEZPolygonProperties, ILandPolygonProperties } from '../../helpers/types/validationTypes';
import { point } from '@turf/helpers';
import { booleanPointInPolygon, bbox } from "@turf/turf";
import { log } from '../../helpers/utils/backendUtils';

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

export const getEEZContext = (
  a_EEZPolygons: FeatureCollection<
    IMultiPolygonGeometry,
    IEEZPolygonProperties
  >,
  a_Lon: number,
  a_Lat: number,
): IContextLayer => {
  const pt = point([a_Lon, a_Lat]);

  let EEZs: IContextLayerEnrichment[] = []

  for (const feature of a_EEZPolygons.features) {
    const [minX, minY, maxX, maxY] = bbox(feature);

    if (
      a_Lon >= minX &&
      a_Lon <= maxX &&
      a_Lat >= minY &&
      a_Lat <= maxY
    ) {
      if (booleanPointInPolygon(pt, feature)) {
        EEZs.push({
          id: String(feature.properties.MRGID),
          label: feature.properties.GEONAME,
        });
      }
    }
  }

  const eez_context_layer: IContextLayer = {
    dataset: EContextLayerDatasets.marineregions,
    version: "v12",
    enrichments: EEZs
  }

  return eez_context_layer
};
