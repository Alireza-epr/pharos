import { useAppStore } from '../../stores/appStore';
import { ETheme } from '../../helpers/enum/storeEnum';
import { useTranslator } from '../../hooks/translator';
import logoDark from '../../assets/brand/logo.svg';
import logoLight from '../../assets/brand/logo-light.svg';
import bannerStyle from './Banner.module.scss';

export interface IBannerProps {}

const Banner = () => {
  const { t } = useTranslator();
  const theme = useAppStore((s) => s.theme);

  // logo.svg is drawn for dark surfaces, logo-light.svg for light ones
  const logo = theme === ETheme.dark ? logoDark : logoLight;

  return (
    <div className={` ${bannerStyle.wrapper}`}>
      <img
        className={bannerStyle.image}
        src={logo}
        alt={t('general.label.appName')}
      />
    </div>
  );
};

export default Banner;
