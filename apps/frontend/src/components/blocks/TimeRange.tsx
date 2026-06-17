import Section from '../common/section/Section';
import SectionItem from '../common/section/SectionItem';
import DateInput from '../common/inputs/DateInput';
import { useTranslator } from '@/hooks/translator';
import { useTimeRangeStore } from '@/stores/timeRangeStore';

export interface ITimeRangeProps {}

const TimeRange = () => {
  const dateFrom = useTimeRangeStore((s) => s.dateFrom);
  const setDateFrom = useTimeRangeStore((s) => s.setDateFrom);

  const dateTo = useTimeRangeStore((s) => s.dateTo);
  const setDateTo = useTimeRangeStore((s) => s.setDateTo);

  const { t } = useTranslator();

  return (
    <Section title={t('sidebar.titles.timeRange')} collapsible>
      <SectionItem title={t('general.label.from')}>
        <DateInput value={dateFrom} max={dateTo} onChange={setDateFrom} />
      </SectionItem>
      <SectionItem title={t('general.label.to')}>
        <DateInput value={dateTo} min={dateFrom} onChange={setDateTo} />
      </SectionItem>
    </Section>
  );
};

export default TimeRange;
