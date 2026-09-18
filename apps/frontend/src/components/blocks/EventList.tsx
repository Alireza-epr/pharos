import { useTranslator } from '../../hooks/translator';
import { useGfwEventStore } from '../../stores/gfwEventStore';
import {
  getEventDateRangeLabel,
  getEventDisplayFields,
  getEventKey,
} from '../../helpers/utils/gfwEventUtils';
import ButtonInput from '../common/inputs/ButtonInput';
import SectionInputGroup from '../common/section/SectionInputGroup';
import List from '../common/List';
import ListItem from '../common/ListItem';

export interface IEventListProps {}


const EventList = () => {
  const { t } = useTranslator();
  const events = useGfwEventStore((s) => s.events);
  const activeEvent = useGfwEventStore((s) => s.activeEvent);
  const setActiveEvent = useGfwEventStore((s) => s.setActiveEvent);
  const setFlyToRequest = useGfwEventStore((s) => s.setFlyToRequest);
  const selectedEvents = useGfwEventStore((s) => s.selectedEvents);
  const setSelectedEvents = useGfwEventStore((s) => s.setSelectedEvents);

  if (events.length === 0) {
    return (
      <span className="font-size-xs font-light font-family-header sub-text">
        {t('sidebar.text.noEventResults')}
      </span>
    );
  }

  return (
    <List testId="event-results-list">
      <span className="font-size-xs font-light font-family-header sub-text">
        {t('sidebar.text.eventResultsCount', { count: String(events.length) })}
      </span>
      {events.map((event, index) => {
        const fields = getEventDisplayFields(event);
        const isActive = activeEvent === event;
        const eventKey = getEventKey(event);
        const isExported = selectedEvents.some(
          (e) => getEventKey(e) === eventKey,
        );
        const dateRange = getEventDateRangeLabel(fields.start, fields.end);
        const subtitleParts = [fields.flag, dateRange].filter(Boolean);

        const handleExportToggle = () => {
          if (isExported) {
            setSelectedEvents((prev) =>
              prev.filter((e) => getEventKey(e) !== eventKey),
            );
          } else {
            setSelectedEvents((prev) => [...prev, event]);
          }
        };

        // Always selects (never toggles off) -- unlike the row's own click,
        // "Go to" means "take me there", not "toggle selection".
        const handleGoTo = () => {
          setActiveEvent(event);
          setFlyToRequest({ lat: event.position.lat, lon: event.position.lon });
        };

        return (
          <ListItem
            key={eventKey ?? index}
            title={`${fields.vesselName ?? t('sidebar.text.unknownVessel')} · ${fields.type}`}
            subtitle={
              subtitleParts.length > 0 ? subtitleParts.join(' · ') : undefined
            }
            subtitleHint={dateRange ? t('sidebar.hint.eventDateRange') : undefined}
            active={isActive}
            onClick={() => setActiveEvent(isActive ? null : event)}
            testId="event-result-row"
            action={
              <SectionInputGroup direction="row">
                <ButtonInput
                  icon
                  label="◎"
                  title={t('detailPanel.action.goTo')}
                  size="sm"
                  onClick={handleGoTo}
                  testId="event-result-go-to"
                />
                <ButtonInput
                  active={isExported}
                  icon
                  label={isExported ? '✓' : '+'}
                  title={
                    isExported
                      ? t('detailPanel.action.removeFromExport')
                      : t('detailPanel.action.addToExport')
                  }
                  size="sm"
                  onClick={handleExportToggle}
                  testId="event-result-export"
                />
              </SectionInputGroup>
            }
          />
        );
      })}
    </List>
  );
};

export default EventList;
