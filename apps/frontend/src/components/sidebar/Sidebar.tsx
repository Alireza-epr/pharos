import sidebarStyle from './Sidebar.module.scss';
import AreaOfInterest from "../blocks/AreaOfInterest"
import TimeRange from "../blocks/TimeRange"
import ContextLayers from "../blocks/ContextLayers"
import HotspotConfig from "../blocks/HotspotConfig"
import SortOrder from "../blocks/SortOrder"
import Filter from "../blocks/Filter"
import ThresholdAndWeights from "../blocks/ThresholdAndWeights"
import AdvancedQuery from "../blocks/AdvancedQuery"
import ButtonInput from '../common/inputs/ButtonInput';
import { useTranslator } from '../../hooks/translator';
import { useEventStore } from '../../stores/eventStore';
import { useSortOrderStore } from '../../stores/sortOrderStore';
import { useBottomStore } from '../../stores/bottomStore';
import { samples } from '../../helpers/fixtures/samples';

export interface ISidebarProps {}

const Sidebar = () => {

  const {t} = useTranslator()
  const setEvents = useEventStore( s => s.setEvents )
  const sorts = useSortOrderStore(s => s.sorts)
  const setSorts = useBottomStore(s => s.setSorts)

  const handleRunQueryClick = () => {
    setEvents(samples as any)
    if (sorts.length > 0) setSorts(sorts)
  }
  return (
    <div className={` ${sidebarStyle.wrapper}`}>
      <div className={`scrollbar ${sidebarStyle.scrollArea}`}>
        <AreaOfInterest />
        <TimeRange />
        <ContextLayers />
        <HotspotConfig />
        <SortOrder />
        <Filter />
        <ThresholdAndWeights />
        <AdvancedQuery />
      </div>
      <div className={` ${sidebarStyle.footer}`}>
        <ButtonInput 
          label={t("sidebar.label.runQuery")}
          onClick={handleRunQueryClick}
        />
        <span className={`font-size-xs font-light font-family-header ${sidebarStyle.subRunQuery}`}>
          {t("sidebar.text.subRunQuery")}
        </span>
      </div>
    </div>
  );
};

export default Sidebar;
