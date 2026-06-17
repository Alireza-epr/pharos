import { ReactNode, useState, Activity } from 'react';
import sectionStyle from './Section.module.scss';

export interface ISectionProps {
  title: string;
  collapsible?: boolean;
  children: ReactNode;
}

const Section = (props: ISectionProps) => {
  const [open, setOpen] = useState(props.collapsible);

  return (
    <div className={` ${sectionStyle.wrapper}`} >
      <div
        className={`${sectionStyle.header} ${props.collapsible !== undefined ? sectionStyle.clickable : ''}`}
        onClick={props.collapsible !== undefined ? () => setOpen((prev) => !prev) : undefined}
      >
        <span className={`font-size-xs ${sectionStyle.title} truncate`}>{props.title}</span>
        {props.collapsible !== undefined && (
          <span className={`font-size-base ${sectionStyle.chevron} ${open ? sectionStyle.open : ''}`}>▾</span>
        )}
      </div>
      <div className={` ${sectionStyle.divider}`}></div>
      <Activity children={<div className={` ${sectionStyle.body}`}>{props.children}</div>} mode={props.collapsible !== undefined && !open ? "hidden" : "visible"}/>
    </div>
  );
};

export default Section;
