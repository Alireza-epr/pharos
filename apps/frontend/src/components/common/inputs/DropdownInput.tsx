import dropdownInputStyle from './DropdownInput.module.scss';

export interface IDropdownOption {
  label: string;
  value: string;
}

export interface IDropdownInputProps {
  value: string;
  options: IDropdownOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  onClear?: () => void;
  clearLabel?: string;
}

const DropdownInput = (props: IDropdownInputProps) => {
  return (
    <div className={dropdownInputStyle.wrapper}>
      <select
        className={`font-size-sm ${dropdownInputStyle.select}`}
        value={props.value}
        disabled={props.disabled}
        onChange={(e) => props.onChange(e.target.value)}
      >
        {props.placeholder && (
          <option value="" disabled hidden>
            {props.placeholder}
          </option>
        )}
        {props.options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {props.onClear && (
        <button
          className={`font-size-sm ${dropdownInputStyle.clearButton}`}
          type="button"
          onClick={props.onClear}
          disabled={!props.value}
        >
          {props.clearLabel ?? '×'}
        </button>
      )}
    </div>
  );
};

export default DropdownInput;
