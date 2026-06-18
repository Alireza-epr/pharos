import { lazy, Suspense } from 'react';
import mapViewStyle from './MapView.module.scss';
import MapErrorBoundary from './MapErrorBoundary';
import MapSkeleton from './MapSkeleton';

// Code-split the map engine out of the initial bundle. The shell below ships
// with the app; MapCanvas (and everything heavy it will import) loads on demand.
const MapCanvas = lazy(() => import('./MapCanvas'));

export interface IMapViewProps { }

const MapView = () => (
  <div className={` ${mapViewStyle.wrapper}`}>
    <MapErrorBoundary>
      <Suspense fallback={<MapSkeleton />}>
        <MapCanvas />
      </Suspense>
    </MapErrorBoundary>
  </div>
);

export default MapView;
