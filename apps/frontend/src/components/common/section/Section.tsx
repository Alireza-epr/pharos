import { ReactNode, useState, Activity, MouseEvent, KeyboardEvent } from 'react';
import sectionStyle from './Section.module.scss';
import { useTranslator } from '../../../hooks/translator';

export interface ISectionProps {
  title: string;
  collapsible?: boolean;
  children: ReactNode;
  testId?: string;
  showImport?: boolean;
  showExport?: boolean;
  onImport?: () => void;
  onExport?: () => void;
}

const Section = (props: ISectionProps) => {
  const { t } = useTranslator();
  const [open, setOpen] = useState(props.collapsible);

  const handleImport = (e: MouseEvent) => {
    e.stopPropagation();
    if (props.onImport) props.onImport();
  };

  const handleExport = (e: MouseEvent) => {
    e.stopPropagation();
    if (props.onExport) props.onExport();
  };

  const isToggle = props.collapsible !== undefined;

  const handleHeaderKeyDown = (e: KeyboardEvent) => {
    if (!isToggle) return;
    // Space's default is scrolling the page -- suppress it like a real button.
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen((prev) => !prev);
    }
  };

  return (
    <div className={` ${sectionStyle.wrapper}`}>
      <div
        className={`${isToggle ? 'focus' : ''} ${sectionStyle.header} ${isToggle ? sectionStyle.clickable : ''}`}
        onClick={isToggle ? () => setOpen((prev) => !prev) : undefined}
        onKeyDown={isToggle ? handleHeaderKeyDown : undefined}
        role={isToggle ? 'button' : undefined}
        tabIndex={isToggle ? 0 : undefined}
        aria-expanded={isToggle ? open : undefined}
        data-testid={props.testId}
      >
        <span className={`font-size-xs ${sectionStyle.title} truncate`}>
          {props.title}
        </span>
        <div className={sectionStyle.actionsWrapper}>
          {props.showImport && (
            <button
              type="button"
              className={`focus font-size-l ${sectionStyle.iconButton}`}
              onClick={handleImport}
              title={t('general.label.import')}
              aria-label={t('general.label.import')}
            >
              ↧
            </button>
          )}
          {props.showExport && (
            <button
              type="button"
              className={`focus font-size-l ${sectionStyle.iconButton}`}
              onClick={handleExport}
              title={t('general.label.export')}
              aria-label={t('general.label.export')}
            >
              ↥
            </button>
          )}
          {props.collapsible !== undefined && (
            <span
              className={`font-size-base ${sectionStyle.chevron} ${open ? sectionStyle.open : ''}`}
            >
              ▾
            </span>
          )}
        </div>
      </div>
      <div className={` ${sectionStyle.divider}`}></div>
      <Activity
        children={
          <div className={` ${sectionStyle.body}`}>{props.children}</div>
        }
        mode={props.collapsible !== undefined && !open ? 'hidden' : 'visible'}
      />
    </div>
  );
};

export default Section;
