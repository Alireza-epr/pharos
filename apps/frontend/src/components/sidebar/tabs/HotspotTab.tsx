import sidebarStyle from '../Sidebar.module.scss';
import { useTranslator } from '../../../hooks/translator';

const HotspotTab = () => {
  const { t } = useTranslator();

  return (
    <div className={`scrollbar ${sidebarStyle.scrollArea}`}>
      <div className={` ${sidebarStyle.emptyState}`}>
        <span className={`font-size-sm font-bold font-family-header`}>
          {t('sidebar.tab.hotspot')}
        </span>
        <span className={`font-size-xs font-light font-family-header`}>
          {t('sidebar.text.comingSoon')}
        </span>
      </div>
    </div>
  );
};

export default HotspotTab;
