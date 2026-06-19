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

  const activeEvent = useEventStore((state) => state.activeEvent);
  const selectedEvents = useEventStore((s) => s.selectedEvents);
  const setSelectedEvents = useEventStore((s) => s.setSelectedEvents);

  const handleNextClick = () => {};

  const handlePrevClick = () => {};

  const handleExportClick = () => {
    if (!activeEvent) return;
    const event = selectedEvents.find(
      (e) => e.event_id === activeEvent?.event_id,
    );
    if (!event) {
      setSelectedEvents((prev) => [...prev, activeEvent]);
    } else {
      setSelectedEvents((prev) =>
        prev.filter((e) => e.event_id !== event.event_id),
      );
    }
  };

  return (
    <>
      <div className={`scrollbar ${sidebarStyle.scrollArea}`}>
        {activeEvent ? (
          <>
            <Identification event={activeEvent} />
            <LocationTimeBlock event={activeEvent} />
            <SourceDetection event={activeEvent} />
            <Scoring event={activeEvent} />
            <HotspotContext event={activeEvent} />
            <ContextLayersBlock event={activeEvent} />
            <RunMetadata event={activeEvent} />
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
            label={
              selectedEvents.find(
                (e) => e.event_id === activeEvent?.event_id,
              ) === undefined
                ? `${t('detailPanel.action.addToExport')} +`
                : `${t('detailPanel.action.removeFromExport')} +`
            }
            onClick={handleExportClick}
            disabled={!activeEvent}
          />
          <ButtonInput
            label={t('detailPanel.action.next')}
            onClick={handleNextClick}
          />
        </SectionInputGroup>

        <span className={`font-size-xs font-light font-family-header sub-text`}>
          {t('detailPanel.text.dataLimitationBody')}
        </span>
      </div>
    </>
  );
};

export default DetailTab;
