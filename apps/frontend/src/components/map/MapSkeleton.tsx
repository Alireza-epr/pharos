import Loading from '../common/Loading';
import { ELoadingSize } from '../../helpers/types/generalTypes';
import { useTranslator } from '../../hooks/translator';
import mapSkeleton from './MapSkeleton.module.scss';

export interface IMapSkeletonProps {}

/**
 * Suspense fallback for the lazy MapCanvas chunk. Fills the map area while the
 * engine chunk downloads, so the rest of the app shell stays interactive.
 */
const MapSkeleton = () => {
  const { t } = useTranslator();

  return (
    <div className={` ${mapSkeleton.wrapper}`}>
      <Loading size={ELoadingSize.md} text={t('map.loading')} />
    </div>
  );
};

export default MapSkeleton;
