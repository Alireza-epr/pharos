import { ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslator } from '../../hooks/translator';
import modalStyle from './Modal.module.scss';

export interface IModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

const Modal = (props: IModalProps) => {
  const { t } = useTranslator();

  useEffect(() => {
    if (!props.open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') props.onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [props.open, props.onClose]);

  if (!props.open) return null;

  return createPortal(
    <div className={` ${modalStyle.overlay}`} onClick={props.onClose}>
      <div
        className={` ${modalStyle.dialog}`}
        role="dialog"
        aria-modal="true"
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
            className={`hover active ${modalStyle.closeButton}`}
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
