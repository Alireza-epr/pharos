import sidebarStyle from './Sidebar.module.scss';
import ButtonInput from '../common/inputs/ButtonInput';
import SidebarToggleInput from '../common/inputs/SidebarToggleInput';
import { useTranslator } from '../../hooks/translator';
import { useSidebarStore } from '../../stores/sidebarStore';
import { ESidebarTab } from '../../helpers/enum/storeEnum';
import ReportTab from './tabs/ReportTab';
import VesselTab from './tabs/VesselTab';
import EventTab from './tabs/EventTab';
import SectionInputGroup from '../common/section/SectionInputGroup';

export interface ISidebarProps {}

const Sidebar = () => {
  const { t } = useTranslator();

  const activeTab = useSidebarStore((s) => s.activeTab);
  const setActiveTab = useSidebarStore((s) => s.setActiveTab);
  const collapsed = useSidebarStore((s) => s.collapsed);
  const setCollapsed = useSidebarStore((s) => s.setCollapsed);

  return (
    <div className={` ${sidebarStyle.wrapper} margin-left`}>
      <SectionInputGroup direction="row">
        <ButtonInput
          label={t('sidebar.tab.report')}
          active={activeTab === ESidebarTab.report}
          onClick={() => setActiveTab(ESidebarTab.report)}
          size="sm"
        />
        <ButtonInput
          label={t('sidebar.tab.vessel')}
          active={activeTab === ESidebarTab.vessel}
          onClick={() => setActiveTab(ESidebarTab.vessel)}
          size="sm"
          testId="sidebar-tab-vessel"
        />
        <ButtonInput
          label={t('sidebar.tab.event')}
          active={activeTab === ESidebarTab.event}
          onClick={() => setActiveTab(ESidebarTab.event)}
          size="sm"
        />
        <SidebarToggleInput
          collapsed={collapsed}
          onClick={() => setCollapsed((prev) => !prev)}
        />
      </SectionInputGroup>

      {activeTab === ESidebarTab.report && <ReportTab />}
      {activeTab === ESidebarTab.vessel && <VesselTab />}
      {activeTab === ESidebarTab.event && <EventTab />}
    </div>
  );
};

export default Sidebar;
