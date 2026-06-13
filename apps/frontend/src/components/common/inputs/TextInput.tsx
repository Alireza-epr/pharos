import textInputStyle from './TextInput.module.scss';

export interface ITextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const TextInput = (props: ITextInputProps) => {
  return (
    <input
      className={`font-size-sm disabled focus hover ${textInputStyle.input}`}
      type="text"
      value={props.value}
      disabled={props.disabled}
      placeholder={props.placeholder}
      onChange={(e) => props.onChange(e.target.value)}
    />
  );
};

export default TextInput;
