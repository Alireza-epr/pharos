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
import { useTranslator } from '@/hooks/translator';

export interface ISidebarProps {}

const Sidebar = () => {

  const {t} = useTranslator()
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
        />
        <span className={`font-size-xs font-light ${sidebarStyle.subRunQuery}`}>
          {t("sidebar.text.subRunQuery")}
        </span>
      </div>
    </div>
  );
};

export default Sidebar;
