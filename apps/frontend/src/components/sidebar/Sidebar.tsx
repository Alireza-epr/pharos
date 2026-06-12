import sidebarStyle from './Sidebar.module.scss';
import AreaOfInterest from "../blocks/AreaOfInterest"
import TimeRange from "../blocks/TimeRange"
import ContextLayers from "../blocks/ContextLayers"
import HotspotConfig from "../blocks/HotspotConfig"
import ButtonInput from '../common/inputs/ButtonInput';
import { useTranslator } from '@/hooks/translator';

export interface ISidebarProps {}

const Sidebar = (_props: ISidebarProps) => {

  const {t} = useTranslator()
  return (
    <div className={` ${sidebarStyle.wrapper}`}>
      <div className={`scrollbar ${sidebarStyle.scrollArea}`}>
        <AreaOfInterest />
        <TimeRange />
        <ContextLayers />
        <HotspotConfig />
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
