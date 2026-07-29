import { useContext, type ChangeEvent, type ReactElement } from 'react';

import dropdownInputStyle from './DropdownInput.module.scss';
import { SectionLabelContext } from '../../../contexts/sectionLabelContext';

export interface IDropdownOption<T> {
  label: string;
  value: T;
}

interface IDropdownInputBaseProps<T> {
  options: IDropdownOption<T>[];
  placeholder?: string;
  title?: string;
  disabled?: boolean;
  onClear?: () => void;
  clearLabel?: string;
  hint?: string;
  testId?: string;
}

interface ISingleDropdownInputProps<T> extends IDropdownInputBaseProps<T> {
  multiple?: false;
  value: T;
  onChange: (value: T) => void;
}

interface IMultiDropdownInputProps<T> extends IDropdownInputBaseProps<T> {
  multiple: true;
  value: T[];
  onChange: (value: T[]) => void;
}

export type IDropdownInputProps<T> =
  | ISingleDropdownInputProps<T>
  | IMultiDropdownInputProps<T>;

const DropdownInput = <T extends string | number>(
  props: IDropdownInputProps<T>,
) => {
  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    if (props.multiple) {
      props.onChange(
        Array.from(e.target.selectedOptions, (opt) => opt.value as T),
      );
    } else {
      props.onChange(e.target.value as T);
    }
  };

  const isEmpty = props.multiple ? props.value.length === 0 : !props.value;

  // The visible name is the wrapping <label> title when present; otherwise fall
  // back to the placeholder or the enclosing SectionItem title so the native
  // <select> always has an accessible name (a11y: select-name).
  const sectionLabel = useContext(SectionLabelContext);
  const accessibleName = props.title ?? props.placeholder ?? sectionLabel;

  const control = (
    <div className={dropdownInputStyle.wrapper}>
      <select
        className={`${!props.multiple ? 'hover' : ''} disabled focus font-size-xs  ${dropdownInputStyle.select}`}
        value={props.value as string | string[]}
        multiple={props.multiple}
        disabled={props.disabled}
        aria-label={accessibleName}
        data-testid={props.testId}
        onChange={handleChange}
      >
        {!props.multiple && props.placeholder && (
          <option
            value=""
            disabled
            hidden
            className={` ${props.multiple ? 'hover' : ''}`}
          >
            {props.placeholder}
          </option>
        )}
        {props.options.map((opt) => (
          <option
            key={opt.value}
            value={opt.value}
            className={` ${props.multiple ? 'hover' : ''}`}
          >
            {opt.label}
          </option>
        ))}
      </select>
      {props.onClear && (
        <button
          className={`font-size-sm ${dropdownInputStyle.clearButton}`}
          type="button"
          onClick={props.onClear}
          disabled={isEmpty}
        >
          {props.clearLabel ?? '×'}
        </button>
      )}
    </div>
  );

  if (!props.title) return control;

  return (
    <label className={dropdownInputStyle.field}>
      <span
        className={`font-size-sm ${dropdownInputStyle.title} truncate`}
        title={props.hint}
      >
        {props.title}
        {props.hint && (
          <span className={`font-size-sm hint`} title={props.hint}>
            ℹ
          </span>
        )}
      </span>
      {control}
    </label>
  );
};

// Expose overload signatures so `T` is inferred from each variant on its own.
// Inferring `T` through the `IDropdownInputProps<T>` union is ambiguous — the
// single variant matches a `value: ECountryFlag[]` as `T = ECountryFlag[]` while
// the multi variant matches it as `T = ECountryFlag` — so TS falls back to the
// `string | number` constraint. Overloads are resolved independently, avoiding it.
interface IDropdownInputComponent {
  <T extends string | number>(
    props: ISingleDropdownInputProps<T>,
  ): ReactElement | null;
  <T extends string | number>(
    props: IMultiDropdownInputProps<T>,
  ): ReactElement | null;
}

export default DropdownInput as IDropdownInputComponent;
