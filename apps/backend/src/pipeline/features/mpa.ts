import fs from 'fs';
import { EContextLayerDatasets } from '@packages/enum';
import {
  FeatureCollection,
  IContextLayer,
  IContextLayerEnrichment,
  IMultiPolygonGeometry,
} from '@packages/types';
import { TGlobalEvent } from '@packages/types';
import { IMPAPolygonProperties } from '../../helpers/types/validationTypes';
import { point } from '@turf/helpers';
import { booleanPointInPolygon, bbox } from '@turf/turf';
import { log } from '../../helpers/utils/backendUtils';
import { ELogType } from '../../helpers/types/generalTypes';
import { IMPALookupEntry } from '../../helpers/types/contextTypes';

/** MPA id -> label lookup (~1.7MB on disk). Loaded lazily on first use rather
 * than at import time, so the server boots without parsing it unless a
 * request actually needs an MPA context layer. */
let mpaLookup: IMPALookupEntry[] | null = null;

const getMPALookup = (): IMPALookupEntry[] => {
  if (mpaLookup) return mpaLookup;
  try {
    mpaLookup = JSON.parse(fs.readFileSync('data/context/MPA.json', 'utf-8'));
  } catch (e) {
    log(`[MPA] Failed to load MPA.json: ${e}`, ELogType.error);
    mpaLookup = [];
  }
  return mpaLookup ?? [];
};

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
    const MPAs = getMPALookup();
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

  let MPAs: IContextLayerEnrichment[] = [];
  for (const feature of a_MPAPolygons.features) {
    const [minX, minY, maxX, maxY] = bbox(feature);

    if (a_Lon >= minX && a_Lon <= maxX && a_Lat >= minY && a_Lat <= maxY) {
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
    version: 'v1.6',
    enrichments: MPAs,
  };
  return mpa_context_layer;
};
