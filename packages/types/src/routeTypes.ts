import { ESystemRoutes, EAuthRoutes } from "@packages/enum";
import { I4wingsReportGetURLParams, I4wingsReportPostBodyParams, IEventGetURLParams } from "./gfwTypes";
import { IConfigJSON } from "./eventTypes";
export type TEndpoints = ESystemRoutes | EAuthRoutes;
export type TRepositoryValue = any;

export interface IFilteringParams {
  triage_score_min?: number,
  triage_score_max?: number,
  uncertainty_score_min?: number,
  uncertainty_score_max?: number,
  distance_to_coast_km_min?: number,
  distance_to_coast_km_max?: number,
  reason_codes_include?: boolean,
  is_inside_eez?: boolean,
  is_inside_mpa?: boolean,
}

export type TBodyParams = Pick<IConfigJSON, "threshold" | "hotspot" | "sort">
  & I4wingsReportPostBodyParams
  & { filters: IFilteringParams };

export type TURLParams = I4wingsReportGetURLParams & IEventGetURLParams