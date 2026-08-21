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
import QueryProgressModal from '../../../components/blocks/QueryProgressModal';
import { useQueryProgressStore } from '../../../stores/queryProgressStore';
import { buildConfig } from '../../../helpers/utils/configUtils';

const ReportTab = () => {
  const { response, error, execute } = useFetchEvents();
  const { t } = useTranslator();

  const setEvents = useEventStore((s) => s.setEvents);
  const setConfig = useConfigStore((s) => s.setConfig);
  const setSorts = useBottomStore((s) => s.setSorts);

  const hasAOI = useAOIStore((s) =>
    Boolean(s.eezActive || s.mpaActive || s.feature),
  );

  // isRunning/isOpen live in the store (not local state) so they survive this
  // component unmounting/remounting (e.g. switching sidebar tabs) — a query
  // in flight must never look "idle" again just because its owning component
  // was torn down and rebuilt.
  const isRunning = useQueryProgressStore((s) => s.isRunning);
  const isProgressOpen = useQueryProgressStore((s) => s.isOpen);
  const openProgress = useQueryProgressStore((s) => s.open);

  const handleRunQueryClick = () => {
    // A run is already in flight — its modal may just be hidden. Reopen it
    // instead of silently starting a second, overlapping request: the
    // detection provider allows only one concurrent report per token, and
    // cancelling our side doesn't reliably stop one already accepted
    // upstream, so a duplicate submit collides with the one still running.
    if (isRunning) {
      openProgress();
      return;
    }

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
      <QueryProgressModal />
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
            label={
              isRunning && !isProgressOpen
                ? t('sidebar.label.viewProgress')
                : t('sidebar.label.runQuery')
            }
            onClick={handleRunQueryClick}
            // While running with the modal open, the button shows its own
            // spinner and is inert (the modal already has focus). While
            // running with the modal closed it must stay clickable — that's
            // how the user gets back to a run they dismissed early — so only
            // gate on AOI once there's no run to reopen.
            disabled={isRunning ? isProgressOpen : !hasAOI}
            loading={isRunning && isProgressOpen}
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
