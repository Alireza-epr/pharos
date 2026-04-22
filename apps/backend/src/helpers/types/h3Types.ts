export interface IHotspot {
  cell_id: string;
  time_bin: string;
  count_total: number;
  count_unmatched: number;
  count_high_score_unmatched: number;
  mean_score: number | null;
  mean_uncertainty: number | null;
  pct_near_coast: number;
  recurrence_count: number;
  days: number;
  days_with_unmatched: number;
}
