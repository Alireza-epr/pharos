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
import { useSortOrderStore } from '../../../stores/sortOrderStore';
import { useBottomStore } from '../../../stores/bottomStore';
import SectionInputGroup from '../../common/section/SectionInputGroup';
import { useFetchEvents } from '../../../hooks/fetch';
import { useAOIStore } from '../../../stores/areaOfInterestStore';
import { IConfigJSON, IGeometry, TURLParams } from '@packages/types';
import { EFetchMethods } from '@packages/enum';
import { useFilterStore } from '../../../stores/filterStore';
import { useHotspotConfigStore } from '../../../stores/hotspotConfigStore';
import { useConfigStore } from '../../../stores/configStore';
import { useThresholdStore } from '../../../stores/thresholdStore';
import { useAdvancedQueryStore } from '../../../stores/advancedQueryStore';
import Pagination from '../../blocks/Pagination';
import { usePaginationStore } from '../../../stores/paginationStore';
import { globalfishingwatch } from '../../../helpers/fixtures/url';
import { useEffect } from 'react';
import { log_frontend } from '@packages/utils';
import { useTimeRangeStore } from '../../../stores/timeRangeStore';
import ExportAndImportConfig from '../../../components/blocks/ExportAndImportConfig';

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
    const aoi = useAOIStore.getState().getAOI();
    if (!aoi) return;

    const dateRange = useTimeRangeStore.getState().getTimeRange();

    const sortOrder = useSortOrderStore.getState().getSortOrder();

    const filter = useFilterStore.getState().filter;
    const sources = useFilterStore.getState().getSources();
    const filters = useFilterStore.getState().getFilter();

    const hotspot = useHotspotConfigStore.getState().getHotspot();

    const threshold = useThresholdStore.getState().threshold;
    
    const exportConfig = useConfigStore.getState().getExport();

    const pagination = usePaginationStore.getState().getPagination();

    const {
      spatialResolution,
      spatialAggregation,
      temporalResolution,
      format,
      groupBy,
    } = useAdvancedQueryStore.getState().getAdvancedQuery();

    const urlParams_base = {
      'spatial-resolution': spatialResolution,
      'spatial-aggregation': spatialAggregation,
      'temporal-resolution': temporalResolution,
      format,
      'group-by': groupBy,
      ...dateRange,
      ...filters,
      ...sources,
    };
    const region =
      aoi.properties && 'region-dataset' in aoi.properties
        ? aoi.properties
        : undefined;

    const urlParams: TURLParams = region
      ? {
          ...urlParams_base,
          'region-dataset': region['region-dataset'],
          'region-id': region['region-id'],
        }
      : {
          ...urlParams_base,
        };

    const bodyParams_base = {
      URL: globalfishingwatch.url['4wings'].endpoints.report,
      ...sortOrder,
      filter,
      hotspot,
      threshold,
      ...pagination,
      export: exportConfig,
    };

    const config_base = {
      url_params: {
        ...urlParams,
      },
      ...bodyParams_base,
    };

    const config: IConfigJSON = region
      ? {
          ...config_base,
          method: EFetchMethods.get,
        }
      : {
          ...config_base,
          method: EFetchMethods.post,
          // The backend's geojson body param is a bare Geometry (see
          // docs/api/query-contract.md), so unwrap the Feature's geometry here.
          // getAOI() always pairs a named region with null geometry, so this
          // branch's `aoi.geometry` (Zonal or buffered Point) is never null.
          body_params: { geojson: aoi.geometry as IGeometry },
        };

    // Sync sorts
    if (sortOrder.sort.length > 0) setSorts(sortOrder.sort);

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
        <ContextLayers />
        <HotspotConfig />
        <AdvancedQuery />
        <ExportAndImportConfig />
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
