import {
  EVENT_MISSINGNESS_KEYS,
  IEventSchema,
  IMatchingStats,
  IStats,
  TGeoJSONEventMissingness,
} from '@packages/types';
import { EGeoCoordinate } from '@packages/enum';
import { isValidCoordinate } from '../normalize/validation';

export const getEventMissingness = (
  a_Events: IEventSchema[],
): Record<TGeoJSONEventMissingness, string> => {
  const total = a_Events.length;

  const keys = Object.values(EVENT_MISSINGNESS_KEYS);

  const counts: Record<TGeoJSONEventMissingness, number> = Object.fromEntries(
    keys.map((k) => [k, 0]),
  ) as Record<TGeoJSONEventMissingness, number>;

  for (const event of a_Events) {
    for (const key of keys) {
      const value = event[key];

      if (value === null || value === undefined) {
        counts[key]++;
      }
    }
  }

  return Object.fromEntries(
    keys.map((key) => [key, `${((counts[key] / total) * 100).toFixed(2)}%`]),
  ) as Record<TGeoJSONEventMissingness, string>;
};

export const getGeoMin = (
  a_GeoCoordinate: EGeoCoordinate,
  a_Events: IEventSchema[],
): number => {
  let min = Infinity;

  for (const event of a_Events) {
    if (!isValidCoordinate(event.lat, event.lon)) continue;

    const value =
      a_GeoCoordinate === EGeoCoordinate.latitude ? event.lat : event.lon;

    if (value < min) {
      min = value;
    }
  }

  return min;
};

export const getGeoMax = (
  a_GeoCoordinate: EGeoCoordinate,
  a_Events: IEventSchema[],
): number => {
  let max = -Infinity;

  for (const event of a_Events) {
    if (!isValidCoordinate(event.lat, event.lon)) continue;
    const value =
      a_GeoCoordinate === EGeoCoordinate.latitude ? event.lat : event.lon;

    if (value > max) {
      max = value;
    }
  }

  return max;
};

export const getTimeRange = (a_Events: IEventSchema[]) => {
  let min = Infinity;
  let max = -Infinity;

  for (const event of a_Events) {
    const t = Date.parse(event.timestamp_utc);

    if (t < min) {
      min = t;
    }

    if (t > max) {
      max = t;
    }
  }

  return {
    start: new Date(min).toISOString(),
    end: new Date(max).toISOString(),
  };
};

export const getMatchingStats = (a_Events: IEventSchema[]): IMatchingStats => {
  let matched = 0;
  let unmatched = 0;

  for (const event of a_Events) {
    if (event.matched_flag) {
      ++matched;
    } else if (event.matched_flag === false) {
      ++unmatched;
    }
  }

  return {
    matched,
    unmatched,
  };
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

export const getStats = (a_Events: IEventSchema[]): IStats => {
  if (a_Events.length === 0) {
    return {
      count_total: a_Events.length,
      matching_stats: {
        matched: 0,
        unmatched: 0,
      },
      missingness: {
        confidence_proxy: '0.00%',
        distance_to_coast_km: '0.00%',
        event_id: '0.00%',
        lat: '0.00%',
        lon: '0.00%',
        timestamp_utc: '0.00%',
      },
      geo_sanity: {
        latitude: {
          max: 0,
          min: 0,
        },
        longitude: {
          max: 0,
          min: 0,
        },
      },
      time_range: {
        start: 'N/A',
        end: 'N/A',
      },
      mean_score: 0,
      mean_uncertainty: 0,
    };
  }
  const { mean_score, mean_uncertainty } = getMeanScore(a_Events);
  return {
    count_total: a_Events.length,
    matching_stats: getMatchingStats(a_Events),
    missingness: getEventMissingness(a_Events),
    geo_sanity: {
      latitude: {
        min: getGeoMin(EGeoCoordinate.latitude, a_Events),
        max: getGeoMax(EGeoCoordinate.latitude, a_Events),
      },
      longitude: {
        min: getGeoMin(EGeoCoordinate.longitude, a_Events),
        max: getGeoMax(EGeoCoordinate.longitude, a_Events),
      },
    },
    time_range: getTimeRange(a_Events),
    mean_score,
    mean_uncertainty,
  };
};
