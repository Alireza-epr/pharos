import buttonInputStyle from './ButtonInput.module.scss';

export interface IButtonInputProps {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

const ButtonInput = (props: IButtonInputProps) => {
  return (
    <button
      className={`hover disabled active font-size-sm ${buttonInputStyle.wrapper}`}
      data-active={props.active}
      disabled={props.disabled}
      onClick={props.onClick}
    >
      {props.label}
    </button>
  );
};

export default ButtonInput;
