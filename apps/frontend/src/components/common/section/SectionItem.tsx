import { Activity, KeyboardEvent, ReactNode, useState } from 'react';
import sectionItemStyle from './SectionItem.module.scss';
import { SectionLabelContext } from '../../../contexts/sectionLabelContext';

export interface ISectionItemProps {
  title: string;
  children: ReactNode;
  collapsible?: boolean;
  caveat?: string;
  tab?: boolean;
  active?: boolean;
  hint?: string;
}

const SectionItem = (props: ISectionItemProps) => {
  const [open, setOpen] = useState(props.collapsible);
  const isToggle = props.collapsible !== undefined;

  const handleLabelKeyDown = (e: KeyboardEvent) => {
    if (!isToggle) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen((prev) => !prev);
    }
  };

  return (
    <div
      className={` ${sectionItemStyle.wrapper} ${isToggle ? sectionItemStyle.clickable : ''} ${props.tab ? 'margin-left' : ''}`}
    >
      <span
        onClick={isToggle ? () => setOpen((prev) => !prev) : undefined}
        onKeyDown={isToggle ? handleLabelKeyDown : undefined}
        role={isToggle ? 'button' : undefined}
        tabIndex={isToggle ? 0 : undefined}
        aria-expanded={isToggle ? open : undefined}
        className={`${isToggle ? 'focus' : ''} font-size-sm ${sectionItemStyle.label}`}
      >
        <span
          className={`${sectionItemStyle.titleText} truncate active`}
          data-active={props.active}
        >
          {props.title}
          {props.caveat && (
            <span className={`font-size-sm caveat`} title={props.caveat}>
              ⚠
            </span>
          )}
          {props.hint && (
            <span className={`font-size-sm hint`} title={props.hint}>
              ℹ
            </span>
          )}
        </span>
        {props.collapsible !== undefined && (
          <span
            className={`font-size-base ${sectionItemStyle.chevron} ${open ? sectionItemStyle.open : ''}`}
          >
            ▾
          </span>
        )}
      </span>
      <Activity
        children={
          <div className={` ${sectionItemStyle.content}`}>
            <SectionLabelContext.Provider value={props.title}>
              {props.children}
            </SectionLabelContext.Provider>
          </div>
        }
        mode={props.collapsible !== undefined && !open ? 'hidden' : 'visible'}
      />
    </div>
  );
};

export default SectionItem;
