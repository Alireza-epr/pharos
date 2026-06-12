import dateInputStyle from './DateInput.module.scss';

export interface IDateInputProps {
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  disabled?: boolean;
  placeholder?: string;
}

const DateInput = (props: IDateInputProps) => {
  return (
    <input
      className={`font-size-sm ${dateInputStyle.input}`}
      type="date"
      value={props.value}
      min={props.min}
      max={props.max}
      disabled={props.disabled}
      placeholder={props.placeholder}
      onChange={(e) => props.onChange(e.target.value)}
    />
  );
};

export default DateInput;
