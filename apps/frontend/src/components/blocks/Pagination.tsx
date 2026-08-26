import { usePaginationStore } from '../../stores/paginationStore';
import { useTranslator } from '../../hooks/translator';
import NumberInput from '../common/inputs/NumberInput';
import Section from '../common/section/Section';
import SectionItem from '../common/section/SectionItem';
import {
  downloadJSON,
  importSectionConfig,
} from '../../helpers/utils/downloadUtils';
import { isValidPaginationQuery } from '../../helpers/utils/validationUtils';
import { useMessageStore } from '../../stores/messageStore';

const Pagination = () => {
  const limit = usePaginationStore((s) => s.limit);
  const setLimit = usePaginationStore((s) => s.setLimit);
  const offset = usePaginationStore((s) => s.offset);
  const setOffset = usePaginationStore((s) => s.setOffset);

  const getPagination = usePaginationStore((s) => s.getPagination);
  const importPagination = usePaginationStore((s) => s.importPagination);

  const { t } = useTranslator();

  const handleExport = () => {
    downloadJSON(getPagination(), 'pagination');
  };

  const handleImport = () => {
    importSectionConfig(
      'Pagination',
      isValidPaginationQuery,
      importPagination,
      () =>
        useMessageStore.getState().setWarn(t('general.text.invalidImportFile')),
    );
  };

  return (
    <Section
      title={t('general.label.pagination')}
      collapsible={false}
      showExport
      showImport
      onExport={handleExport}
      onImport={handleImport}
    >
      <SectionItem title={t('general.label.limit')} tab>
        <NumberInput
          direction="row"
          min={0}
          max={100}
          value={limit ?? 0}
          onChange={(e) => setLimit(e)}
        />
      </SectionItem>
      <SectionItem title={t('general.label.offset')} tab>
        <NumberInput
          direction="row"
          min={0}
          value={offset ?? 0}
          onChange={(e) => setOffset(e)}
        />
      </SectionItem>
    </Section>
  );
};

export default Pagination;
