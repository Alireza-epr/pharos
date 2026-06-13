import checkboxInputStyle from './CheckboxInput.module.scss';

export interface ICheckboxInputProps {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}

const CheckboxInput = (props: ICheckboxInputProps) => {
  return (
    <label className={`hover disabled active font-size-sm ${checkboxInputStyle.wrapper}`} data-disabled={props.disabled} data-active={props.checked}>
      <span className={` ${checkboxInputStyle.box}`}>
        {props.checked && <span className={`font-size-sm ${checkboxInputStyle.tick}`}>✓</span>}
      </span>
      <input
        className={checkboxInputStyle.input}
        type="checkbox"
        checked={props.checked}
        disabled={props.disabled}
        onChange={(e) => props.onChange(e.target.checked)}
      />
      <span className={`hover ${checkboxInputStyle.label}`}>{props.label}</span>
    </label>
  );
};

export default CheckboxInput;
