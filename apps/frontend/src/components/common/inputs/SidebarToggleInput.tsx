import sidebarToggleInputStyle from './SidebarToggleInput.module.scss';
import { useTranslator } from '../../../hooks/translator';

export interface ISidebarToggleInputProps {
  collapsed: boolean;
  onClick: () => void;
  className?: string | undefined;
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
      {props.collapsed ? '»' : '«'}
    </button>
  );
};

export default SidebarToggleInput;
