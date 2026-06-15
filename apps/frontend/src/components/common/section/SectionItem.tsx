import { Activity, ReactNode, useState } from 'react';
import sectionItemStyle from './SectionItem.module.scss';

export interface ISectionItemProps {
  title: string;
  children: ReactNode;
  collapsible?: boolean,
  caveat?: string;
  tab?: boolean
}

const SectionItem = (props: ISectionItemProps) => {
  const [open, setOpen] = useState(props.collapsible);

  return (
    <div 
      className={` ${sectionItemStyle.wrapper} ${props.collapsible !== undefined ? sectionItemStyle.clickable : ''} ${props.tab ? 'margin-left' : ''}`}
    >
      <span 
        onClick={props.collapsible !== undefined ? () => setOpen((prev) => !prev) : undefined}
        className={`font-size-sm ${sectionItemStyle.label}`}
      >
        <span>
          {props.title}
          {
            props.caveat && (
              <span className={`font-size-sm ${sectionItemStyle.caveat}`} title={props.caveat}>⚠</span>
            )
          }
        </span> 
        {props.collapsible !== undefined && (
          <span className={`font-size-base ${sectionItemStyle.chevron} ${open ? sectionItemStyle.open : ''}`}>▾</span>
        )}
      </span>
      <Activity children={<div className={` ${sectionItemStyle.content}`}>{props.children}</div>} mode={props.collapsible !== undefined && !open ? "hidden" : "visible"}/>
    </div>
  );
};

export default SectionItem;
