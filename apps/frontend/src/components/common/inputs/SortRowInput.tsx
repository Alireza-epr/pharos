import DropdownInput, { IDropdownOption } from './DropdownInput';
import ButtonInput from './ButtonInput';
import sortRowStyle from './SortRowInput.module.scss';
import TextInput from './TextInput';
import { useTranslator } from '../../../hooks/translator';

export interface ISortRowInputProps {
  rank: number;
  value: string;
  direction?: 'asc' | 'desc';
  options?: IDropdownOption<string>[];
  onChangeField?: (field: string) => void;
  onToggleDirection?: () => void;
  onRemove: () => void;
}

const SortRowInput = (props: ISortRowInputProps) => {
  const { t } = useTranslator();

  return (
    <div className={sortRowStyle.row}>
      <span className={`font-size-sm ${sortRowStyle.rank}`}>{props.rank}</span>
      <div className={` ${sortRowStyle.field}`}>
        {props.onChangeField && props.options ? (
          <DropdownInput
            value={props.value}
            options={props.options}
            onChange={props.onChangeField}
          />
        ) : (
          <TextInput fullWidth value={props.value} readOnly />
        )}
      </div>
      {props.direction && props.onToggleDirection && (
        <div className={sortRowStyle.action}>
          <ButtonInput
            icon
            label={props.direction === 'desc' ? '↓' : '↑'}
            title={t('sidebar.action.toggleSortDirection')}
            onClick={props.onToggleDirection}
          />
        </div>
      )}
      <div className={sortRowStyle.action}>
        <ButtonInput
          icon
          label="×"
          title={t('general.action.remove')}
          onClick={props.onRemove}
        />
      </div>
    </div>
  );
};

export default SortRowInput;
