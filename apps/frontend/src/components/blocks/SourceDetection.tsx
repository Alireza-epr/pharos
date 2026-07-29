import Section from '../common/section/Section';
import { useTranslator } from '@/hooks/translator';
import { IEventSchema } from '@packages/types';
import SectionItem from '../common/section/SectionItem';
import TextInput from '../common/inputs/TextInput';

export interface ISourceDetectionBlockProps {
  event: IEventSchema;
}

const SourceDetection = (props: ISourceDetectionBlockProps) => {
  const { t } = useTranslator();
  const { event } = props;

  return (
    <Section
      title={t('detailPanel.title.sourceAndDetection')}
      collapsible={false}
    >
      <SectionItem title={t('detailPanel.label.dataset')} tab >
        <TextInput readOnly copiable value={event.source} />
      </SectionItem>
      <SectionItem title={t('bottomPanel.column.confidenceTier')} tab>
        <TextInput readOnly copiable value={event.confidence_tier} />
      </SectionItem>
      <SectionItem title={t('bottomPanel.column.confidenceProxy')} tab>
        <TextInput
          readOnly
          copiable
          value={
            event.confidence_proxy !== null
              ? String(event.confidence_proxy)
              : t('detailPanel.text.nullProxy')
          }
        />
      </SectionItem>
    </Section>
  );
};

export default SourceDetection;
