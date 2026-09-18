import { useTranslator } from '../../hooks/translator';
import { useGfwEventStore } from '../../stores/gfwEventStore';
import Section from '../common/section/Section';
import EventList from './EventList';

export interface IEventResultsProps {}

const EventResults = () => {
  const { t } = useTranslator();
  const events = useGfwEventStore((s) => s.events);
  const hasResults = events.length > 0;

  return (
    <Section
      key={hasResults ? 'results' : 'empty'}
      title={t('sidebar.titles.eventResults')}
      collapsible={hasResults}
    >
      <EventList />
    </Section>
  );
};

export default EventResults;
