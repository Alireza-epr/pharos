import fs from 'fs';
import { EContextLayerDatasets } from '@packages/enum';
import {
  FeatureCollection,
  IContextLayer,
  IContextLayerEnrichment,
  IMultiPolygonGeometry,
} from '@packages/types';
import { TGlobalEvent } from '@packages/types';
import {
  IEEZPolygonProperties,
  ILandPolygonProperties,
} from '../../helpers/types/validationTypes';
import { point } from '@turf/helpers';
import { booleanPointInPolygon, bbox } from '@turf/turf';
import { log } from '../../helpers/utils/backendUtils';
import { ELogType } from '../../helpers/types/generalTypes';
import { IEEZLookupEntry } from '../../helpers/types/contextTypes';

/** EEZ id -> label lookup (~56KB on disk). Loaded lazily on first use rather
 * than at import time, so the server boots without parsing it unless a
 * request actually needs an EEZ context layer. */
let eezLookup: IEEZLookupEntry[] | null = null;

const getEEZLookup = (): IEEZLookupEntry[] => {
  if (eezLookup) return eezLookup;
  try {
    eezLookup = JSON.parse(fs.readFileSync('data/context/EEZ.json', 'utf-8'));
  } catch (e) {
    log(`[EEZ] Failed to load EEZ.json: ${e}`, ELogType.error);
    eezLookup = [];
  }
  return eezLookup ?? [];
};

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
    const EEZs = getEEZLookup();
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

  let EEZs: IContextLayerEnrichment[] = [];

  for (const feature of a_EEZPolygons.features) {
    const [minX, minY, maxX, maxY] = bbox(feature);

    if (a_Lon >= minX && a_Lon <= maxX && a_Lat >= minY && a_Lat <= maxY) {
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
    version: 'v12',
    enrichments: EEZs,
  };

  return eez_context_layer;
};
