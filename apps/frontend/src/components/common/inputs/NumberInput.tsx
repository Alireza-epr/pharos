import numberInputStyle from './NumberInput.module.scss';

export interface INumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  placeholder?: string;
}

const NumberInput = (props: INumberInputProps) => {
  return (
    <input
      className={`font-size-sm disabled hover ${numberInputStyle.input}`}
      type="number"
      value={props.value}
      min={props.min}
      max={props.max}
      step={props.step}
      disabled={props.disabled}
      placeholder={props.placeholder}
      onChange={(e) => props.onChange(Number(e.target.value))}
    />
  );
};

export default NumberInput;
