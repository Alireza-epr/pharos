import ButtonInput from './ButtonInput';
import chipGroupStyle from './ChipGroupInput.module.scss';

export interface IChipGroupInputProps<T extends string> {
  values: T[];
  active?: T[];
  onToggle?: (value: T) => void;
  variant?: string;
  readOnly?: boolean;
  disabled?: boolean;
  // Per-chip tooltip (native `title`, shown via ButtonInput) -- e.g. a
  // plain-language explanation of a raw reason-code value like
  // `bathymetry_shallow_eez_hotspot`.
  titleFor?: (value: T) => string | undefined;
}

const ChipGroupInput = <T extends string>(props: IChipGroupInputProps<T>) => {
  return (
    <div className={chipGroupStyle.chips}>
      {props.values.map((value) => {
        const title = props.titleFor?.(value);
        return (
          <ButtonInput
            key={value}
            label={value}
            size="sm"
            {...(title ? { title } : {})}
            active={props.active ? props.active.includes(value) : false}
            onClick={() => props.onToggle && props.onToggle(value)}
            readOnly={props.readOnly ?? false}
            disabled={props.disabled ?? false}
          />
        );
      })}
    </div>
  );
};

export default ChipGroupInput;
