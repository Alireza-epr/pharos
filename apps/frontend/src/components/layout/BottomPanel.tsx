import bottomPanelStyle from "./BottomPanel.module.scss"

export interface BottomPanelProps {
    
}

const BottomPanel = (props: BottomPanelProps) => {
  return (
    <div className={` ${bottomPanelStyle.wrapper}`}>
      <div className={bottomPanelStyle.header}>{/* title + filter chips */}</div>
      <div className={bottomPanelStyle.tableWrap}></div>
    </div>
  )
}

export default BottomPanel