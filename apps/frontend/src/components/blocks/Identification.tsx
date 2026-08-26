import { useTranslator } from '../../hooks/translator';
import { shortenText } from '@packages/utils';
import { getMatchingStatus } from '../../helpers/utils/eventUtils';
import { IEventSchema } from '@packages/types';
import Section from '../common/section/Section';
import SectionItem from '../common/section/SectionItem';
import TextInput from '../common/inputs/TextInput';

export interface IHeaderBlockProps {
  event: IEventSchema;
}

const Identification = (props: IHeaderBlockProps) => {
  const { t } = useTranslator();
  const { event } = props;

  return (
    <Section title={t('detailPanel.title.identification')} collapsible={false}>
      <SectionItem title={t('bottomPanel.column.detectionId')} tab>
        <TextInput
          value={shortenText(event.event_id, 30)}
          copyValue={event.event_id}
          readOnly
          copiable
          copyLabel={t('general.action.copy')}
          testId="detail-event-id"
        />
      </SectionItem>
      <SectionItem title={t('sidebar.titles.matchingStatus')} tab>
        <TextInput value={getMatchingStatus(event, t)} readOnly />
      </SectionItem>
    </Section>
  );
};

export default Identification;
