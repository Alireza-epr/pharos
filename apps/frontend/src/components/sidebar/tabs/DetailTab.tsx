import sidebarStyle from '../Sidebar.module.scss';
import { useEventStore } from '../../../stores/eventStore';
import { useTranslator } from '../../../hooks/translator';
import ButtonInput from '../../common/inputs/ButtonInput';
import Identification from '../../blocks/Identification';
import LocationTimeBlock from '../../blocks/LocationTimeBlock';
import SourceDetection from '../../blocks/SourceDetection';
import Scoring from '../../blocks/Scoring';
import HotspotContext from '../../blocks/HotspotContext';
import ContextLayersBlock from '../../blocks/ContextLayersBlock';
import RunMetadata from '../../blocks/RunMetadata';
import SectionInputGroup from '../../common/section/SectionInputGroup';

const DetailTab = () => {
  const { t } = useTranslator();

  const selectedEvent = useEventStore((state) => state.selectedEvent);
  const setSelectedEvent = useEventStore((state) => state.setSelectedEvent);

  const handleNextClick = () => {

  }

  const handlePrevClick = () => {
    
  }

  return (
    <>
      <div className={`scrollbar ${sidebarStyle.scrollArea}`}>
        {selectedEvent ? (
          <>
            <Identification event={selectedEvent} />
            <LocationTimeBlock event={selectedEvent} />
            <SourceDetection event={selectedEvent} />
            <Scoring event={selectedEvent} />
            <HotspotContext event={selectedEvent} />
            <ContextLayersBlock event={selectedEvent} />
            <RunMetadata event={selectedEvent} />
          </>
        ) : (
          <div className={` ${sidebarStyle.emptyState}`}>
            <span className={`font-size-sm font-bold font-family-header`}>
              {t('detailPanel.empty.title')}
            </span>
            <span className={`font-size-xs font-light font-family-header`}>
              {t('detailPanel.empty.body')}
            </span>
          </div>
        )}
      </div>
      <div className={` ${sidebarStyle.footer}`}>
        <SectionInputGroup direction="row">
          <ButtonInput 
            label={t('detailPanel.action.prev')} 
            onClick={handlePrevClick}
          />
          <ButtonInput
            label={t('detailPanel.action.addToExport')}
            onClick={() => setSelectedEvent(null)}
            disabled= {!selectedEvent}
          />
          <ButtonInput label={t('detailPanel.action.next')} 
            onClick={handleNextClick}
          />
        </SectionInputGroup>

        <span
          className={`font-size-xs font-light font-family-header ${sidebarStyle.subRunQuery}`}
        >
          {t('detailPanel.text.dataLimitationBody')}
        </span>
      </div>
    </>
  );
};

export default DetailTab;
