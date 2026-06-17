import { IDropdownOption } from "@/components/common/inputs/DropdownInput"
import { EGearType, ECountryFlag, ENeuralVesselType, ESpeedRange, EVessleType, EMatchFilter, TMatchFilter } from "@packages/enum"

export const flags_options: IDropdownOption<ECountryFlag>[] = Object.entries(ECountryFlag).map(([k,v])=> ({value: v, label: k}))

export const gear_types_options: IDropdownOption<EGearType>[] = Object.entries(EGearType).map(([k,v])=> ({value: v, label: k}))

export const vessel_types_options: IDropdownOption<EVessleType>[] = Object.entries(EVessleType).map(([k,v])=> ({value: v, label: k}))

export const neural_vessel_type_options: IDropdownOption<ENeuralVesselType>[] = Object.values(ENeuralVesselType).map((s)=> ({value: s, label: s}))

export const speed_options: IDropdownOption<ESpeedRange>[] = Object.values(ESpeedRange).map((s)=> ({value: s, label: s}))

export const minimumDistanceFromPorts_options = Array.from({ length: 6 }, (_, i) => ({
  value: i.toString(),
  label: i.toString(),
}));

export const dataset_version_options: IDropdownOption<`v${number}.${number}`>[] = [{label: "v2.0 - DEPRECATED", value: "v2.0"},{label: "v3.0", value: "v3.0"}]

export const matched_options: IDropdownOption<TMatchFilter>[] = Object.values(EMatchFilter).map((s)=> ({value: s, label: s}))
