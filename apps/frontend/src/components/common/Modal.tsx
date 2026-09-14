import { ReactNode, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslator } from '../../hooks/translator';
import modalStyle from './Modal.module.scss';

export interface IModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /** 'default' (90vw/85vh, e.g. the maximized detections table) or a small, content-sized centered box. */
  size?: 'default' | 'small';
}

// Same rough set most focus-trap implementations use -- good enough for the
// buttons/inputs/links this app's modals actually contain.
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const Modal = (props: IModalProps) => {
  const { t } = useTranslator();
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Escape closes; Tab/Shift+Tab wraps within the dialog instead of escaping
  // to whatever's behind it (a keyboard user must never be able to tab onto
  // a control hidden behind the overlay).
  useEffect(() => {
    if (!props.open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        props.onClose();
        return;
      }
      if (e.key !== 'Tab' || !dialogRef.current) return;

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      );
      if (focusable.length === 0) return;

      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [props.open, props.onClose]);

  // Opening must move focus into the dialog (never leave it on a now-hidden
  // trigger), and closing must give it back -- otherwise keyboard focus is
  // silently lost on both ends of the interaction.
  useEffect(() => {
    if (!props.open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();

    return () => previouslyFocused.current?.focus();
  }, [props.open]);

  if (!props.open) return null;

  return createPortal(
    <div className={` ${modalStyle.overlay}`} onClick={props.onClose}>
      <div
        ref={dialogRef}
        className={`${modalStyle.dialog} ${props.size === 'small' ? modalStyle.small : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={props.title}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={` ${modalStyle.header}`}>
          {props.title && (
            <span
              className={`font-size-sm font-bold font-family-header ${modalStyle.title}`}
            >
              {props.title}
            </span>
          )}
          <button
            className={`hover active focus ${modalStyle.closeButton}`}
            onClick={props.onClose}
            aria-label={t('general.action.close')}
            data-testid="modal-close-button"
          >
            ✕
          </button>
        </div>
        <div className={`scrollbar ${modalStyle.body}`}>{props.children}</div>
      </div>
    </div>,
    document.body,
  );
};

export default Modal;
