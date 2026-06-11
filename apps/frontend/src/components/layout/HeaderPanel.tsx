import { useAppStore } from "@/stores/appStore";
import styles from "./HeaderPanel.module.scss";
import { ETheme } from "@/helpers/enum/storeEnum";

export interface HeaderPanelProps {}

const HeaderPanel = (props: HeaderPanelProps) => {

  const theme = useAppStore( (s) => s.theme )
  const setTheme = useAppStore( (s) => s.setTheme )
  const toggleTheme = () => {
    setTheme( prev => prev === ETheme.dark ? ETheme.light : ETheme.dark )
  }
  
  return (
    <div className={styles.wrapper}>

      <span className={styles.logo}>PHAROS</span>
      <span className={styles.logoSub}>Maritime SAR–AIS Analysis</span>

      <div className={styles.actions}>
        <span className={styles.chip}>Analyst</span>
        <span className={styles.chip}>English</span>
        <span className={styles.chip} onClick={toggleTheme}>
          {theme === ETheme.dark ? 'Light' : 'Dark'}
        </span>
      </div>

    </div>
  );
};

export default HeaderPanel;
