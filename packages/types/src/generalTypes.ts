import { TGeoJSONEventMissingness } from "./geoJSONTypes";

/**
 * An array of type T with exactly N elements
 * type ThreeNumbers = TFixedLengthArray<number, 3>;
 * [number, number, number]
 */
export type TFixedLengthArray<
  T,
  N extends number,
  R extends T[] = [],
> = R["length"] extends N ? R : TFixedLengthArray<T, N, [...R, T]>;

/**
 * A union of numbers from 0 up to (but not including) N
 * type Range3 = TBuildRange<3>;
 * 0 | 1 | 2
 */

export type TBuildRange<
  N extends number,
  Result extends number[] = [],
> = Result["length"] extends N
  ? Result[number]
  : TBuildRange<N, [...Result, Result["length"]]>;
export interface IStats {
  count_total: number;
  matching_stats: IMatchingStats;
  missingness: Record<TGeoJSONEventMissingness, string>;
  geo_sanity: {
    latitude: {
      min: number;
      max: number;
    };
    longitude: {
      min: number;
      max: number;
    };
  };
  time_range: {
    start: string;
    end: string;
  };
  mean_score: number;
  mean_uncertainty: number;
}

export interface IMatchingStats {
  matched: number;
  unmatched: number;
}

export type TJSONValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: TJSONValue }
  | TJSONValue[];
