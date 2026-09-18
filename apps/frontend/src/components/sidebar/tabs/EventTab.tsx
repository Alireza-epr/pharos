import sidebarStyle from '../Sidebar.module.scss';
import EventSearch from '../../blocks/EventSearch';
import EventExportAndImportConfig from '../../blocks/EventExportAndImportConfig';
import EventResults from '../../blocks/EventResults';
import ButtonInput from '../../common/inputs/ButtonInput';
import SectionInputGroup from '../../common/section/SectionInputGroup';
import { useTranslator } from '../../../hooks/translator';
import { useGfwEventSearchStore } from '../../../stores/gfwEventSearchStore';
import { useGfwEventStore } from '../../../stores/gfwEventStore';
import { useFetchGfwEvents } from '../../../hooks/fetch';
import { log_frontend } from '@packages/utils';
import { buildEventSearchConfig } from '../../../helpers/utils/eventConfigUtils';
import { syncEventSearchConfigToURL } from '../../../helpers/utils/URLUtils';
import {
  getEventPaginationState,
  getNextOffset,
  isEventSearchReady,
} from '../../../helpers/utils/gfwEventUtils';
import { useHistoryStore } from '../../../stores/historyStore';
import { ESidebarTab } from '../../../helpers/enum/storeEnum';

const EventTab = () => {
  const { t } = useTranslator();
  const { loading, error, execute } = useFetchGfwEvents();

  const datasets = useGfwEventSearchStore((s) => s.datasets);

  const events = useGfwEventStore((s) => s.events);
  const setEvents = useGfwEventStore((s) => s.setEvents);
  const setActiveEvent = useGfwEventStore((s) => s.setActiveEvent);
  const pages = useGfwEventStore((s) => s.pages);
  const setPages = useGfwEventStore((s) => s.setPages);
  const pageIndex = useGfwEventStore((s) => s.pageIndex);
  const setPageIndex = useGfwEventStore((s) => s.setPageIndex);
  const total = useGfwEventStore((s) => s.total);
  const setTotal = useGfwEventStore((s) => s.setTotal);
  const lastParams = useGfwEventStore((s) => s.lastParams);
  const setLastParams = useGfwEventStore((s) => s.setLastParams);
  const addHistoryEntry = useHistoryStore((s) => s.addEntry);

  const canSearch = isEventSearchReady(datasets);

  const { hasCachedNext, hasPrev, hasNext } = getEventPaginationState(
    pages,
    pageIndex,
    total,
  );

  const handleRunSearch = async () => {
    if (!canSearch || loading) return;
    setActiveEvent(null);
    setEvents([]);
    setPages([]);
    setPageIndex(0);
    setTotal(null);
    const config = buildEventSearchConfig();
    syncEventSearchConfigToURL(config);
    log_frontend({ config: { ...config } });
    const response = await execute(config);
    const success = Boolean(response?.success && response.entries);
    const entries = success ? (response!.entries ?? []) : [];

    if (response) log_frontend({ response: { ...response } });

    const sessionParams = {
      url_params: config.url_params,
      body_params: config.body_params,
    };

    if (success) {
      setPages([entries]);
      setPageIndex(0);
      setEvents(entries);
      setTotal(response!.total ?? null);
      setLastParams(sessionParams);
    }

    addHistoryEntry({
      id: crypto.randomUUID(),
      tab: ESidebarTab.event,
      timestamp: new Date().toISOString(),
      success,
      resultCount: entries.length,
      config: sessionParams,
      result: {
        events: entries,
        pages: success ? [entries] : [],
        pageIndex: 0,
        total: success ? (response!.total ?? null) : null,
        lastParams: success ? sessionParams : null,
      },
    });
  };


  const handleClearResults = () => {
    setActiveEvent(null);
    setEvents([]);
    setPages([]);
    setPageIndex(0);
    setTotal(null);
    setLastParams(null);
  };

  const handlePrevClick = () => {
    if (loading || !hasPrev) return;
    const newIndex = pageIndex - 1;
    setPageIndex(newIndex);
    setEvents(pages[newIndex] ?? []);
  };

  const handleNextClick = async () => {
    if (loading || !hasNext) return;

    // Already fetched this page earlier -- just page forward, no request.
    if (hasCachedNext) {
      const newIndex = pageIndex + 1;
      setPageIndex(newIndex);
      setEvents(pages[newIndex] ?? []);
      return;
    }

    if (!lastParams) return;
    // Reuse the paging session's original params -- editing the search form
    // mid-page must not change what the next offset resumes.
    const config = buildEventSearchConfig({
      url_params: { ...lastParams.url_params, offset: getNextOffset(pages) },
      body_params: lastParams.body_params,
    });
    log_frontend({ config: { ...config } });
    const response = await execute(config);
    if (!response) return;
    log_frontend({ response: { ...response } });

    if (response.success && response.entries) {
      const newPages = [...pages, response.entries];
      setPages(newPages);
      setPageIndex(newPages.length - 1);
      setEvents(response.entries);
      setTotal(response.total ?? total);
    }
  };

  return (
    <>
      <div className={`scrollbar ${sidebarStyle.scrollArea}`}>
        <EventSearch />
        <EventResults />
        <EventExportAndImportConfig />
      </div>
      <div className={` ${sidebarStyle.footer}`}>
        <SectionInputGroup direction="row">
          <ButtonInput
            label={t('detailPanel.action.prev')}
            onClick={handlePrevClick}
            disabled={loading || !hasPrev}
            testId="event-prev-button"
          />
          <ButtonInput
            label={t('sidebar.label.runQuery')}
            onClick={handleRunSearch}
            disabled={!canSearch || loading}
            loading={loading}
            testId="event-search-button"
          />
          <ButtonInput
            label={t('general.label.clear')}
            onClick={handleClearResults}
            disabled={loading || events.length === 0}
            testId="event-clear-button"
          />
          <ButtonInput
            label={t('detailPanel.action.next')}
            onClick={handleNextClick}
            disabled={loading || !hasNext}
            testId="event-next-button"
          />
        </SectionInputGroup>
        <span
          className={`font-size-xs font-light font-family-header sub-text ${error ? 'error' : ''}`}
        >
          {error
            ? t('sidebar.error.runQueryFailed')
            : t('sidebar.text.subEventSearch')}
        </span>
      </div>
    </>
  );
};

export default EventTab;
