import React from 'react';
import loadingStyle from './Loading.module.scss';
import { ELoadingSize } from '../../helpers/types/generalTypes';

export interface ILoadingProps {
  text?: string;
  size: ELoadingSize;
  marginVertical?: React.CSSProperties['margin'];
}

const Loading = (props: ILoadingProps) => {
  return (
    <div className={` ${loadingStyle.wrapper}`} data-testid="main-loading">
      {props.text && (
        <span className={`font-size-xs font-light font-family-header sub-text`}>
          {props.text}
        </span>
      )}
      <div
        className={` ${loadingStyle.loader} ${props.size ? loadingStyle[props.size] : ''}`}
        style={{
          marginTop: props.marginVertical ? `${props.marginVertical}` : '',
          marginBottom: props.marginVertical ? `${props.marginVertical}` : '',
        }}
      />
    </div>
  );
};

export default Loading;
