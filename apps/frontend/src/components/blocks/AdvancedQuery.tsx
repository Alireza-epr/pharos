
import Section from '../common/section/Section';
import SectionItem from '../common/section/SectionItem';
import DropdownInput from '../common/inputs/DropdownInput';
import CheckboxInput from '../common/inputs/CheckboxInput';
import { useTranslator } from '../../hooks/translator';
import { useAdvancedQueryStore } from '../../stores/advancedQueryStore';
import { formatOptions, groupByOptions, spatialResolutionOptions, temporalResolutionOptions } from '../../helpers/fixtures/query';

export interface IAdvancedQueryProps { }


const AdvancedQuery = () => {
    const spatialResolution = useAdvancedQueryStore(s => s.spatialResolution)
    const setSpatialResolution = useAdvancedQueryStore(s => s.setSpatialResolution)
    const format = useAdvancedQueryStore(s => s.format)
    const setFormat = useAdvancedQueryStore(s => s.setFormat)
    const groupBy = useAdvancedQueryStore(s => s.groupBy)
    const setGroupBy = useAdvancedQueryStore(s => s.setGroupBy)
    const temporalResolution = useAdvancedQueryStore(s => s.temporalResolution)
    const setTemporalResolution = useAdvancedQueryStore(s => s.setTemporalResolution)
    const spatialAggregation = useAdvancedQueryStore(s => s.spatialAggregation)
    const setSpatialAggregation = useAdvancedQueryStore(s => s.setSpatialAggregation)

    const { t } = useTranslator()


    return (
        <Section title={t('sidebar.titles.advancedQuery')} collapsible={false}>

            <SectionItem title={t('sidebar.label.temporalResolution')} collapsible={false}>
                <DropdownInput
                    value={temporalResolution}
                    options={temporalResolutionOptions}
                    onChange={setTemporalResolution}
                />
            </SectionItem>

            <SectionItem title={t('sidebar.label.spatialResolution')} collapsible={false}>
                <DropdownInput
                    value={spatialResolution}
                    options={spatialResolutionOptions}
                    onChange={setSpatialResolution}
                    placeholder={t('sidebar.placeholder.none')}
                />
            </SectionItem>

            <SectionItem title={t('sidebar.label.spatialAggregation')} collapsible={false}>
                <CheckboxInput
                    label={t('sidebar.label.spatialAggregation')}
                    checked={spatialAggregation}
                    onChange={setSpatialAggregation}
                />
            </SectionItem>

            <SectionItem title={t('sidebar.label.format')} collapsible={false}>
                <DropdownInput
                    value={format}
                    options={formatOptions}
                    onChange={setFormat}
                />
            </SectionItem>

            <SectionItem title={t('sidebar.label.groupBy')} collapsible={false}>
                <DropdownInput
                    value={groupBy}
                    options={groupByOptions}
                    onChange={setGroupBy}
                    placeholder={t('sidebar.placeholder.none')}
                />
            </SectionItem>
        </Section>
    )
}

export default AdvancedQuery
