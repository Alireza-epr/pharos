import Section from '../common/section/Section';
import SectionInputGroup from '../common/section/SectionInputGroup';
import SortRowInput from '../common/inputs/SortRowInput';
import ButtonInput from '../common/inputs/ButtonInput';
import { useTranslator } from '../../hooks/translator';
import { useSortOrderStore } from '../../stores/sortOrderStore';
import { sort_field_options } from '../../helpers/fixtures/query';
import { ISortOption } from '@packages/types';
import { downloadJSON, openJSONFile } from '../../helpers/utils/downloadUtils';
import { isValidSortOrderQuery } from '../../helpers/utils/validationUtils';
import { useMessageStore } from '../../stores/messageStore';

export interface ISortOrderProps {}

const MAX_SORTS = 5;

const SortOrder = () => {
  const sort = useSortOrderStore((s) => s.sort);
  const setSort = useSortOrderStore((s) => s.setSort);

  const getSortOrder = useSortOrderStore((s) => s.getSortOrder);
  const importSortOrder = useSortOrderStore((s) => s.importSortOrder);

  const { t } = useTranslator();

  const handleExport = () => {
    downloadJSON(getSortOrder(), 'sort_order');
  };

  const handleImport = () => {
    const reportInvalid = () =>
      useMessageStore.getState().setWarn(t('general.text.invalidImportFile'));

    openJSONFile((data) => {
      if (!isValidSortOrderQuery(data)) {
        reportInvalid();
        return;
      }
      importSortOrder(data);
    }, reportInvalid);
  };

  const changeField = (index: number, field: string) => {
    setSort(
      sort.map(
        (s, i): ISortOption => (i === index ? { ...s, sortBy: field } : s),
      ),
    );
  };

  const toggleDirection = (index: number) => {
    setSort(
      sort.map(
        (s, i): ISortOption =>
          i === index
            ? { ...s, direction: s.direction === 'asc' ? 'desc' : 'asc' }
            : s,
      ),
    );
  };

  const removeSort = (index: number) => {
    setSort(sort.filter((_, i) => i !== index));
  };

  const addSort = () => {
    const usedFields = new Set(sort.map((s) => s.sortBy));
    const firstAvailable = sort_field_options.find(
      (o) => !usedFields.has(o.value),
    );
    if (!firstAvailable) return;
    setSort([...sort, { sortBy: firstAvailable.value, direction: 'desc' }]);
  };

  const optionsFor = (index: number) => {
    const usedFields = new Set(
      sort.filter((_, i) => i !== index).map((s) => s.sortBy),
    );
    return sort_field_options.filter((o) => !usedFields.has(o.value));
  };

  const canAdd =
    sort.length < MAX_SORTS && sort.length < sort_field_options.length;

  return (
    <Section
      title={t('sidebar.titles.sortOrder')}
      collapsible={false}
      showExport
      showImport
      onExport={handleExport}
      onImport={handleImport}
    >
      <SectionInputGroup direction="column" tab>
        {sort.map((item, index) => (
          <SortRowInput
            key={item.sortBy}
            rank={index + 1}
            value={item.sortBy}
            direction={item.direction ?? 'asc'}
            options={optionsFor(index)}
            onChangeField={(field) => changeField(index, field)}
            onToggleDirection={() => toggleDirection(index)}
            onRemove={() => removeSort(index)}
          />
        ))}
        {canAdd && (
          <ButtonInput label={t('sidebar.label.addSort')} onClick={addSort} />
        )}
      </SectionInputGroup>
    </Section>
  );
};

export default SortOrder;
