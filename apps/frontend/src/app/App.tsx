import { Activity, useEffect } from 'react';
import appStyle from "./App.module.scss"
import Sidebar from '../components/sidebar/Sidebar';
import MapView from '../components/map/MapView';
import BottomPanel from '../components/layout/BottomPanel';
import DetailDrawer from '../components/sidebar/DetailDrawer';
import HeaderPanel from '../components/layout/HeaderPanel';
import { useEventStore } from '../stores/eventStore';
import { useAppStore } from '../stores/appStore';
import { log_frontend } from '@packages/utils';
import { ELogType } from '@packages/enum';

export interface IAppProps { }

const App = () => {
  const theme = useAppStore((state) => state.theme);
  const setBackendStatus = useAppStore(s => s.setBackendStatus)

  const selectedEvent = useEventStore((state) => state.selectedEvent);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const controller = new AbortController();
    const checkBackendStatus = async () => {
      try {
        const resp = await fetch(`${import.meta.env.VITE_BASE_API_URL}/v1/system/health`, {
          signal: controller.signal, //a read-only object passed to fetch
        });
        if (!resp.ok) throw new Error("[App] Backend health check failed");
        const respJSON = await resp.json();
        if (!respJSON.success) throw new Error("[App] Backend health check failed");
        setBackendStatus(true);
      } catch (err) {
        // When controller.abort() is called, the fetch throws an AbortError immediately. So no further code is executed
        if ((err as Error).name === "AbortError") return;
        log_frontend(err, ELogType.error);
        setBackendStatus(false);
      }
    };

    checkBackendStatus();
    const interval = setInterval(checkBackendStatus, 30000);
    return () => {
      clearInterval(interval);
      controller.abort();  //cancels anything listening to that signal
    };
  }, []);

  return (
    <div className={` ${appStyle.layout}`}>
      <header>
        <HeaderPanel />
      </header>

      <div className={` ${appStyle.content}`}>
        <aside>
          <Sidebar />
        </aside>

        <main>
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
