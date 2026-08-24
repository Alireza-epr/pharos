import { useEffect } from 'react';
import appStyle from './App.module.scss';
import Sidebar from '../components/sidebar/Sidebar';
import MapView from '../components/map/MapView';
import BottomPanel from '../components/layout/BottomPanel';
import DetailDrawer from '../components/sidebar/DetailDrawer';
import HeaderPanel from '../components/layout/HeaderPanel';
import SidebarToggleInput from '../components/common/inputs/SidebarToggleInput';
import { useAppStore } from '../stores/appStore';
import { useLoginStore } from '../stores/loginStore';
import { useSidebarStore } from '../stores/sidebarStore';
import { useHealth } from '../hooks/system';
import {
  useHydrateConfigFromURL,
  useSyncConfigToURL,
} from '../hooks/useURLConfigSync';
import Login from '../components/layout/Login';
import { useDetailStore } from '../stores/detailStore';

export interface IAppProps {}

const App = () => {
  const theme = useAppStore((state) => state.theme);

  const isAuthenticated = useLoginStore((s) => !!s.accessToken);

  const detailCollapsed = useDetailStore((s) => s.collapsed);
  const setDetailCollapsed = useDetailStore((s) => s.setCollapsed);

  const sidebarCollapsed = useSidebarStore((s) => s.collapsed);
  const setSidebarCollapsed = useSidebarStore((s) => s.setCollapsed);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useHealth(isAuthenticated);

  useHydrateConfigFromURL(isAuthenticated);
  useSyncConfigToURL(isAuthenticated);

  if (!isAuthenticated) return <Login />;

  return (
    <div className={` ${appStyle.layout}`}>
      <header>
        <HeaderPanel />
      </header>

      <div className={` ${appStyle.content}`}>
        <aside data-collapsed={sidebarCollapsed}>
          <Sidebar />
        </aside>

        {sidebarCollapsed && (
          <SidebarToggleInput
            collapsed={sidebarCollapsed}
            onClick={() => setSidebarCollapsed(false)}
            className={appStyle.reopenButton}
          />
        )}

        <main className={` ${sidebarCollapsed ? 'margin-left' : ''}`}>
          <MapView />
        </main>

        <aside data-collapsed={detailCollapsed}>
          <DetailDrawer />
        </aside>

        {detailCollapsed && (
          <SidebarToggleInput
            collapsed={detailCollapsed}
            onClick={() => setDetailCollapsed(false)}
            className={appStyle.reopenButtonDetail}
            reversed
          />
        )}
      </div>

      <BottomPanel />
    </div>
  );
};

export default App;
