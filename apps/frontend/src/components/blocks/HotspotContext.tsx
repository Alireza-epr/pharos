import Section from '../common/section/Section';
import { useTranslator } from '../../hooks/translator';
import { shortenText } from '@packages/utils';
import { IEventSchema } from '@packages/types';
import SectionItem from '../common/section/SectionItem';
import TextInput from '../common/inputs/TextInput';

export interface IHotspotContextProps {
  event: IEventSchema;
}

const HotspotContext = (props: IHotspotContextProps) => {
  const { t } = useTranslator();
  const { hotspot } = props.event;

  if (!hotspot) return null;

  return (
    <Section title={t('detailPanel.title.hotspotContext')} collapsible={false}>
      <SectionItem title={t('detailPanel.label.h3Cell')} tab>
        <TextInput
          readOnly
          copiable
          copyValue={hotspot.cell_id}
          value={shortenText(hotspot.cell_id, 16)}
        />
      </SectionItem>
      <SectionItem title={t('detailPanel.label.recurrence')} tab>
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
