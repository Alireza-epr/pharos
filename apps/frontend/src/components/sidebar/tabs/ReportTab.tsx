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
import { IConfigJSON, TURLParams } from '@packages/types';
import { EFetchMethods } from '@packages/enum';
import { useFilterStore } from '../../../stores/filterStore';
import { useHotspotConfigStore } from '../../../stores/hotspotConfigStore';
import { useThresholdAndWeightsStore } from '../../../stores/thresholdAndWeightsStore';
import { useAdvancedQueryStore } from '../../../stores/advancedQueryStore';
import Pagination from '../../blocks/Pagination';
import { usePaginationStore } from '../../../stores/paginationStore';
import { globalfishingwatch } from '../../../helpers/fixtures/url';
import { useEffect } from 'react';
import { log_frontend } from '@packages/utils';

const ReportTab = () => {
  const { response, loading, error, execute } = useFetchEvents();
  const { t } = useTranslator();

  const setEvents = useEventStore((s) => s.setEvents);
  const setSorts = useBottomStore((s) => s.setSorts);

  const hasAOI = useAOIStore((s) =>
    Boolean(s.eezActive || s.mpaActive || s.feature),
  );

  const handleRunQueryClick = () => {
    const aoi = useAOIStore.getState().getAOI();
    if (!aoi) return;

    let method: EFetchMethods;
    if ('region-dataset' in aoi) {
      method = EFetchMethods.get;
    } else {
      method = EFetchMethods.post;
    }

    const sort = useSortOrderStore.getState().sorts;

    const filter = useFilterStore.getState().filters;
    const sources = useFilterStore.getState().getSources();
    const filters = useFilterStore.getState().getFilter();

    const hotspot = useHotspotConfigStore.getState().getHotspot();

    const threshold = useThresholdAndWeightsStore.getState().getThreshold();

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
      ...filters,
      ...sources,
    };
    const urlParams: TURLParams =
      'region-dataset' in aoi
        ? {
            ...urlParams_base,
            'region-dataset': aoi['region-dataset'],
            'region-id': aoi['region-id'],
          }
        : {
            ...urlParams_base,
          };

    const bodyParams_base = {
      URL: globalfishingwatch.url['4wings'].endpoints.report,
      sort,
      filter,
      hotspot,
      threshold,
      pagination,
    };

    const config_base = {
      url_params: {
        ...urlParams,
      },
      ...bodyParams_base,
    };

    const config: IConfigJSON =
      'region-dataset' in aoi
        ? {
            ...config_base,
            method: EFetchMethods.get,
          }
        : {
            ...config_base,
            method: EFetchMethods.post,
            body_params: { geojson: aoi },
          };

    // Sync sorts
    if (sort.length > 0) setSorts(sort);

    log_frontend({ config: { ...config } });
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
