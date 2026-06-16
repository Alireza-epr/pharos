
import Section from '../common/section/Section';
import SectionItem from '../common/section/SectionItem';
import SectionInputGroup from '../common/section/SectionInputGroup';
import NumberInput from '../common/inputs/NumberInput';
import CheckboxInput from '../common/inputs/CheckboxInput';
import ChipGroupInput from '../common/inputs/ChipGroupInput';
import { useTranslator } from '../../hooks/translator';
import { useFilterStore } from '../../stores/filterStore';
import { EInclusionMode, EReasonCodesStatic, TInclusionMode } from '@packages/enum';
import { IFilterStoreStates } from '../../helpers/types/storeTypes';


export interface IFilterProps {}

const reasonCodes = Object.values(EReasonCodesStatic)

const Filter = () => {
    const filters = useFilterStore(s => s.filters)
    const setFilters = useFilterStore(s => s.setFilters)

    const filtersUI = useFilterStore(s => s.filtersUI)
    const setFiltersUI = useFilterStore(s => s.setFiltersUI)

    const { t } = useTranslator()

    const updateFilter = (patch: Partial<IFilterStoreStates['filters']>) => {
        setFilters(prev => ({ ...prev, ...patch }))
    }

    const updateFilterUI = (patch: Partial<IFilterStoreStates['filtersUI']>) => {
        setFiltersUI(prev => ({ ...prev, ...patch }))
    }

    const toggleReasonCode = (a_Mode: TInclusionMode, a_Code: EReasonCodesStatic) => {
        setFilters(prev => {
            const include = (prev.reason_codes_include ?? []) as EReasonCodesStatic[]
            const exclude = (prev.reason_codes_exclude ?? []) as EReasonCodesStatic[]
            if (a_Mode === EInclusionMode.include) {
                const isActive = include.includes(a_Code)
                return {
                    ...prev,
                    reason_codes_include: isActive ? include.filter(c => c !== a_Code) : [...include, a_Code],
                    reason_codes_exclude: exclude.filter(c => c !== a_Code),
                }
            }
            const isActive = exclude.includes(a_Code)
            return {
                ...prev,
                reason_codes_exclude: isActive ? exclude.filter(c => c !== a_Code) : [...exclude, a_Code],
                reason_codes_include: include.filter(c => c !== a_Code),
            }
        })
    }

    return (
        <Section title={t('sidebar.titles.filter')} collapsible={false}>    

            <SectionItem title={t('sidebar.titles.matchingStatus')} collapsible={false}>
                <CheckboxInput
                    label={t('general.label.unmatchedOnly')}
                    checked={filtersUI.unmatched_only}
                    onChange={(v) => updateFilterUI({ unmatched_only: v })}
                />
            </SectionItem>

            <SectionItem title={t('sidebar.label.triageScore')} collapsible={false}>
                <SectionInputGroup direction="row">
                    <NumberInput label={t('general.label.min')} value={filters.triage_score_min ?? 0} min={0} max={1} step={0.01} onChange={(v) => updateFilter({ triage_score_min: v })} />
                    <NumberInput label={t('general.label.max')} value={filters.triage_score_max ?? 1} min={0} max={1} step={0.01} onChange={(v) => updateFilter({ triage_score_max: v })} />
                </SectionInputGroup>
            </SectionItem>

            <SectionItem title={t('sidebar.label.uncertaintyScore')} collapsible={false}>
                <SectionInputGroup direction="row">
                    <NumberInput label={t('general.label.min')} value={filters.uncertainty_score_min ?? 0} min={0} max={1} step={0.01} onChange={(v) => updateFilter({ uncertainty_score_min: v })} />
                    <NumberInput label={t('general.label.max')} value={filters.uncertainty_score_max ?? 1} min={0} max={1} step={0.01} onChange={(v) => updateFilter({ uncertainty_score_max: v })} />
                </SectionInputGroup>
            </SectionItem>

            <SectionItem title={t('sidebar.label.distanceToCoast')} collapsible={false}>
                <SectionInputGroup direction="row">
                    <NumberInput label={t('general.label.min')} value={filters.distance_to_coast_km_min ?? 0} min={0} onChange={(v) => updateFilter({ distance_to_coast_km_min: v })} />
                    <NumberInput label={t('general.label.max')} value={filters.distance_to_coast_km_max ?? 100} min={0} onChange={(v) => updateFilter({ distance_to_coast_km_max: v })} />
                </SectionInputGroup>
            </SectionItem>

            <SectionItem title={t('sidebar.label.bathymetry')} collapsible={false}>
                <SectionInputGroup direction="row">
                    <NumberInput label={t('general.label.min')} value={filters.bathymetry_min ?? 0} onChange={(v) => updateFilter({ bathymetry_min: v })} />
                    <NumberInput label={t('general.label.max')} value={filters.bathymetry_max ?? 0} onChange={(v) => updateFilter({ bathymetry_max: v })} />
                </SectionInputGroup>
            </SectionItem>

            <SectionItem title={t('sidebar.label.contextZone')} collapsible={false}>
                <SectionInputGroup direction="column">
                    <CheckboxInput
                        label={t('sidebar.label.insideEezOnly')}
                        checked={filters.is_inside_eez ?? false}
                        onChange={(v) => updateFilter({ is_inside_eez: v })}
                    />
                    <CheckboxInput
                        label={t('sidebar.label.insideMpaOnly')}
                        checked={filters.is_inside_mpa ?? false}
                        onChange={(v) => updateFilter({ is_inside_mpa: v })}
                    />
                </SectionInputGroup>
            </SectionItem>

            <SectionItem title={t('sidebar.label.reasonCodesInclude')} collapsible={false}>
                <ChipGroupInput
                    values={reasonCodes}
                    active={(filters.reason_codes_include ?? []) as EReasonCodesStatic[]}
                    onToggle={(code) => toggleReasonCode(EInclusionMode.include, code)}
                    variant={EInclusionMode.include}
                />
            </SectionItem>

            <SectionItem title={t('sidebar.label.reasonCodesExclude')} collapsible={false}>
                <ChipGroupInput
                    values={reasonCodes}
                    active={(filters.reason_codes_exclude ?? []) as EReasonCodesStatic[]}
                    onToggle={(code) => toggleReasonCode(EInclusionMode.exclude, code)}
                    variant={EInclusionMode.exclude}
                />
            </SectionItem>

        </Section>
    )
}

export default Filter
