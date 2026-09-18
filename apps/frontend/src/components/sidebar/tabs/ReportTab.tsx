import sidebarStyle from '../Sidebar.module.scss';
import AreaOfInterest from '../../blocks/AreaOfInterest';
import TimeRange from '../../blocks/TimeRange';
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
import { usePaginationStore } from '../../../stores/paginationStore';
import { log_frontend } from '@packages/utils';
import ExportAndImportConfig from '../../../components/blocks/ExportAndImportConfig';
import QueryProgressModal from '../../../components/blocks/QueryProgressModal';
import { useQueryProgressStore } from '../../../stores/queryProgressStore';
import { useHistoryStore } from '../../../stores/historyStore';
import { ESidebarTab } from '../../../helpers/enum/storeEnum';
import { buildConfig } from '../../../helpers/utils/configUtils';
import { syncConfigToURL } from '../../../helpers/utils/URLUtils';

const ReportTab = () => {
  const { error, execute } = useFetchEvents();
  const { t } = useTranslator();

  const events = useEventStore((s) => s.events);
  const setEvents = useEventStore((s) => s.setEvents);
  const setActiveEvent = useEventStore((s) => s.setActiveEvent);
  const setPagination = useEventStore((s) => s.setPagination);
  const pagination = useEventStore((s) => s.pagination);
  const setConfig = useConfigStore((s) => s.setConfig);
  const setSorts = useBottomStore((s) => s.setSorts);
  const setOffset = usePaginationStore((s) => s.setOffset);
  const addHistoryEntry = useHistoryStore((s) => s.addEntry);

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

  // Shared by the Run Query button and the pagination buttons below: an
  // offset override moves the pagination store to that page before the
  // config is built, so a next/prev click re-runs the full query (there's
  // no separate "just fetch this page" endpoint) with every other filter
  // left untouched and only the offset advanced/retreated.
  const runQuery = async (offsetOverride?: number) => {
    if (!hasAOI) return;
    if (offsetOverride === undefined) {
      setEvents([]);
      setPagination(null);
    } else {
      setOffset(offsetOverride);
    }
    const config = buildConfig();

    // useSyncConfigToURL already keeps the URL live-synced to every store
    // change, debounced -- this un-debounced call just guarantees the URL
    // is exactly current at the instant a query runs, even if the user's
    // last edit landed inside that debounce window. Either way, copy-pasting
    // the URL into a new tab reproduces the same sections (see
    // useHydrateConfigFromURL for the read side).
    syncConfigToURL(config);

    // Sync sorts
    if (config.sort.length > 0) setSorts(config.sort);

    log_frontend({ config: { ...config } });
    setConfig(config);
    const result = await execute(config);

    const success = Boolean(result?.success);
    const entries = success ? (result?.entries ?? []) : [];
    const resultPagination = success ? (result?.pagination ?? null) : null;

    if (success) {
      setEvents(entries);
      setPagination(resultPagination);
    }

    // Every run attempt is recorded -- success or not -- so a failed/empty
    // query is still visible (and revisitable) in the History tab, not just
    // successful ones. See historyUtils.ts for how "Apply" restores this.
    addHistoryEntry({
      id: crypto.randomUUID(),
      tab: ESidebarTab.report,
      timestamp: new Date().toISOString(),
      success,
      resultCount: entries.length,
      config,
      result: { events: entries, pagination: resultPagination },
    });
  };

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

    void runQuery();
  };

  // The backend hands back nextOffset/prevOffset (null once there's no
  // further page in that direction) alongside every page of results — see
  // events.controllers.ts. Driven off eventStore rather than local hook
  // state so it also reflects a result restored from History (no fetch).
  const nextOffset = pagination?.nextOffset;
  const prevOffset = pagination?.prevOffset;

  const handleClearResults = () => {
    setActiveEvent(null);
    setEvents([]);
    setPagination(null);
  };

  const handlePrevClick = () => {
    if (isRunning || prevOffset == null) return;
    void runQuery(prevOffset);
  };

  const handleNextClick = () => {
    if (isRunning || nextOffset == null) return;
    void runQuery(nextOffset);
  };

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
      </div>
      <div className={` ${sidebarStyle.footer}`}>
        <SectionInputGroup direction="row">
          <ButtonInput
            label={t('detailPanel.action.prev')}
            onClick={handlePrevClick}
            disabled={isRunning || !hasAOI || prevOffset == null}
            testId="prev-page-button"
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
            label={t('general.label.clear')}
            onClick={handleClearResults}
            disabled={isRunning || events.length === 0}
            testId="clear-results-button"
          />
          <ButtonInput
            label={t('detailPanel.action.next')}
            onClick={handleNextClick}
            disabled={isRunning || !hasAOI || nextOffset == null}
            testId="next-page-button"
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
