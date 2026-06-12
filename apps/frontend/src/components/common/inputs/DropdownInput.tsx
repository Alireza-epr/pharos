import dropdownInputStyle from './DropdownInput.module.scss';

export interface IDropdownOption<T> {
  label: string;
  value: T;
}

export interface IDropdownInputProps<T> {
  value: T;
  options: IDropdownOption<T>[];
  onChange: (value: T) => void;
  placeholder?: string;
  disabled?: boolean;
  onClear?: () => void;
  clearLabel?: string;
}

const DropdownInput = <T extends string | number>(props: IDropdownInputProps<T>) => {
  return (
    <div className={dropdownInputStyle.wrapper}>
      <select
        className={`hover disabled font-size-sm ${dropdownInputStyle.select}`}
        value={props.value}
        disabled={props.disabled}
        onChange={(e) => props.onChange(e.target.value as T)}
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
