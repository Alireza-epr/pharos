
import Section from '../common/section/Section';
import SectionInputGroup from '../common/section/SectionInputGroup';
import CheckboxInput from '../common/inputs/CheckboxInput';
import { useTranslator } from '@/hooks/translator';
import { useContextLayersStore } from '@/stores/contextLayersStore';

export interface IDataLayersProps {}

const DataLayers = (props: IDataLayersProps) => {

    const hotspots = useContextLayersStore(s => s.hotspots)
    const setHotspots = useContextLayersStore(s => s.setHotspots)

    const eezBoundaries = useContextLayersStore(s => s.eezBoundaries)
    const setEezBoundaries = useContextLayersStore(s => s.setEezBoundaries)

    const mpaZones = useContextLayersStore(s => s.mpaZones)
    const setMpaZones = useContextLayersStore(s => s.setMpaZones)

    const { t } = useTranslator()

    return (
        <Section title={t('sidebar.titles.dataLayers')} collapsible>
            <SectionInputGroup direction="column">
                <CheckboxInput
                    label={t('sidebar.label.hotspots')}
                    checked={hotspots}
                    onChange={setHotspots}
                />
                <CheckboxInput
                    label={t('sidebar.label.eezBoundaries')}
                    checked={eezBoundaries}
                    onChange={setEezBoundaries}
                />
                <CheckboxInput
                    label={t('sidebar.label.mpaZones')}
                    checked={mpaZones}
                    onChange={setMpaZones}
                />
            </SectionInputGroup>
        </Section>
    )
}

export default DataLayers
