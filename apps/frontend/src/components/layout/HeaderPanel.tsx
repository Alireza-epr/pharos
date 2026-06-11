import { useAppStore } from '@/stores/appStore';
import headerPanelStyle from './HeaderPanel.module.scss';
import { ETheme } from '@/helpers/enum/storeEnum';
import { useEventStore } from '@/stores/eventStore';
import { samples } from '@/helpers/fixtures/samples';

export interface IHeaderPanelProps {}

const HeaderPanel = (props: IHeaderPanelProps) => {
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  const setSelectedEvent = useEventStore((s) => s.setSelectedEvent);
  const toggleTheme = () => {
    setTheme((prev) => (prev === ETheme.dark ? ETheme.light : ETheme.dark));
    setSelectedEvent((prev) => (prev ? null : (samples[0] as any)));
  };

  return (
    <div className={` ${headerPanelStyle.wrapper}`}>
      <span className={`font-size-base font-bold ${headerPanelStyle.logo}`}>
        PHAROS
      </span>
      <span className={`font-size-sm font-light ${headerPanelStyle.logoSub}`}>
        Clarity Across SAR and AIS
      </span>

      <div className={` ${headerPanelStyle.actions}`}>
        <span className={`font-size-xs ${headerPanelStyle.chip}`}>Live</span>
        <span className={`font-size-xs ${headerPanelStyle.chip}`}>English</span>
        <span
          className={`font-size-xs ${headerPanelStyle.chip}`}
          onClick={toggleTheme}
        >
          {theme === ETheme.dark ? 'Light' : 'Dark'}
        </span>
      </div>
    </div>
  );
};

export default HeaderPanel;
