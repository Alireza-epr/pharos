import MPAs from '../../../data/context/MPA.json';
import { EContextLayerDatasets } from '@packages/enum';
import { FeatureCollection, IContextLayer, IContextLayerEnrichment, IMultiPolygonGeometry } from '@packages/types';
import { TGlobalEvent } from '@packages/types';
import { IMPAPolygonProperties } from '../../helpers/types/validationTypes';
import { point } from '@turf/helpers';
import { booleanPointInPolygon, bbox } from "@turf/turf";
import { log } from '../../helpers/utils/backendUtils';

export const generateMPA = (
  a_EventEntry: TGlobalEvent | undefined,
): IContextLayer => {
  let contextLayer: IContextLayer = {
    dataset: EContextLayerDatasets.mpa,
    version: 'v3',
    enrichments: [],
  };
  if (!a_EventEntry) return contextLayer;

  const mpas = a_EventEntry.regions.mpa;

  if (mpas && mpas.length > 0) {
    let enrichments: IContextLayerEnrichment[] = [];
    for (const mpaId of mpas) {
      const mpaEntry = MPAs.find((mpa) => mpa.id === mpaId);
      if (mpaEntry && mpaEntry.label) {
        enrichments.push({
          id: String(mpaId),
          label: mpaEntry.label,
        });
      }
    }

    contextLayer.enrichments = enrichments;

    return contextLayer;
  } else {
    return contextLayer;
  }
};

export const getMPAContext = (
  a_MPAPolygons: FeatureCollection<
    IMultiPolygonGeometry,
    IMPAPolygonProperties
  >,
  a_Lon: number,
  a_Lat: number,
): IContextLayer => {
  const pt = point([a_Lon, a_Lat]);

  let MPAs: IContextLayerEnrichment[] = []
  for (const feature of a_MPAPolygons.features) {
    const [minX, minY, maxX, maxY] = bbox(feature);

    if (
      a_Lon >= minX &&
      a_Lon <= maxX &&
      a_Lat >= minY &&
      a_Lat <= maxY
    ) {
      if (booleanPointInPolygon(pt, feature)) {
        MPAs.push({
          id: feature.properties.SITE_PID,
          label: feature.properties.NAME_ENG,
        });
      }
    }
  }

  const mpa_context_layer: IContextLayer = {
    dataset: EContextLayerDatasets.wdpa,
    version: "v1.6",
    enrichments: MPAs
  }
  return mpa_context_layer
};