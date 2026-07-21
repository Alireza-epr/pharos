import checkboxInputStyle from './CheckboxInput.module.scss';

export interface ICheckboxInputProps {
  label: string;
  checked: boolean;
  title?: string;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}

const CheckboxInput = (props: ICheckboxInputProps) => {
  const control = (
    <label
      className={`hover disabled active font-size-xs  ${checkboxInputStyle.wrapper}`}
      data-disabled={props.disabled}
      data-active={props.checked}
      title={props.label}
    >
      <span className={` ${checkboxInputStyle.box}`}>
        {props.checked && (
          <span className={`font-size-sm ${checkboxInputStyle.tick}`}>✓</span>
        )}
      </span>
      <input
        className={checkboxInputStyle.input}
        type="checkbox"
        checked={props.checked}
        disabled={props.disabled}
        onChange={(e) => props.onChange(e.target.checked)}
      />
      <span className={`hover ${checkboxInputStyle.label} truncate`}>
        {props.label}
      </span>
    </label>
  );

  if (!props.title) return control;

  return (
    <div className={checkboxInputStyle.field}>
      <span className={`font-size-sm ${checkboxInputStyle.title}`}>
        {props.title}
      </span>
      {control}
    </div>
  );
};

export default CheckboxInput;
