import { useTranslator } from '../../hooks/translator';
import { useGfwEventStore } from '../../stores/gfwEventStore';
import {
  getEventDisplayFields,
  getEventKey,
} from '../../helpers/utils/gfwEventUtils';
import ButtonInput from '../common/inputs/ButtonInput';
import Section from '../common/section/Section';
import List from '../common/List';
import ListItem from '../common/ListItem';

export interface IEventResultsProps {}


const EventResults = () => {
  const { t } = useTranslator();
  const events = useGfwEventStore((s) => s.events);
  const activeEvent = useGfwEventStore((s) => s.activeEvent);
  const setActiveEvent = useGfwEventStore((s) => s.setActiveEvent);
  const selectedEvents = useGfwEventStore((s) => s.selectedEvents);
  const setSelectedEvents = useGfwEventStore((s) => s.setSelectedEvents);

  const hasResults = events.length > 0;

  if (!hasResults) {
    return (
      <Section
        key="empty"
        title={t('sidebar.titles.eventResults')}
        collapsible={false}
      >
        <span className="font-size-xs font-light font-family-header sub-text">
          {t('sidebar.text.noEventResults')}
        </span>
      </Section>
    );
  }

  return (
    <Section key="results" title={t('sidebar.titles.eventResults')} collapsible>
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
          const subtitleParts = [
            fields.flag,
            fields.start,
          ].filter(Boolean);

          const handleExportToggle = () => {
            if (isExported) {
              setSelectedEvents((prev) =>
                prev.filter((e) => getEventKey(e) !== eventKey),
              );
            } else {
              setSelectedEvents((prev) => [...prev, event]);
            }
          };

          return (
            <ListItem
              key={eventKey ?? index}
              title={`${fields.vesselName ?? t('sidebar.text.unknownVessel')} · ${fields.type}`}
              subtitle={
                subtitleParts.length > 0
                  ? subtitleParts.join(' · ')
                  : undefined
              }
              active={isActive}
              onClick={() => setActiveEvent(isActive ? null : event)}
              testId="event-result-row"
              action={
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
              }
            />
          );
        })}
      </List>
    </Section>
  );
};

export default EventResults;
