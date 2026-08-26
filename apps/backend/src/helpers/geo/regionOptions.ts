import { bbox, centroid } from '@turf/turf';
import { EContextLayers } from '@packages/enum';
import {
  IGeometry,
  IPointGeometry,
  TRegionOption,
  TRegionOptionFeature,
} from '@packages/types';
import { readEEZPolygons, readMPAPolygons } from '../utils/datasetUtils';
import { log } from '../utils/backendUtils';
import { ELogType } from '../types/generalTypes';

let eezOptionsCache: TRegionOptionFeature | null = null;
let mpaOptionsCache: TRegionOptionFeature | null = null;

const toRegionOption = (
  a_Geometry: IGeometry,
  a_Id: string,
  a_Title: string,
): TRegionOption | null => {
  try {
    const feature = {
      type: 'Feature' as const,
      geometry: a_Geometry,
      properties: {},
    };
    return {
      type: 'Feature',
      properties: { id: a_Id, title: a_Title },
      bbox: bbox(feature as any) as [number, number, number, number],
      geometry: centroid(feature as any).geometry as IPointGeometry,
    };
  } catch {
    return null;
  }
};

const buildEEZOptions = (): TRegionOptionFeature => {
  const all = readEEZPolygons().features;
  const features = all
    .map((f) =>
      toRegionOption(
        f.geometry,
        String(f.properties.MRGID),
        f.properties.GEONAME,
      ),
    )
    .filter((o): o is TRegionOption => o !== null);
  if (features.length !== all.length) {
    log(
      `[getRegionOptions] Skipped ${all.length - features.length}/${all.length} EEZ features with no usable geometry`,
      ELogType.warn,
    );
  }
  return { type: 'FeatureCollection', features };
};

const buildMPAOptions = (): TRegionOptionFeature => {
  const all = readMPAPolygons().features;
  const features = all
    .map((f) => {
      const id = f.properties.SITE_PID ?? f.properties.SITE_ID;
      return toRegionOption(f.geometry, String(id), f.properties.NAME_ENG);
    })
    .filter((o): o is TRegionOption => o !== null);
  if (features.length !== all.length) {
    log(
      `[getRegionOptions] Skipped ${all.length - features.length}/${all.length} MPA features with no usable geometry`,
      ELogType.warn,
    );
  }
  return { type: 'FeatureCollection', features };
};

/** The full FeatureCollection of options for a region dataset (EEZ or MPA), memoized. */
export const getRegionOptions = (
  a_Dataset: EContextLayers,
): TRegionOptionFeature | undefined => {
  if (a_Dataset === EContextLayers.eez) {
    if (!eezOptionsCache) eezOptionsCache = buildEEZOptions();
    return eezOptionsCache;
  }
  if (a_Dataset === EContextLayers.mpa) {
    if (!mpaOptionsCache) mpaOptionsCache = buildMPAOptions();
    return mpaOptionsCache;
  }
  return undefined;
};
