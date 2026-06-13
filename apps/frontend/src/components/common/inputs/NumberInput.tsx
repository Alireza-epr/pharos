import numberInputStyle from './NumberInput.module.scss';

export type TNumberInputDirection = 'row' | 'column'

export interface INumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  placeholder?: string;
  label?: string;
  direction?: TNumberInputDirection;
}

const NumberInput = (props: INumberInputProps) => {
  return (
    <div className={numberInputStyle.wrapper} data-direction={props.direction ?? 'column'}>
      {props.label && (
        <span className={`font-size-sm ${numberInputStyle.label}`}>{props.label}</span>
      )}
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
    </div>
  );
};

export default NumberInput;
