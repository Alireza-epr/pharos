import { latLngToCell, cellToBoundary } from 'h3-js';
import {
  IConfigJSON,
  IEventHotspot,
  IEventSchema,
  IHotspot,
} from '@packages/types';
import { IFeature, IPolygonGeometry } from '@packages/types';
import { getDate, getDateBucket } from '../../helpers/utils/backendUtils';
import {
  EGeoJSONGeometryType,
  EHotspotStrength,
  EHotspotTimeBins,
} from '@packages/enum';

const hotspotsMap = new Map<string, string[]>();

export const generateHotspots = (
  a_Config: IConfigJSON,
  a_Events: IEventSchema[],
) => {
  const h3Indexes = new Map<string, IEventSchema[]>();
  const timeBucket = a_Config.hotspot.timeBin;
  if (
    timeBucket !== EHotspotTimeBins.DAILY &&
    timeBucket !== EHotspotTimeBins.HOURLY
  ) {
    throw new Error(
      '[generateHotspots] hotspotTimeBin must be DAILY or HOURLY',
    );
  }
  hotspotsMap.clear();
  for (const event of a_Events) {
    const h3Index = getHotspotCellId(
      event.lat,
      event.lon,
      a_Config.hotspot.resolution,
    );
    const event_ids = hotspotsMap.get(h3Index) ?? [];
    hotspotsMap.set(h3Index, [...event_ids, event.event_id]);
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
      if (event.matched_flag === false) {
        count_unmatched++;
      }

      if (
        event.matched_flag === false &&
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
    {
      recurrence_count: number;
      time_bins_total: number;
      time_bins_with_unmatched: number;
    }
  >();
  for (const [cell_id, hs] of groupedHotspots) {
    recurrenceMap.set(cell_id, {
      recurrence_count: hs
        .map((h) => h.count_unmatched)
        .reduce((a, b) => a + b, 0),
      time_bins_total: hs.length,
      time_bins_with_unmatched: hs.filter((h) => h.count_unmatched !== 0)
        .length,
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

export const featureFromHotspot = (
  a_Hotspots: IHotspot[],
): IFeature<IPolygonGeometry, IHotspot>[] => {
  return a_Hotspots.map((hotspot) => {
    const coords = cellToBoundary(hotspot.cell_id, true);
    coords.push(coords[0]!);
    return {
      type: 'Feature',
      geometry: {
        type: EGeoJSONGeometryType.Polygon,
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

export const enrichEventsWithHotspots = (
  a_Events: IEventSchema[],
  a_Hotspots: IHotspot[],
): IEventSchema[] => {
  let enrichedEvents: IEventSchema[] = [];

  for (const event of a_Events) {
    const enrichedHotspot = enrichEventHotspot(event, a_Hotspots);

    enrichedEvents.push({
      ...event,
      hotspot: enrichedHotspot,
    });
  }

  return enrichedEvents;
};

export const enrichEventHotspot = (
  a_Event: IEventSchema,
  a_Hotspots: IHotspot[],
): IEventHotspot | null => {
  const cell_id = Array.from(hotspotsMap.entries()).find(
    ([h3Index, event_ids]) => event_ids.includes(a_Event.event_id),
  )?.[0];

  if (!cell_id) return null;

  const hotspot = a_Hotspots.find((ht) => ht.cell_id === cell_id);

  if (!hotspot) return null;

  return {
    cell_id,
    signals: {
      recurrence_count: hotspot.recurrence_count,
      time_bins_with_unmatched: hotspot.time_bins_with_unmatched,
      hotspot_strength: generateHotspotStrength(hotspot),
    },
  };
};

export const generateHotspotStrength = (
  a_Hotspot: IHotspot,
): EHotspotStrength => {
  const WEIGHTS = {
    medium_recurrence_threshold: 7,
    high_recurrence_threshold: 14,

    medium_timebin_threshold: 3,
    high_timebin_threshold: 5,

    unmatched_density_threshold: 3,

    high_uncertainty_threshold: 0.7,

    medium_strength_threshold: 0.45,
    high_strength_threshold: 0.8,

    high_eligibility_recurrence_threshold: 8,
    high_eligibility_timebin_threshold: 3,
  };

  let score = 0;

  /**
   * Spatial recurrence
   */
  if (a_Hotspot.recurrence_count >= WEIGHTS.medium_recurrence_threshold) {
    score += 0.25;
  }

  if (a_Hotspot.recurrence_count >= WEIGHTS.high_recurrence_threshold) {
    score += 0.25;
  }

  /**
   * Temporal persistence
   */
  if (a_Hotspot.time_bins_with_unmatched >= WEIGHTS.medium_timebin_threshold) {
    score += 0.2;
  }

  if (a_Hotspot.time_bins_with_unmatched >= WEIGHTS.high_timebin_threshold) {
    score += 0.2;
  }

  /**
   * Local unmatched density
   */
  if (a_Hotspot.count_unmatched >= WEIGHTS.unmatched_density_threshold) {
    score += 0.1;
  }

  /**
   * Penalize uncertain hotspots
   */
  if (
    a_Hotspot.mean_uncertainty &&
    a_Hotspot.mean_uncertainty >= WEIGHTS.high_uncertainty_threshold
  ) {
    score -= 0.25;
  }

  /**
   * Clamp score
   */
  score = Math.max(0, Math.min(1, score));

  /**
   * Strong hotspot gate:
   * high hotspot requires both:
   * - strong recurrence
   * - persistence across multiple time bins
   */
  const eligibleForHigh =
    a_Hotspot.recurrence_count >=
      WEIGHTS.high_eligibility_recurrence_threshold &&
    a_Hotspot.time_bins_with_unmatched >=
      WEIGHTS.high_eligibility_timebin_threshold;

  /**
   * Final classification
   */
  if (eligibleForHigh && score >= WEIGHTS.high_strength_threshold) {
    return EHotspotStrength.high;
  }

  if (score >= WEIGHTS.medium_strength_threshold) {
    return EHotspotStrength.medium;
  }

  return EHotspotStrength.low;
};
