import { IEventSchema } from '@packages/types';
import { useTranslator } from '../../hooks/translator';
import { useGfwEventStore } from '../../stores/gfwEventStore';
import { useVesselRelevantEvents } from '../../hooks/useVesselRelevantEvents';
import Section from '../common/section/Section';
import EventList from './EventList';

export interface IDetailEventsProps {
  event: IEventSchema;
}

const DetailEvents = (props: IDetailEventsProps) => {
  const { t } = useTranslator();
  const vesselId = props.event.raw_metadata.vesselId;
  const { loading, error, hasMore, total } = useVesselRelevantEvents(
    vesselId || undefined,
  );
  const events = useGfwEventStore((s) => s.events);

  if (!vesselId) return null;

  return (
    <Section
      title={t('sidebar.tab.event')}
      collapsible={false}
      testId="detail-events-section-header"
    >
      {loading && events.length === 0 ? (
        <span className="font-size-xs font-light font-family-header sub-text">
          {t('detailPanel.text.relevantEventsLoading')}
        </span>
      ) : (
        <>
          <EventList />
          {hasMore && (
            <span className="font-size-xs font-light font-family-header sub-text">
              {t('detailPanel.text.moreRelevantEvents', {
                count: String((total ?? events.length) - events.length),
              })}
            </span>
          )}
          {error && (
            <span className="font-size-xs font-light font-family-header sub-text error">
              {t('sidebar.error.runQueryFailed')}
            </span>
          )}
        </>
      )}
    </Section>
  );
};

export default DetailEvents;
