import { KeyboardEvent, MouseEvent, ReactNode } from 'react';
import listItemStyle from './ListItem.module.scss';

export interface IListItemProps {
  title: string;
  subtitle?: string | undefined;
  // Same convention as the rest of the app's error text (ReportTab,
  // VesselTab, ExportTab all conditionally add the global `error` class) --
  // exposed here so a row's subtitle (e.g. a failed history entry) can use
  // it too.
  subtitleError?: boolean;
  subtitleHint?: string | undefined;
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
  const isClickable = !!props.onClick;

  const handleActionClick = (e: MouseEvent) => {
    e.stopPropagation();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!props.onClick) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      props.onClick();
    }
  };

  return (
    <div
      className={`${isClickable ? 'hover focus' : ''} active font-family-tech ${listItemStyle.row} ${mode === 'plain' ? listItemStyle.plain : ''} ${isClickable ? listItemStyle.clickable : ''}`}
      data-active={props.active}
      data-testid={props.testId}
      onClick={props.onClick}
      onKeyDown={isClickable ? handleKeyDown : undefined}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
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
            className={`font-size-xs truncate ${listItemStyle.subtitle} ${props.subtitleError ? 'error' : ''}`}
            title={props.subtitleHint}
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
