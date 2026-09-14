import sidebarStyle from './Sidebar.module.scss';
import { useTranslator } from '../../hooks/translator';
import ButtonInput from '../common/inputs/ButtonInput';
import { EDetailTab } from '@/helpers/enum/storeEnum';
import { useDetailStore } from '@/stores/detailStore';
import SidebarToggleInput from '../common/inputs/SidebarToggleInput';
import DetailTab from './tabs/DetailTab';
import ExportTab from './tabs/ExportTab';
import HistoryTab from './tabs/HistoryTab';
import SectionInputGroup from '../common/section/SectionInputGroup';

const DetailDrawer = () => {
  const { t } = useTranslator();

  const activeTab = useDetailStore((s) => s.activeTab);
  const setActiveTab = useDetailStore((s) => s.setActiveTab);
  const collapsed = useDetailStore((s) => s.collapsed);
  const setCollapsed = useDetailStore((s) => s.setCollapsed);

  return (
    <div className={`${sidebarStyle.wrapper}`}>
      <SectionInputGroup direction="row">
        <SidebarToggleInput
          collapsed={collapsed}
          onClick={() => setCollapsed((prev) => !prev)}
          reversed
        />
        <ButtonInput
          label={t('detailPanel.tab.detail')}
          active={activeTab === EDetailTab.detail}
          onClick={() => setActiveTab(EDetailTab.detail)}
          size="sm"
        />
        <ButtonInput
          label={t('general.label.export')}
          active={activeTab === EDetailTab.export}
          onClick={() => setActiveTab(EDetailTab.export)}
          size="sm"
        />
        <ButtonInput
          label={t('detailPanel.tab.history')}
          active={activeTab === EDetailTab.history}
          onClick={() => setActiveTab(EDetailTab.history)}
          size="sm"
          testId="detail-tab-history"
        />
      </SectionInputGroup>

      {activeTab === EDetailTab.detail && <DetailTab />}
      {activeTab === EDetailTab.export && <ExportTab />}
      {activeTab === EDetailTab.history && <HistoryTab />}
    </div>
  );
};

export default DetailDrawer;
