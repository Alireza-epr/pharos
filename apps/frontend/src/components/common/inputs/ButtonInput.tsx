import buttonInputStyle from './ButtonInput.module.scss';
import Loading from '../Loading';
import { ELoadingSize } from '../../../helpers/types/generalTypes';

export interface IButtonInputProps {
  label: string;
  active?: boolean;
  disabled?: boolean;
  loading?: boolean;
  size?: 'sm';
  onClick?: () => void;
  readOnly?: boolean;
}

const ButtonInput = (props: IButtonInputProps) => {
  return (
    <button
      className={`hover disabled active font-size-sm ${buttonInputStyle.wrapper}`}
      data-active={props.active}
      data-readonly={props.readOnly}
      data-size={props.size}
      disabled={props.disabled || props.loading}
      onClick={props.onClick}
    >
      {props.loading ? <Loading size={ELoadingSize.sm} /> : props.label}
    </button>
  );
};

export default ButtonInput;
