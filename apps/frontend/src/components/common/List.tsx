import { ReactNode } from 'react';
import listStyle from './List.module.scss';

export interface IListProps {
  children: ReactNode;
  testId?: string;
}
const List = (props: IListProps) => (
  <div className={listStyle.list} data-testid={props.testId}>
    {props.children}
  </div>
);

export default List;
