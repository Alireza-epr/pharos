import sidebarStyle from '../Sidebar.module.scss';
import AreaOfInterest from '../../blocks/AreaOfInterest';
import TimeRange from '../../blocks/TimeRange';
import ContextLayers from '../../blocks/DataLayers';
import HotspotConfig from '../../blocks/HotspotConfig';
import SortOrder from '../../blocks/SortOrder';
import Filter from '../../blocks/Filter';
import ThresholdAndWeights from '../../blocks/ThresholdAndWeights';
import AdvancedQuery from '../../blocks/AdvancedQuery';
import ButtonInput from '../../common/inputs/ButtonInput';
import { useTranslator } from '../../../hooks/translator';
import { useEventStore } from '../../../stores/eventStore';
import { useBottomStore } from '../../../stores/bottomStore';
import SectionInputGroup from '../../common/section/SectionInputGroup';
import { useFetchEvents } from '../../../hooks/fetch';
import { useAOIStore } from '../../../stores/areaOfInterestStore';
import { useConfigStore } from '../../../stores/configStore';
import Pagination from '../../blocks/Pagination';
import { useEffect } from 'react';
import { log_frontend } from '@packages/utils';
import ExportAndImportConfig from '../../../components/blocks/ExportAndImportConfig';
import { buildConfig } from '../../../helpers/utils/configUtils';

const ReportTab = () => {
  const { response, loading, error, execute } = useFetchEvents();
  const { t } = useTranslator();

  const setEvents = useEventStore((s) => s.setEvents);
  const setConfig = useConfigStore((s) => s.setConfig);
  const setSorts = useBottomStore((s) => s.setSorts);

  const hasAOI = useAOIStore((s) =>
    Boolean(s.eezActive || s.mpaActive || s.feature),
  );

  const handleRunQueryClick = () => {
    if (!hasAOI) return;
    const config = buildConfig();

    // Sync sorts
    if (config.sort.length > 0) setSorts(config.sort);

    log_frontend({ config: { ...config } });
    setConfig(config);
    execute(config);
  };

  useEffect(() => {
    if (response) {
      if (response.success) {
        if (response.entries) {
          setEvents(response.entries);
        }
      }
    }
  }, [response]);

  return (
    <>
      <div className={`scrollbar ${sidebarStyle.scrollArea}`}>
        <AreaOfInterest />
        <TimeRange />
        <Pagination />
        <SortOrder />
        <Filter />
        <ThresholdAndWeights />
        <HotspotConfig />
        <AdvancedQuery />
        <ExportAndImportConfig />
        <ContextLayers />
      </div>
      <div className={` ${sidebarStyle.footer}`}>
        <SectionInputGroup direction="row">
          <ButtonInput
            label={t('detailPanel.action.prev')}
            onClick={() => {}}
            disabled
          />
          <ButtonInput
            label={t('sidebar.label.runQuery')}
            onClick={handleRunQueryClick}
            disabled={loading || !hasAOI}
            loading={loading}
            testId="run-query-button"
          />
          <ButtonInput
            label={t('detailPanel.action.next')}
            onClick={() => {}}
            disabled
          />
        </SectionInputGroup>
        <span
          className={`font-size-xs font-light font-family-header sub-text ${error ? 'error' : ''}`}
        >
          {error
            ? t('sidebar.error.runQueryFailed')
            : t('sidebar.text.subRunQuery')}
        </span>
      </div>
    </>
  );
};

export default ReportTab;
