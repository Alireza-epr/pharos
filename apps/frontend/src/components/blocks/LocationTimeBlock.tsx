import Section from '../common/section/Section';
import { useTranslator } from '../../hooks/translator';
import { formatTimestamp } from '@packages/utils';
import { IEventSchema } from '@packages/types';
import SectionItem from '../common/section/SectionItem';
import TextInput from '../common/inputs/TextInput';

export interface ILocationTimeBlockProps {
  event: IEventSchema;
}

const LocationTimeBlock = (props: ILocationTimeBlockProps) => {
  const { t } = useTranslator();
  const { event } = props;

  return (
    <Section title={t('detailPanel.title.locationAndTime')} collapsible={false}>
      <SectionItem
        title={t('detailPanel.label.gridCellCenter')}
        caveat={t('detailPanel.text.cellCenterCaveat')}
        tab
      >
        <TextInput readOnly copiable value={`${event.lat}°N, ${event.lon}°E`} />
      </SectionItem>
      <SectionItem
        title={t('detailPanel.label.bucketStart')}
        caveat={t('detailPanel.text.bucketStartCaveat')}
        tab
      >
        <TextInput
          readOnly
          copiable
          value={formatTimestamp(new Date(event.timestamp_utc))}
        />
      </SectionItem>
      <SectionItem title={t('sidebar.label.distanceToCoast')} tab>
        <TextInput
          readOnly
          copiable
          value={`${event.distance_to_coast_km} km`}
        />
      </SectionItem>
    </Section>
  );
};

export default LocationTimeBlock;
