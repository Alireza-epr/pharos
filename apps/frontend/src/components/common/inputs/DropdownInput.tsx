import {
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type ReactElement,
} from 'react';

import dropdownInputStyle from './DropdownInput.module.scss';
import { SectionLabelContext } from '../../../contexts/sectionLabelContext';
import { useTranslator } from '../../../hooks/translator';

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
  // Swaps the native <select> for a filterable combobox -- meant for option
  // lists too long to scan natively (e.g. MPA's 13k+ regions). Single-select
  // only; `multiple` always falls back to the native control.
  searchable?: boolean;
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

// Caps how many filtered matches render at once -- MPA alone is 13k+ options,
// so even a lightly-filtered query must never dump the whole list into the
// DOM. Options are otherwise unsorted (whatever order the backend returned),
// so this is just a slice, not a "top N best matches" ranking.
const MAX_VISIBLE_OPTIONS = 50;

const SearchableSelect = <T extends string | number>(
  props: ISingleDropdownInputProps<T> & { accessibleName?: string | undefined },
) => {
  const { t } = useTranslator();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlighted, setHighlighted] = useState(0);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // Precompute lowercase labels once per options change, not once per
  // keystroke -- the MPA list alone is 13k+ entries.
  const searchableOptions = useMemo(
    () =>
      props.options.map((o) => ({ ...o, lowerLabel: o.label.toLowerCase() })),
    [props.options],
  );

  const allMatches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? searchableOptions.filter((o) => o.lowerLabel.includes(q))
      : searchableOptions;
  }, [searchableOptions, query]);
  const filtered = allMatches.slice(0, MAX_VISIBLE_OPTIONS);
  const truncatedCount = allMatches.length - filtered.length;

  const selected = props.options.find((o) => o.value === props.value);

  // Closes on a click anywhere outside the field, in addition to onBlur below
  // (which covers keyboard-driven focus loss, e.g. Tab).
  useEffect(() => {
    if (!isOpen) return;
    const onDocMouseDown = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, [isOpen]);

  const openWithFreshQuery = () => {
    setIsOpen(true);
    setQuery('');
    setHighlighted(0);
  };

  const commit = (value: T) => {
    props.onChange(value);
    setIsOpen(false);
    setQuery('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault();
        openWithFreshQuery();
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const opt = filtered[highlighted];
      if (opt) commit(opt.value);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setQuery('');
    }
  };

  const displayValue = isOpen ? query : (selected?.label ?? '');

  return (
    <div className={dropdownInputStyle.comboboxWrapper} ref={wrapperRef}>
      <input
        className={`font-size-xs disabled focus hover ${dropdownInputStyle.comboboxInput}`}
        type="text"
        role="combobox"
        aria-expanded={isOpen}
        aria-label={props.accessibleName}
        placeholder={props.placeholder}
        disabled={props.disabled}
        data-testid={props.testId}
        value={displayValue}
        onFocus={openWithFreshQuery}
        onBlur={() => {
          setIsOpen(false);
          setQuery('');
        }}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
          setHighlighted(0);
        }}
        onKeyDown={handleKeyDown}
      />
      {isOpen && (
        <ul
          className={`scrollbar ${dropdownInputStyle.comboboxList}`}
          role="listbox"
        >
          {filtered.length === 0 && (
            <li className={`font-size-xs ${dropdownInputStyle.comboboxEmpty}`}>
              {t('general.text.noMatchesFound')}
            </li>
          )}
          {filtered.map((opt, i) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={opt.value === props.value}
              className={`font-size-xs ${dropdownInputStyle.comboboxOption} ${
                i === highlighted
                  ? dropdownInputStyle.comboboxOptionHighlighted
                  : ''
              }`}
              // mousedown (not click), with preventDefault, fires before the
              // input would blur -- so picking an option never races the
              // outside-click/blur handlers into closing the list first.
              onMouseDown={(e) => {
                e.preventDefault();
                commit(opt.value);
              }}
              onMouseEnter={() => setHighlighted(i)}
            >
              {opt.label}
            </li>
          ))}
          {truncatedCount > 0 && (
            <li
              className={`font-size-xs ${dropdownInputStyle.comboboxTruncated}`}
            >
              {t('general.text.moreMatchesRefine', {
                count: String(truncatedCount),
              })}
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

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
      {!props.multiple && props.searchable ? (
        <SearchableSelect {...props} accessibleName={accessibleName} />
      ) : (
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
      )}
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
