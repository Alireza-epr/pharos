import sidebarToggleInputStyle from './SidebarToggleInput.module.scss';
import { useTranslator } from '../../../hooks/translator';

export interface ISidebarToggleInputProps {
  collapsed: boolean;
  onClick: () => void;
  className?: string | undefined;
  reversed?: boolean;
}

const SidebarToggleInput = (props: ISidebarToggleInputProps) => {
  const { t } = useTranslator();

  const label = props.collapsed
    ? t('sidebar.action.expand')
    : t('sidebar.action.collapse');

  return (
    <button
      className={`hover ${sidebarToggleInputStyle.wrapper} ${props.className ?? ''}`}
      onClick={props.onClick}
      title={label}
      aria-label={label}
    >
      {props.collapsed !== !!props.reversed ? '»' : '«'}
    </button>
  );
};

export default SidebarToggleInput;
