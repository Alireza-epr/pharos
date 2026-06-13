import bottomPanelStyle from './BottomPanel.module.scss';

export interface IBottomPanelProps {}

const BottomPanel = () => {
  return (
    <div className={` ${bottomPanelStyle.wrapper}`}>
      <div className={` ${bottomPanelStyle.header}`}>
        {/* title + filter chips */}
      </div>
      <div className={`scrollbar ${bottomPanelStyle.tableWrap}`}></div>
    </div>
  );
};

export default BottomPanel;
