import { Activity, useEffect } from 'react';
import appStyle from './App.module.scss';
import Sidebar from '../components/sidebar/Sidebar';
import MapView from '../components/map/MapView';
import BottomPanel from '../components/layout/BottomPanel';
import DetailDrawer from '../components/sidebar/DetailDrawer';
import HeaderPanel from '../components/layout/HeaderPanel';
import SidebarToggleInput from '../components/common/inputs/SidebarToggleInput';
import { useEventStore } from '../stores/eventStore';
import { useAppStore } from '../stores/appStore';
import { useLoginStore } from '../stores/loginStore';
import { useSidebarStore } from '../stores/sidebarStore';
import { useHealth } from '../hooks/system';
import Login from '../components/layout/Login';

export interface IAppProps {}

const App = () => {
  const theme = useAppStore((state) => state.theme);

  const isAuthenticated = useLoginStore((s) => !!s.accessToken);

  const selectedEvent = useEventStore((state) => state.selectedEvent);

  const sidebarCollapsed = useSidebarStore((s) => s.collapsed);
  const setSidebarCollapsed = useSidebarStore((s) => s.setCollapsed);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useHealth(isAuthenticated);

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

        <Activity mode={selectedEvent ? 'visible' : 'hidden'}>
          <DetailDrawer />
        </Activity>
      </div>

      <BottomPanel />
    </div>
  );
};

export default App;
