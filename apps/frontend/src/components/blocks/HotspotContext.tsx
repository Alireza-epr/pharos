import { useMemo } from 'react';
import Section from '../common/section/Section';
import { useTranslator } from '../../hooks/translator';
import { shortenText } from '@packages/utils';
import { IEventSchema } from '@packages/types';
import SectionItem from '../common/section/SectionItem';
import TextInput from '../common/inputs/TextInput';
import CheckboxInput from '../common/inputs/CheckboxInput';
import { useEventStore } from '../../stores/eventStore';
import { useContextLayersStore } from '../../stores/contextLayersStore';

export interface IHotspotContextProps {
  event: IEventSchema;
}

const HotspotContext = (props: IHotspotContextProps) => {
  const { t } = useTranslator();
  const { hotspot } = props.event;
  const events = useEventStore((s) => s.events);
  const showOnMap = useContextLayersStore((s) => s.hotspots);
  const setShowOnMap = useContextLayersStore((s) => s.setHotspots);

  // recurrence_count is computed server-side over the full filtered result
  // set, before pagination (see events.controllers.ts) — it can count more
  // recurring detections than are actually loaded on the current page. This
  // counts how many of those are present in `events` (independent of any
  // matched/rejected table filter, since the question is data availability,
  // not current view) so the gap can be surfaced instead of silently
  // disagreeing with the map/table.
  const visibleRecurrenceCount = useMemo(() => {
    if (!hotspot) return 0;
    return events.filter(
      (e) => e.hotspot?.cell_id === hotspot.cell_id && !e.matched_flag,
    ).length;
  }, [events, hotspot]);

  if (!hotspot) return null;

  const recurrenceCaveat =
    visibleRecurrenceCount < hotspot.signals.recurrence_count
      ? t('detailPanel.text.recurrenceVisibleCaveat', {
          visible: String(visibleRecurrenceCount),
          total: String(hotspot.signals.recurrence_count),
        })
      : undefined;

  return (
    <Section title={t('detailPanel.title.hotspotContext')} collapsible={false}>
      <SectionItem title={t('detailPanel.label.h3Cell')} tab>
        <TextInput
          readOnly
          copiable
          copyValue={hotspot.cell_id}
          value={shortenText(hotspot.cell_id, 16)}
        />
        <CheckboxInput
          label={t('detailPanel.label.showOnMap')}
          checked={showOnMap}
          onChange={setShowOnMap}
        />
      </SectionItem>
      <SectionItem
        title={t('detailPanel.label.recurrence')}
        {...(recurrenceCaveat ? { caveat: recurrenceCaveat } : {})}
        tab
      >
        <TextInput
          readOnly
          copiable
          value={String(hotspot.signals.recurrence_count)}
        />
      </SectionItem>
      <SectionItem title={t('detailPanel.label.timeBinsUnmatched')} tab>
        <TextInput
          readOnly
          copiable
          value={String(hotspot.signals.time_bins_with_unmatched)}
        />
      </SectionItem>
      <SectionItem title={t('detailPanel.label.strength')} tab>
        <TextInput readOnly copiable value={hotspot.signals.hotspot_strength} />
      </SectionItem>
    </Section>
  );
};

export default HotspotContext;
