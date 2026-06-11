import sidebarStyle from "./Sidebar.module.scss"

export interface SidebarProps {
    
}

const Sidebar = (props: SidebarProps) => {
  return (
    <div className={` ${sidebarStyle.wrapper}`}>
      <div className={`scrollbar ${sidebarStyle.scrollArea}`}>
        {/* all form sections */}
      </div>
      <div className={` ${sidebarStyle.footer}`}>
        {/* Run Query button */}
      </div>
    </div>
  )
}

export default Sidebar