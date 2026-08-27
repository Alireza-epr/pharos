import Section from '../common/section/Section';
import SectionInputGroup from '../common/section/SectionInputGroup';
import ButtonInput from '../common/inputs/ButtonInput';
import { useTranslator } from '../../hooks/translator';
import {
  downloadJSON,
  importSectionConfig,
} from '../../helpers/utils/downloadUtils';
import { isValidVesselConfigJSON } from '../../helpers/utils/validationUtils';
import { buildVesselSearchConfig } from '../../helpers/utils/vesselConfigUtils';
import { useVesselSearchStore } from '../../stores/vesselSearchStore';
import { useMessageStore } from '../../stores/messageStore';

const VesselExportAndImportConfig = () => {
  const { t } = useTranslator();

  const importVesselSearchParams = useVesselSearchStore(
    (s) => s.importVesselSearchParams,
  );

  const handleExportConfig = () => {
    downloadJSON(buildVesselSearchConfig(), 'vessel_search_config');
  };

  const handleImportConfig = () => {
    importSectionConfig(
      'Vessel Search Config',
      isValidVesselConfigJSON,
      (a_Data) => importVesselSearchParams(a_Data.url_params),
      () =>
        useMessageStore.getState().setWarn(t('general.text.invalidImportFile')),
    );
  };

  return (
    <Section title={t('sidebar.titles.exportImportConfig')} collapsible={false}>
      <SectionInputGroup direction="column">
        <ButtonInput
          label={t('sidebar.label.exportAllConfig')}
          onClick={handleExportConfig}
        />
        <ButtonInput
          label={t('sidebar.label.importAllConfig')}
          onClick={handleImportConfig}
          caveat={t('sidebar.caveat.importReplacesConfig')}
        />
      </SectionInputGroup>
    </Section>
  );
};

export default VesselExportAndImportConfig;
