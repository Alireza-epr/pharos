import barInputStyle from './BarInput.module.scss';
import NumberInput from './NumberInput';

export interface IBarInputProps {
  label?: string;
  value: number | null;
}

const BarInput = (props: IBarInputProps) => {
  return (
    <div className={barInputStyle.wrapper}>
      {props.label && (
        <span className={`font-size-xs ${barInputStyle.label}`}>
          {props.label}
        </span>
      )}
      <div className={barInputStyle.row}>
        <div className={barInputStyle.track}>
          <div
            className={`${barInputStyle.fill}`}
            style={{ width: `${(props.value ?? 0) * 100}%` }}
          />
        </div>
        <NumberInput value={props.value ?? 0} readOnly />
      </div>
    </div>
  );
};

export default BarInput;
