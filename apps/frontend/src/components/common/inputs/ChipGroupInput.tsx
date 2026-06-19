import ButtonInput from './ButtonInput';
import chipGroupStyle from './ChipGroupInput.module.scss';

export interface IChipGroupInputProps<T extends string> {
  values: T[];
  active?: T[];
  onToggle?: (value: T) => void;
  variant?: string;
  readOnly?: boolean;
  disabled?: boolean
}

const ChipGroupInput = <T extends string>(props: IChipGroupInputProps<T>) => {
  return (
    <div className={chipGroupStyle.chips}>
      {props.values.map((value) => (
        <ButtonInput
          key={value}
          label={value}
          size="sm"
          active={props.active ? props.active.includes(value) : false}
          onClick={() => props.onToggle && props.onToggle(value)}
          readOnly={props.readOnly ?? false}
          disabled={props.disabled ?? false}
        />
      ))}
    </div>
  );
};

export default ChipGroupInput;
