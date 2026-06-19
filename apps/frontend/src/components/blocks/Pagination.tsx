import { usePaginationStore } from '@/stores/paginationStore';
import { useTranslator } from '../../hooks/translator';
import NumberInput from '../common/inputs/NumberInput';
import Section from '../common/section/Section';
import SectionItem from '../common/section/SectionItem';

const Pagination = () => {
  const limit = usePaginationStore((s) => s.limit);
  const setLimit = usePaginationStore((s) => s.setLimit);
  const offset = usePaginationStore((s) => s.offset);
  const setOffset = usePaginationStore((s) => s.setOffset);

  const { t } = useTranslator();

  return (
    <Section title={t('general.label.pagination')} collapsible>
      <SectionItem title={t('general.label.limit')}>
        <NumberInput
          direction="row"
          min={0}
          max={100}
          value={limit ?? 0}
          onChange={(e) => setLimit(e)}
        />
      </SectionItem>
      <SectionItem title={t('general.label.offset')}>
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
