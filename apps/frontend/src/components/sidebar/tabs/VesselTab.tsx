import sidebarStyle from '../Sidebar.module.scss';
import VesselSearch from '../../blocks/VesselSearch';
import VesselResults from '../../blocks/VesselResults';
import ButtonInput from '../../common/inputs/ButtonInput';
import SectionInputGroup from '../../common/section/SectionInputGroup';
import { useTranslator } from '../../../hooks/translator';
import { useVesselSearchStore } from '../../../stores/vesselSearchStore';
import { useVesselStore } from '../../../stores/vesselStore';
import { useFetchVessels } from '../../../hooks/fetch';
import { log_frontend } from '@packages/utils';
import {
  getVesselPaginationState,
  isVesselSearchReady,
} from '../../../helpers/utils/vesselUtils';

const VesselTab = () => {
  const { t } = useTranslator();
  const { loading, error, execute } = useFetchVessels();

  const getVesselSearchParams = useVesselSearchStore(
    (s) => s.getVesselSearchParams,
  );
  const query = useVesselSearchStore((s) => s.query);
  const where = useVesselSearchStore((s) => s.where);

  const setVessels = useVesselStore((s) => s.setVessels);
  const setActiveVessel = useVesselStore((s) => s.setActiveVessel);
  const pages = useVesselStore((s) => s.pages);
  const setPages = useVesselStore((s) => s.setPages);
  const pageIndex = useVesselStore((s) => s.pageIndex);
  const setPageIndex = useVesselStore((s) => s.setPageIndex);
  const since = useVesselStore((s) => s.since);
  const setSince = useVesselStore((s) => s.setSince);
  const total = useVesselStore((s) => s.total);
  const setTotal = useVesselStore((s) => s.setTotal);
  const lastParams = useVesselStore((s) => s.lastParams);
  const setLastParams = useVesselStore((s) => s.setLastParams);

  const canSearch = isVesselSearchReady(query, where);

  const { hasCachedNext, hasPrev, hasNext } = getVesselPaginationState(
    pages,
    pageIndex,
    since,
    total,
  );

  const handleRunSearch = async () => {
    if (!canSearch || loading) return;
    setActiveVessel(null);
    const params = getVesselSearchParams();
    // Same mechanism as ReportTab's own `log_frontend({ config: {...} })` --
    // only prints with ?loglevel=3, logs exactly what's being sent.
    log_frontend({ config: { ...params } });
    const response = await execute(params);
    if (!response) return;
    log_frontend({ response: { ...response } });

    if (response.success && response.entries) {
      setPages([response.entries]);
      setPageIndex(0);
      setVessels(response.entries);
      setSince(response.since ?? null);
      setTotal(response.total ?? null);
      setLastParams(params);
    }
  };

  const handlePrevClick = () => {
    if (loading || !hasPrev) return;
    const newIndex = pageIndex - 1;
    setPageIndex(newIndex);
    setVessels(pages[newIndex] ?? []);
  };

  const handleNextClick = async () => {
    if (loading || !hasNext) return;

    // Already fetched this page earlier -- just page forward, no request.
    if (hasCachedNext) {
      const newIndex = pageIndex + 1;
      setPageIndex(newIndex);
      setVessels(pages[newIndex] ?? []);
      return;
    }

    if (!since || !lastParams) return;
    // Reuse the scroll session's original params -- editing the search
    // form mid-scroll must not change what a stale `since` token resumes.
    const params = { ...lastParams, since };
    log_frontend({ config: { ...params } });
    const response = await execute(params);
    if (!response) return;
    log_frontend({ response: { ...response } });

    if (response.success && response.entries) {
      const newPages = [...pages, response.entries];
      setPages(newPages);
      setPageIndex(newPages.length - 1);
      setVessels(response.entries);
      setSince(response.since ?? since);
      setTotal(response.total ?? total);
    }
  };

  return (
    <>
      <div className={`scrollbar ${sidebarStyle.scrollArea}`}>
        <VesselSearch />
        <VesselResults />
      </div>
      <div className={` ${sidebarStyle.footer}`}>
        <SectionInputGroup direction="row">
          <ButtonInput
            label={t('detailPanel.action.prev')}
            onClick={handlePrevClick}
            disabled={loading || !hasPrev}
            testId="vessel-prev-button"
          />
          <ButtonInput
            label={t('sidebar.label.runQuery')}
            onClick={handleRunSearch}
            disabled={!canSearch || loading}
            loading={loading}
            testId="vessel-search-button"
          />
          <ButtonInput
            label={t('detailPanel.action.next')}
            onClick={handleNextClick}
            disabled={loading || !hasNext}
            testId="vessel-next-button"
          />
        </SectionInputGroup>
        <span
          className={`font-size-xs font-light font-family-header sub-text ${error ? 'error' : ''}`}
        >
          {error
            ? t('sidebar.error.runQueryFailed')
            : t('sidebar.text.subVesselSearch')}
        </span>
      </div>
    </>
  );
};

export default VesselTab;
