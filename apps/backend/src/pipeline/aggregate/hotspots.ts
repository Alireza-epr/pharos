import { latLngToCell, cellToBoundary } from 'h3-js';
import { IConfigJSON, IEventSchema, IHotspot } from '@packages/types';
import { IFeature, IPolygonGeometry } from '@packages/types';
import { getDate, getDateBucket } from '../../helpers/utils/backendUtils';
import { EHotspotTimeBins } from '@packages/enum';

export const generateHotspots = (
  a_Config: IConfigJSON,
  a_Events: IEventSchema[],
) => {
  const h3Indexes = new Map<string, IEventSchema[]>();

  for (const event of a_Events) {
    const h3Index = getHotspotCellId(event.lat, event.lon, a_Config.hotspot.resolution);
    const timeBucket = a_Config.hotspot.timeBin
    if(timeBucket !== EHotspotTimeBins.DAILY && timeBucket !== EHotspotTimeBins.HOURLY){
      throw new Error("[generateHotspots] hotspotTimeBin must be DAILY or HOURLY")
    }
    const key = `${h3Index}_${getDateBucket(event.timestamp_utc, timeBucket)}`;
    if (!h3Indexes.has(key)) {
      h3Indexes.set(key, []);
    }
    h3Indexes.get(key)!.push(event);
  }

  let hotspots: IHotspot[] = Array.from(h3Indexes).map(([key, events]) => {
    const cell_id = key.split('_')[0]!;
    const time_bin = key.split('_')[1]!;
    const count_total = events.length;
    let count_unmatched = 0;
    let count_high_score_unmatched = 0;
    let sumScore = 0;
    let sumUncertainty = 0;
    let scoreCount = 0;
    let uncertaintyCount = 0;
    let nearCoastCount = 0;
    let recurrence_count = 0;
    let time_bins_total = 0;
    let time_bins_with_unmatched = 0;

    for (const event of events) {
      if (!event.matched_flag) {
        count_unmatched++;
      }

      if (
        !event.matched_flag &&
        event.scoring.triage_score !== null &&
        event.scoring.triage_score >
          a_Config.threshold.medium_triage_score_threshold
      ) {
        count_high_score_unmatched++;
      }

      if (event.scoring.triage_score !== null) {
        scoreCount++;
        sumScore += event.scoring.triage_score;
      }

      if (event.scoring.uncertainty_score !== null) {
        uncertaintyCount++;
        sumUncertainty += event.scoring.uncertainty_score;
      }

      if (
        event.distance_to_coast_km !== null &&
        event.distance_to_coast_km <= a_Config.threshold.near_coast_threshold
      ) {
        nearCoastCount++;
      }
    }

    return {
      cell_id,
      time_bin,
      count_total,
      count_unmatched,
      count_high_score_unmatched,
      mean_score:
        scoreCount > 0 ? parseFloat((sumScore / scoreCount).toFixed(2)) : null,
      mean_uncertainty:
        uncertaintyCount > 0
          ? parseFloat((sumUncertainty / uncertaintyCount).toFixed(2))
          : null,
      pct_near_coast: parseFloat(
        ((nearCoastCount / events.length) * 100).toFixed(2),
      ),
      recurrence_count,
      time_bins_total,
      time_bins_with_unmatched,
    };
  });
  const groupedHotspots = new Map<string, IHotspot[]>();
  for (const hotspot of hotspots) {
    const key = hotspot.cell_id;
    if (!groupedHotspots.has(key)) {
      groupedHotspots.set(key, []);
    }
    groupedHotspots.get(key)!.push(hotspot);
  }

  const recurrenceMap = new Map<
    string,
    { recurrence_count: number; time_bins_total: number; time_bins_with_unmatched: number }
  >();
  for (const [cell_id, hs] of groupedHotspots) {
    recurrenceMap.set(cell_id, {
      recurrence_count: hs
        .map((h) => h.count_unmatched)
        .reduce((a, b) => a + b, 0),
      time_bins_total: hs.length,
      time_bins_with_unmatched: hs.filter((h) => h.count_unmatched !== 0).length,
    });
  }

  hotspots = hotspots.map((h) => {
    const rh = recurrenceMap.get(h.cell_id);
    if (rh) {
      return {
        ...h,
        recurrence_count: rh.recurrence_count,
        time_bins_total: rh.time_bins_total,
        time_bins_with_unmatched: rh.time_bins_with_unmatched,
      };
    }
    return h;
  });

  return hotspots;
};

export const getMeanScore = (a_Events: IEventSchema[]) => {
  const validTriage = a_Events
    .map((e) => e.scoring.triage_score)
    .filter((s) => s !== null);
  const sumTriage = validTriage.reduce((a, b) => a + b);
  const mean_score = parseFloat((sumTriage / validTriage.length).toFixed(2));

  const validUncertainty = a_Events
    .map((e) => e.scoring.uncertainty_score)
    .filter((s) => s !== null);
  const sumUncertainty = validUncertainty.reduce((a, b) => a + b);
  const mean_uncertainty = parseFloat(
    (sumUncertainty / validUncertainty.length).toFixed(2),
  );

  return {
    mean_score,
    mean_uncertainty,
  };
};

export const featureFromHotspot = (
  a_Hotspots: IHotspot[],
): IFeature<IPolygonGeometry, IHotspot>[] => {
  return a_Hotspots.map((hotspot) => {
    const coords = cellToBoundary(hotspot.cell_id, true);
    coords.push(coords[0]!);
    return {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [coords],
      },
      properties: {
        ...hotspot,
      },
    };
  });
};

export const getHotspotCellId = (
  a_Lat: number,
  a_Lon: number,
  a_Resolution: number,
) => {
  return latLngToCell(a_Lat, a_Lon, a_Resolution);
};
