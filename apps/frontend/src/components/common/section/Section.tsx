import { ReactNode, useState, Activity } from 'react';
import sectionStyle from './Section.module.scss';

export interface ISectionProps {
  title: string;
  collapsible?: boolean;
  children: ReactNode;
}

const Section = (props: ISectionProps) => {
  const [open, setOpen] = useState(true);

  return (
    <div className={` ${sectionStyle.wrapper}`} >
      <div
        className={`${sectionStyle.header} ${props.collapsible ? sectionStyle.clickable : ''}`}
        onClick={props.collapsible ? () => setOpen((prev) => !prev) : undefined}
      >
        <span className={`font-size-xs ${sectionStyle.title}`}>{props.title}</span>
        {props.collapsible && (
          <span className={`font-size-base ${sectionStyle.chevron} ${open ? sectionStyle.open : ''}`}>▾</span>
        )}
      </div>
      <div className={` ${sectionStyle.divider}`}></div>
      <Activity children={<div className={` ${sectionStyle.body}`}>{props.children}</div>} mode={open ? "visible" : "hidden"}/>
    </div>
  );
};

export default Section;
