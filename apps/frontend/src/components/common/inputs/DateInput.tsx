import { getLocaleISOString } from '@packages/utils';
import dateInputStyle from './DateInput.module.scss';
import { useRef } from 'react';

export interface IDateInputProps {
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  disabled?: boolean;
  placeholder?: string;
}

const DateInput = (props: IDateInputProps) => {
  const dateRef = useRef<HTMLInputElement>(null);
  const isPickerOpen = useRef(false);

  const handleDateClick = () => {
    if (!dateRef.current) return;
    if (isPickerOpen.current) {
      dateRef.current.blur();
      isPickerOpen.current = false;
    } else {
      dateRef.current.showPicker();
      isPickerOpen.current = true;
    }
  };

  const handleBlur = () => {
    isPickerOpen.current = false;
  };

  return (
    <input
      ref={dateRef}
      className={`hover disabled focus font-size-sm ${dateInputStyle.wrapper}`}
      step="1"
      type="datetime-local"
      value={props.value}
      min={props.min ?? '2017-01-01T00:00:00'}
      max={props.max ?? getLocaleISOString(new Date())}
      disabled={props.disabled}
      placeholder={props.placeholder}
      onChange={(e) => props.onChange(e.target.value)}
      onClick={handleDateClick}
      onBlur={handleBlur}
    />
  );
};

export default DateInput;
