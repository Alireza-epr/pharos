import { usePaginationStore } from '@/stores/paginationStore';
import { useTranslator } from '../../hooks/translator';
import NumberInput from '../common/inputs/NumberInput';
import Section from '../common/section/Section';
import SectionItem from '../common/section/SectionItem';
import { downloadJSON, openJSONFile } from '@/helpers/utils/downloadUtils';
import { useMessageStore } from '@/stores/messageStore';
import { isNumber, isObject } from '@packages/utils';
import { IPaginationQuery } from '@/helpers/types/storeTypes';

// Matches the shape getPagination() produces — the same `pagination` body
// param ReportTab already sends to the backend. An imported file is trusted
// only if both fields are a number or null, same as the store itself allows.
const isValidPaginationQuery = (
  a_Data: unknown,
): a_Data is IPaginationQuery => {
  if (!isObject(a_Data)) return false;
  const pagination = a_Data['pagination'];
  if (!isObject(pagination)) return false;
  const { limit, offset } = pagination;
  return (
    (limit === null || isNumber(limit)) &&
    (offset === null || isNumber(offset))
  );
};

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
    const reportInvalid = () =>
      useMessageStore.getState().setWarn(t('general.text.invalidImportFile'));

    openJSONFile((data) => {
      if (!isValidPaginationQuery(data)) {
        reportInvalid();
        return;
      }
      importPagination(data);
    }, reportInvalid);
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
      <SectionItem title={t('general.label.limit')} tab >
        <NumberInput
          direction="row"
          min={0}
          max={100}
          value={limit ?? 0}
          onChange={(e) => setLimit(e)}
        />
      </SectionItem>
      <SectionItem title={t('general.label.offset')} tab >
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
