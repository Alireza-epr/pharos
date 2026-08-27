import { MouseEvent, ReactNode } from 'react';
import listItemStyle from './ListItem.module.scss';

export interface IListItemProps {
  title: string;
  subtitle?: string | undefined;
  active?: boolean;
  onClick?: () => void;
  prepend?: ReactNode;
  action?: ReactNode;
  mode?: 'card' | 'plain';
  testId?: string;
  attributes?: Record<string, string>;
}

const ListItem = (props: IListItemProps) => {
  const mode = props.mode ?? 'card';

  const handleActionClick = (e: MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className={`${props.onClick ? 'hover' : ''} active font-family-tech ${listItemStyle.row} ${mode === 'plain' ? listItemStyle.plain : ''} ${props.onClick ? listItemStyle.clickable : ''}`}
      data-active={props.active}
      data-testid={props.testId}
      onClick={props.onClick}
      {...props.attributes}
    >
      {props.prepend && (
        <span className={listItemStyle.prepend}>{props.prepend}</span>
      )}
      <div className={listItemStyle.rowText}>
        <span
          className={`font-size-sm font-bold truncate ${listItemStyle.title}`}
        >
          {props.title}
        </span>
        {props.subtitle && (
          <span
            className={`font-size-xs truncate ${listItemStyle.subtitle}`}
          >
            {props.subtitle}
          </span>
        )}
      </div>
      {props.action && <div onClick={handleActionClick}>{props.action}</div>}
    </div>
  );
};

export default ListItem;
