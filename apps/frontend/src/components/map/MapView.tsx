import mapViewStyle from './MapView.module.scss';

export interface IMapViewProps {}

const MapView = (props: IMapViewProps) => {
  return <div className={` ${mapViewStyle.wrapper}`}></div>;
};

export default MapView;
