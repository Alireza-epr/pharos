import Section from '../common/section/Section';
import SectionInputGroup from '../common/section/SectionInputGroup';
import ButtonInput from '../common/inputs/ButtonInput';
import { useTranslator } from '../../hooks/translator';
import {
  downloadJSON,
  importSectionConfig,
} from '../../helpers/utils/downloadUtils';
import { isValidEventConfigJSON } from '../../helpers/utils/validationUtils';
import {
  buildEventSearchConfig,
  importEventAOIAndTimeRange,
} from '../../helpers/utils/eventConfigUtils';
import { useGfwEventSearchStore } from '../../stores/gfwEventSearchStore';
import { useMessageStore } from '../../stores/messageStore';

const EventExportAndImportConfig = () => {
  const { t } = useTranslator();

  const importEventSearchParams = useGfwEventSearchStore(
    (s) => s.importEventSearchParams,
  );
  const setLimit = useGfwEventSearchStore((s) => s.setLimit);
  const setSort = useGfwEventSearchStore((s) => s.setSort);

  const handleExportConfig = () => {
    downloadJSON(buildEventSearchConfig(), 'event_search_config');
  };

  const handleImportConfig = () => {
    importSectionConfig(
      'Event Search Config',
      isValidEventConfigJSON,
      (a_Data) => {
        importEventSearchParams(a_Data.body_params);
        setLimit(a_Data.url_params.limit ?? 20);
        setSort(a_Data.url_params.sort ?? '');
        void importEventAOIAndTimeRange(a_Data.body_params);
      },
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

export default EventExportAndImportConfig;
