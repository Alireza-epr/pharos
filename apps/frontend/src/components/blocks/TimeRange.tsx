import Section from '../common/section/Section';
import SectionItem from '../common/section/SectionItem';
import DateInput from '../common/inputs/DateInput';
import { useTranslator } from '@/hooks/translator';
import { useTimeRangeStore } from '@/stores/timeRangeStore';
import { downloadJSON, openJSONFile } from '@/helpers/utils/downloadUtils';
import { useMessageStore } from '@/stores/messageStore';
import { isObject, isString } from '@packages/utils';
import { ITimeRangeQuery } from '@/helpers/types/storeTypes';

export interface ITimeRangeProps {}

// Matches the shape getTimeRange() produces — the same `date-range` URL param
// ReportTab sends to the backend. An imported file is trusted only if it
// splits into two comma-separated values that actually parse as dates.
const isValidTimeRangeQuery = (
  a_Data: unknown,
): a_Data is ITimeRangeQuery => {
  if (!isObject(a_Data)) return false;
  const dateRange = a_Data['date-range'];
  if (!isString(dateRange)) return false;
  const [from, to] = dateRange.split(',');
  return (
    isString(from) &&
    isString(to) &&
    !Number.isNaN(Date.parse(from)) &&
    !Number.isNaN(Date.parse(to))
  );
};

const TimeRange = () => {
  const dateFrom = useTimeRangeStore((s) => s.dateFrom);
  const setDateFrom = useTimeRangeStore((s) => s.setDateFrom);

  const dateTo = useTimeRangeStore((s) => s.dateTo);
  const setDateTo = useTimeRangeStore((s) => s.setDateTo);

  const getTimeRange = useTimeRangeStore((s) => s.getTimeRange);
  const importTimeRange = useTimeRangeStore((s) => s.importTimeRange);

  const { t } = useTranslator();

  const handleExport = () => {
    downloadJSON(getTimeRange(), 'time_range');
  };

  const handleImport = () => {
    const reportInvalid = () =>
      useMessageStore.getState().setWarn(t('general.text.invalidImportFile'));

    openJSONFile((data) => {
      if (!isValidTimeRangeQuery(data)) {
        reportInvalid();
        return;
      }
      importTimeRange(data);
    }, reportInvalid);
  };

  return (
    <Section
      title={t('sidebar.titles.timeRange')}
      collapsible={false}
      showExport
      showImport
      onExport={handleExport}
      onImport={handleImport}
    >
      <SectionItem title={t('general.label.from')} tab >
        <DateInput value={dateFrom} max={dateTo} onChange={setDateFrom} />
      </SectionItem>
      <SectionItem title={t('general.label.to')} tab >
        <DateInput value={dateTo} min={dateFrom} onChange={setDateTo} />
      </SectionItem>
    </Section>
  );
};

export default TimeRange;
