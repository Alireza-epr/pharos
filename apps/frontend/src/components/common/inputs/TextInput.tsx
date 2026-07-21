import { useContext, useState } from 'react';
import textInputStyle from './TextInput.module.scss';
import { SectionLabelContext } from '../../../contexts/sectionLabelContext';

export interface ITextInputProps {
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  title?: string;
  type?: 'text' | 'password';
  disabled?: boolean;
  readOnly?: boolean;
  copiable?: boolean;
  copyLabel?: string;
  // Value placed on the clipboard when copied; defaults to `value`. Useful when
  // the displayed text is truncated but the full value should be copied.
  copyValue?: string;
  caveat?: string;
  fullWidth?: boolean;
  testId?: string;
}

const COPIED_FEEDBACK_MS = 1500;

const CopyIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const CheckIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const TextInput = (props: ITextInputProps) => {
  const [copied, setCopied] = useState(false);
  const sectionLabel = useContext(SectionLabelContext);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(props.copyValue ?? props.value);
      setCopied(true);
      setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
    } catch {
      setCopied(false);
    }
  };

  const type = props.type ?? 'text';
  // The global `hover` class styles non-text inputs like buttons, so keep it for
  // text fields only; password fields use focus styling alone.
  const interactionClasses = props.readOnly
    ? ''
    : type === 'text'
      ? 'focus hover'
      : 'focus';

  const input = (
    <input
      className={`font-size-sm disabled ${interactionClasses} ${textInputStyle.input} ${props.readOnly ? textInputStyle.readonly : ''} ${props.fullWidth ? 'full-width' : ''}`}
      type={type}
      value={props.value}
      disabled={props.disabled}
      readOnly={props.readOnly}
      placeholder={props.placeholder}
      data-testid={props.testId}
      // When a title is set the field is wrapped in a <label>; otherwise fall
      // back to the SectionItem title/placeholder so it stays labelled (a11y).
      aria-label={props.title ? undefined : (sectionLabel ?? props.placeholder)}
      onChange={(e) => props.onChange && props.onChange(e.target.value)}
    />
  );

  const control = !props.copiable ? (
    input
  ) : (
    <div className={textInputStyle.wrapper}>
      {input}
      <button
        className={`hover disabled font-size-xs  ${textInputStyle.copyButton}`}
        type="button"
        onClick={handleCopy}
        disabled={props.disabled}
        aria-label={props.copyLabel ?? 'Copy'}
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
      </button>
    </div>
  );

  if (!props.title) return control;

  return (
    <label className={textInputStyle.field}>
      <span className={`font-size-sm ${textInputStyle.title} truncate`}>
        {props.title}
        {props.caveat && (
          <span className={`font-size-sm caveat`} title={props.caveat}>
            ⚠
          </span>
        )}
      </span>
      {control}
    </label>
  );
};

export default TextInput;
