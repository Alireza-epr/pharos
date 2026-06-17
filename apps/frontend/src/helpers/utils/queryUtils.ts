import {
  ECountryFlag,
  EGearType,
  EMatchFilter,
  ENeuralVesselType,
  ESpeedRange,
  EVessleType,
  TMatchFilter,
} from '@packages/enum';

export const getFlags = (a_Flags: ECountryFlag[]) => {
  if (a_Flags.length > 0) {
    return `flag in (${a_Flags.map((s) => `'${s}'`).join(',')})`;
  }
  return '';
};

export const getMatched = (a_MatchingStatus: TMatchFilter) => {
  if (a_MatchingStatus == EMatchFilter.matched) {
    return `matched in ('true')`;
  }
  if (a_MatchingStatus == EMatchFilter.unmatched) {
    return `matched in ('false')`;
  }
  return '';
};

export const getVesselTypes = (a_VesselTypes: EVessleType[]) => {
  if (a_VesselTypes.length > 0) {
    return `vessel_type in (${a_VesselTypes.map((s) => `'${s}'`).join(',')})`;
  }
  return '';
};

export const getGearTypes = (a_GearTypes: EGearType[]) => {
  if (a_GearTypes.length > 0) {
    return `geartype in (${a_GearTypes.map((s) => `'${s}'`).join(',')})`;
  }
  return '';
};

export const getSpeeds = (a_Speed: ESpeedRange[]) => {
  if (a_Speed.length > 0) {
    return `speed in (${a_Speed.map((s) => `'${s}'`).join(',')})`;
  }
  return '';
};

export const getNeuralVesselType = (a_NVT: ENeuralVesselType | '') => {
  if (a_NVT.length > 0) {
    return `neural_vessel_type in ('${a_NVT}')`;
  }
  return '';
};

export const getVesselId = (a_VesselId: string) => {
  if (a_VesselId.length > 0) {
    return `vessel_id in ('${a_VesselId}')`;
  }
  return '';
};

export const getMinimumDistanceFromPorts = (a_Value: string) => {
  if (a_Value.length > 0) {
    return `distance_from_port_km in ('${a_Value}')`;
  }
  return '';
};
