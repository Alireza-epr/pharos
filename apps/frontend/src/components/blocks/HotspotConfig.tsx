import Section from '../common/section/Section';
import SectionItem from '../common/section/SectionItem';
import NumberInput from '../common/inputs/NumberInput';
import DropdownInput, { IDropdownOption } from '../common/inputs/DropdownInput';
import { useTranslator } from '@/hooks/translator';
import { useHotspotConfigStore } from '../../stores/hotspotConfigStore';
import { EHotspotTimeBins } from '@packages/enum';
import { IHotspotConfig } from '@packages/types';
import { downloadJSON, openJSONFile } from '../../helpers/utils/downloadUtils';
import { isValidHotspotQuery } from '../../helpers/utils/validationUtils';
import { useMessageStore } from '../../stores/messageStore';

export interface IHotspotConfigProps {}

const timeBinOptions: IDropdownOption<EHotspotTimeBins>[] = Object.values(
  EHotspotTimeBins,
).map((bin) => ({
  label: bin,
  value: bin,
}));

const HotspotConfig = () => {
  const resolution = useHotspotConfigStore((s) => s.resolution);
  const setResolution = useHotspotConfigStore((s) => s.setResolution);

  const timeBin = useHotspotConfigStore((s) => s.timeBin);
  const setTimeBin = useHotspotConfigStore((s) => s.setTimeBin);

  const getHotspotConfig = useHotspotConfigStore((s) => s.getHotspotConfig);
  const importHotspotConfig = useHotspotConfigStore(
    (s) => s.importHotspotConfig,
  );

  const { t } = useTranslator();

  const handleExport = () => {
    downloadJSON(getHotspotConfig(), 'hotspot');
  };

  const handleImport = () => {
    const reportInvalid = () =>
      useMessageStore.getState().setWarn(t('general.text.invalidImportFile'));

    openJSONFile((data) => {
      if (!isValidHotspotQuery(data)) {
        reportInvalid();
        return;
      }
      importHotspotConfig(data);
    }, reportInvalid);
  };

  return (
    <Section
      title={t('sidebar.titles.hotspotConfig')}
      collapsible={false}
      showExport
      showImport
      onExport={handleExport}
      onImport={handleImport}
    >
      <SectionItem title={t('sidebar.label.resolution')} tab>
        <NumberInput
          value={resolution}
          min={0}
          max={15}
          step={1}
          // NumberInput emits an unbounded number (users can type past min/max),
          // but resolution is an H3 level 0-15; clamp + round before storing.
          onChange={(v) =>
            setResolution(
              Math.min(
                15,
                Math.max(0, Math.round(v)),
              ) as IHotspotConfig['resolution'],
            )
          }
        />
      </SectionItem>
      <SectionItem title={t('sidebar.label.timeBin')} tab>
        <DropdownInput
          value={timeBin}
          options={timeBinOptions}
          onChange={setTimeBin}
        />
      </SectionItem>
    </Section>
  );
};

export default HotspotConfig;
