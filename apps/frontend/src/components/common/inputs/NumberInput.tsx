import { useContext } from 'react';
import numberInputStyle from './NumberInput.module.scss';
import { SectionLabelContext } from '../../../contexts/sectionLabelContext';

export type TNumberInputDirection = 'row' | 'column';

export interface INumberInputProps {
  value: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  label?: string;
  ariaLabel?: string | undefined;
  direction?: TNumberInputDirection;
}

const NumberInput = (props: INumberInputProps) => {
  const interactionClasses = props.readOnly ? '' : 'focus hover';
  const sectionLabel = useContext(SectionLabelContext);

  return (
    <div
      className={numberInputStyle.wrapper}
      data-direction={props.direction ?? 'column'}
    >
      {props.label && (
        <span className={`font-size-sm ${numberInputStyle.label}`}>
          {props.label}
        </span>
      )}
      <input
        className={`font-size-sm disabled ${interactionClasses} ${numberInputStyle.input} ${props.readOnly ? numberInputStyle.readonly : ''}`}
        type="number"
        value={props.value}
        min={props.min}
        max={props.max}
        step={props.step}
        disabled={props.disabled}
        placeholder={props.placeholder}
        readOnly={props.readOnly}
        aria-label={props.ariaLabel ?? props.label ?? sectionLabel}
        onChange={(e) =>
          props.onChange && props.onChange(Number(e.target.value))
        }
      />
    </div>
  );
};

export default NumberInput;
