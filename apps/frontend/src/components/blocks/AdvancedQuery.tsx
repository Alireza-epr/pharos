
import Section from '../common/section/Section';
import SectionItem from '../common/section/SectionItem';
import DropdownInput, { IDropdownOption } from '../common/inputs/DropdownInput';
import CheckboxInput from '../common/inputs/CheckboxInput';
import ChipGroupInput from '../common/inputs/ChipGroupInput';
import TextInput from '../common/inputs/TextInput';
import { useTranslator } from '@/hooks/translator';
import { useAdvancedQueryStore } from '@/stores/advancedQueryStore';
import { E4wingsDatasetsUI, EFormat, EGroupBy, ESpatialResolution, ETemporalResolution, T4wingsDatasetsUI } from '@packages/enum';

export interface IAdvancedQueryProps { }

const spatialResolutionOptions: IDropdownOption<ESpatialResolution>[] = Object.values(ESpatialResolution).map(v => ({ label: v, value: v }))
const formatOptions: IDropdownOption<EFormat>[] = Object.values(EFormat).map(v => ({ label: v, value: v }))
const groupByOptions: IDropdownOption<EGroupBy>[] = Object.values(EGroupBy).map(v => ({ label: v, value: v }))
const temporalResolutionOptions: IDropdownOption<ETemporalResolution>[] = Object.values(ETemporalResolution).map(v => ({ label: v, value: v }))
const datasetValues = Object.values(E4wingsDatasetsUI)

const AdvancedQuery = () => {
    const spatialResolution = useAdvancedQueryStore(s => s.spatialResolution)
    const setSpatialResolution = useAdvancedQueryStore(s => s.setSpatialResolution)
    const format = useAdvancedQueryStore(s => s.format)
    const setFormat = useAdvancedQueryStore(s => s.setFormat)
    const groupBy = useAdvancedQueryStore(s => s.groupBy)
    const setGroupBy = useAdvancedQueryStore(s => s.setGroupBy)
    const temporalResolution = useAdvancedQueryStore(s => s.temporalResolution)
    const setTemporalResolution = useAdvancedQueryStore(s => s.setTemporalResolution)
    const datasets = useAdvancedQueryStore(s => s.datasets)
    const setDatasets = useAdvancedQueryStore(s => s.setDatasets)
    const filterText = useAdvancedQueryStore(s => s.filterText)
    const setFilterText = useAdvancedQueryStore(s => s.setFilterText)
    const spatialAggregation = useAdvancedQueryStore(s => s.spatialAggregation)
    const setSpatialAggregation = useAdvancedQueryStore(s => s.setSpatialAggregation)
    const rawQuery = useAdvancedQueryStore(s => s.rawQuery)
    const setRawQuery = useAdvancedQueryStore(s => s.setRawQuery)

    const { t } = useTranslator()

    const toggleDataset = (dataset: T4wingsDatasetsUI) => {
        setDatasets(prev =>
            prev.includes(dataset)
                ? prev.filter(d => d !== dataset)
                : [...prev, dataset]
        )
    }

    return (
        <Section title={t('sidebar.titles.advancedQuery')} collapsible={false}>

            <SectionItem title={t('sidebar.label.datasets')} collapsible={false}>
                <ChipGroupInput
                    values={datasetValues}
                    active={datasets}
                    onToggle={toggleDataset}
                />
            </SectionItem>

            <SectionItem title={t('sidebar.label.temporalResolution')} collapsible={false}>
                <DropdownInput
                    value={temporalResolution}
                    options={temporalResolutionOptions}
                    onChange={setTemporalResolution}
                />
            </SectionItem>

            <SectionItem title={t('sidebar.label.spatialResolution')} collapsible={false}>
                <DropdownInput
                    value={spatialResolution as ESpatialResolution}
                    options={spatialResolutionOptions}
                    onChange={setSpatialResolution}
                    placeholder={t('sidebar.placeholder.none')}
                    onClear={() => setSpatialResolution('')}
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
                    value={groupBy as EGroupBy}
                    options={groupByOptions}
                    onChange={setGroupBy}
                    placeholder={t('sidebar.placeholder.none')}
                    onClear={() => setGroupBy('')}
                />
            </SectionItem>

            <SectionItem title={t('sidebar.label.filterExpression')} collapsible={false}>
                <TextInput
                    value={filterText}
                    placeholder={t('sidebar.placeholder.filterExpression')}
                    onChange={setFilterText}
                />
            </SectionItem>

            <SectionItem title={t('sidebar.label.rawQuery')} collapsible={false}>
                <TextInput
                    value={rawQuery}
                    placeholder={t('sidebar.placeholder.rawQuery')}
                    onChange={setRawQuery}
                />
            </SectionItem>

        </Section>
    )
}

export default AdvancedQuery
