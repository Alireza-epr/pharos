import sidebarStyle from './Sidebar.module.scss';
import AreaOfInterest from "../blocks/AreaOfInterest"

export interface ISidebarProps {}

const Sidebar = (props: ISidebarProps) => {

  return (
    <div className={` ${sidebarStyle.wrapper}`}>
      <div className={`scrollbar ${sidebarStyle.scrollArea}`}>
        <AreaOfInterest />
      </div>
      <div className={` ${sidebarStyle.footer}`}>{/* Run Query button */}</div>
    </div>
  );
};

export default Sidebar;
