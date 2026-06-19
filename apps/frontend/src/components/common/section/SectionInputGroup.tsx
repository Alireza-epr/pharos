import { ReactNode } from 'react';
import sectionInputGroupStyle from './SectionInputGroup.module.scss';

export const ESectionGroupDirection = {
  row: 'row',
  column: 'column',
} as const;
export type TSectionGroupDirection =
  (typeof ESectionGroupDirection)[keyof typeof ESectionGroupDirection];

export interface ISectionInputGroupProps {
  direction?: TSectionGroupDirection;
  children: ReactNode;
  tab?: boolean;
  grow?: boolean;
}

const SectionInputGroup = (props: ISectionInputGroupProps) => {
  return (
    <div
      className={` ${sectionInputGroupStyle.wrapper} ${props.tab ? 'margin-left' : ''} ${props.grow ? 'flex-grow' : ''}`}
      data-direction={props.direction}
    >
      {props.children}
    </div>
  );
};

export default SectionInputGroup;
