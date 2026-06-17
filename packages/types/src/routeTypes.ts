import { ESystemRoutes, EAuthRoutes, EReasonCodes, E4wingsDatasets, TMatchFilter, ECountryFlag, ESpeedRange, EGearType, EVessleType, ENeuralVesselType } from "@packages/enum";
import {
  I4wingsReportGetURLParams,
  I4wingsReportPostURLParams,
  TDatasetVersion,
} from "./gfwTypes";
import { IConfigJSON } from "./eventTypes";
export type TEndpoints = ESystemRoutes | EAuthRoutes;
export type TRepositoryValue = any;

export interface IFilteringParams {
  triage_score_min?: number;
  triage_score_max?: number;
  uncertainty_score_min?: number;
  uncertainty_score_max?: number;
  distance_to_coast_km_min?: number;
  distance_to_coast_km_max?: number;
  reason_codes_include?: EReasonCodes[];
  reason_codes_exclude?: EReasonCodes[];
  is_inside_eez?: boolean;
  is_inside_mpa?: boolean;
  bathymetry_min?: number;
  bathymetry_max?: number;
  event_id?: string
}

export interface IFilteringParamsUI {
  datasets: Record<E4wingsDatasets, {active: boolean, version: TDatasetVersion}>,
  vessel_id: string;
  matchingStatus: TMatchFilter;
  flags: ECountryFlag[];
  speeds: ESpeedRange[];
  gearTypes: EGearType[],
  vesselTypes: EVessleType[]
  neuralVesselType: ENeuralVesselType | "",
  minimumDistanceFromPorts: string
}

export type TBodyParams = Omit<IConfigJSON, "url_params">;

export type TURLParams = I4wingsReportGetURLParams | I4wingsReportPostURLParams;
