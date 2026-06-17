import detailDrawerStyle from './DetailDrawer.module.scss';
import sidebarStyle from './Sidebar.module.scss';
import { useEventStore } from '../../stores/eventStore';
import { useTranslator } from '../../hooks/translator';
import ButtonInput from '../common/inputs/ButtonInput';
import Identification from '../blocks/Identification';
import LocationTimeBlock from '../blocks/LocationTimeBlock';
import SourceDetection from '../blocks/SourceDetection';
import Scoring from '../blocks/Scoring';
import HotspotContext from '../blocks/HotspotContext';
import ContextLayersBlock from '../blocks/ContextLayersBlock';
import RunMetadata from '../blocks/RunMetadata';
import SectionInputGroup from '../common/section/SectionInputGroup';

const DetailDrawer = () => {
  const { t } = useTranslator();

  const selectedEvent = useEventStore((state) => state.selectedEvent);
  const setSelectedEvent = useEventStore((state) => state.setSelectedEvent);

  return (
    <div
      className={`${sidebarStyle.wrapper} ${!selectedEvent ? detailDrawerStyle.hidden : ''}`}
    >
      <div className={`scrollbar ${sidebarStyle.scrollArea}`}>
        {selectedEvent && (
          <>
            <Identification event={selectedEvent} />
            <LocationTimeBlock event={selectedEvent} />
            <SourceDetection event={selectedEvent} />
            <Scoring event={selectedEvent} />
            <HotspotContext event={selectedEvent} />
            <ContextLayersBlock event={selectedEvent} />
            <RunMetadata event={selectedEvent} />
          </>
        )}
      </div>
      <div className={` ${sidebarStyle.footer}`}>
        <SectionInputGroup>
          <ButtonInput label={t('detailPanel.action.prev')} />
          <ButtonInput
            label={t('detailPanel.action.deselect')}
            onClick={() => setSelectedEvent(null)}
          />
          <ButtonInput label={t('detailPanel.action.next')} />
        </SectionInputGroup>

        <span
          className={`font-size-xs font-light font-family-header ${sidebarStyle.subRunQuery}`}
        >
          {t('detailPanel.text.dataLimitationBody')}
        </span>
      </div>
    </div>
  );
};

export default DetailDrawer;
