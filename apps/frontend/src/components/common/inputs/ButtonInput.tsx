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
  testId?: string;
  title?: string;
  className?: string | undefined;
  icon?: boolean;
  hint?: string;
  caveat?: string;
}

const ButtonInput = (props: IButtonInputProps) => {
  return (
    <button
      className={`hover disabled active font-size-xs  ${buttonInputStyle.wrapper} ${props.icon ? buttonInputStyle.iconButton : ''} ${props.className ?? ''}`}
      data-active={props.active}
      data-readonly={props.readOnly}
      //data-size={props.size}
      data-testid={props.testId}
      title={props.title}
      disabled={props.disabled || props.loading}
      onClick={props.onClick}
    >
      {props.caveat && (
        <span className={`font-size-sm caveat`} title={props.caveat}>
          ⚠
        </span>
      )}
      {props.hint && (
        <span className={`font-size-sm hint`} title={props.hint}>
          ℹ
        </span>
      )}
      {props.loading ? <Loading size={ELoadingSize.sm} /> : props.label}
    </button>
  );
};

export default ButtonInput;
