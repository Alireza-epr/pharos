import { useEventStore } from "@/stores/eventStore"
import detailDrawerStyle from "./DetailDrawer.module.scss"

export interface DetailDrawerProps {
    
}

const DetailDrawer = (props: DetailDrawerProps) => {

  const selectedEvent = useEventStore( (state) => state.selectedEvent )

  return (
    <div className={`${!selectedEvent ? detailDrawerStyle.hidden : ''} ${detailDrawerStyle.wrapper}`}>
      <div className={` ${detailDrawerStyle.header}`}>{/* event ID + badge + close */}</div>
      <div className={`scrollbar ${detailDrawerStyle.scrollArea}`}>{/* all sections */}</div>
    </div>
  )
}

export default DetailDrawer