import { useAppStore } from '@/stores/appStore';
import headerPanelStyle from './HeaderPanel.module.scss';
import { ETheme } from '@/helpers/enum/storeEnum';
import { ELanguage } from '@/helpers/enum/translationEnum';
import { useTranslator } from '@/hooks/translator';

export interface IHeaderPanelProps { }

const HeaderPanel = (props: IHeaderPanelProps) => {
  const { t } = useTranslator()
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);

  const language = useAppStore((s) => s.language);
  const setLanguage = useAppStore((s) => s.setLanguage);
  
  const toggleTheme = () => {
    setTheme((prev) => (prev === ETheme.dark ? ETheme.light : ETheme.dark));
  };

  const toggleLanguage = () => {
    setLanguage(language === ELanguage.en ? ELanguage.de : ELanguage.en);
  }

  return (
    <div className={` ${headerPanelStyle.wrapper}`}>
      <div className={` ${headerPanelStyle.logoWrapper}`}>
        <span className={`font-size-base font-bold ${headerPanelStyle.logo}`}>
          {t("general.label.appName")}
        </span>
        <span className={`font-size-xs font-light ${headerPanelStyle.logoSub}`}>
          {t("header.text.subLogo")}
        </span>
      </div>


      <div className={` ${headerPanelStyle.actions}`}>
        <span className={`font-size-xs ${headerPanelStyle.chip}`}>Live</span>
        <span
          className={`font-size-xs ${headerPanelStyle.chip}`}
          onClick={toggleLanguage}
        > 
          {t("header.label.language")} 
        </span>
        <span
          className={`font-size-xs ${headerPanelStyle.chip}`}
          onClick={toggleTheme}
        >
          {theme === ETheme.dark ? t("header.label.light") : t("header.label.dark")}
        </span>
      </div>
    </div>
  );
};

export default HeaderPanel;
