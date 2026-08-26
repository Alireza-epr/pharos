import Section from '../common/section/Section';
import SectionItem from '../common/section/SectionItem';
import DateInput from '../common/inputs/DateInput';
import { useTranslator } from '@/hooks/translator';
import { useTimeRangeStore } from '@/stores/timeRangeStore';
import { downloadJSON, importSectionConfig } from '@/helpers/utils/downloadUtils';
import { isValidTimeRangeQuery } from '@/helpers/utils/validationUtils';
import { useMessageStore } from '@/stores/messageStore';

export interface ITimeRangeProps {}

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
    importSectionConfig('Time Range', isValidTimeRangeQuery, importTimeRange, () =>
      useMessageStore.getState().setWarn(t('general.text.invalidImportFile')),
    );
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
