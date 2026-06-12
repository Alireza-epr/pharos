
import Section from '../common/section/Section';
import SectionItem from '../common/section/SectionItem';
import NumberInput from '../common/inputs/NumberInput';
import DropdownInput, { IDropdownOption } from '../common/inputs/DropdownInput';
import { useTranslator } from '@/hooks/translator';
import { useHotspotConfigStore } from '@/stores/hotspotConfigStore';
import { EHotspotTimeBins } from '@packages/enum';

export interface IHotspotConfigProps {}

const timeBinOptions: IDropdownOption<EHotspotTimeBins>[] = Object.values(EHotspotTimeBins).map((bin) => ({
    label: bin,
    value: bin,
}))

const HotspotConfig = (props: IHotspotConfigProps) => {
    const resolution = useHotspotConfigStore(s => s.resolution)
    const setResolution = useHotspotConfigStore(s => s.setResolution)

    const timeBin = useHotspotConfigStore(s => s.timeBin)
    const setTimeBin = useHotspotConfigStore(s => s.setTimeBin)

    const { t } = useTranslator()

    return (
        <Section title={t('sidebar.titles.hotspotConfig')} collapsible>
            <SectionItem title={t('sidebar.label.resolution')}>
                <NumberInput
                    value={resolution}
                    min={0}
                    max={15}
                    step={1}
                    onChange={setResolution}
                />
            </SectionItem>
            <SectionItem title={t('sidebar.label.timeBin')}>
                <DropdownInput
                    value={timeBin}
                    options={timeBinOptions}
                    onChange={setTimeBin}
                />
            </SectionItem>
        </Section>
    )
}

export default HotspotConfig
