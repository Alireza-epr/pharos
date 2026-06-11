import { Activity, useEffect } from 'react';
import appStyle from "./App.module.scss"
import Sidebar from '../components/sidebar/Sidebar';
import MapView from '../components/map/MapView';
import BottomPanel from '../components/layout/BottomPanel';
import DetailDrawer from '../components/drawer/DetailDrawer';
import HeaderPanel from '../components/layout/HeaderPanel';
import { useEventStore } from '../stores/eventStore';
import { useAppStore } from '../stores/appStore';

export interface IAppProps {}

const App = (props: IAppProps) => {
  const theme = useAppStore((state) => state.theme);
  const selectedEvent = useEventStore((state) => state.selectedEvent);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

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
