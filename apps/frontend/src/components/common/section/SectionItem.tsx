import { ReactNode } from 'react';
import sectionItemStyle from './SectionItem.module.scss';

export interface ISectionItemProps {
  title: string;
  children: ReactNode;
}

const SectionItem = (props: ISectionItemProps) => {
  return (
    <div className={` ${sectionItemStyle.wrapper}`}>
      <span className={`font-size-sm ${sectionItemStyle.label}`}>{props.title}</span>
      <div className={` ${sectionItemStyle.content}`}>{props.children}</div>
    </div>
  );
};

export default SectionItem;
