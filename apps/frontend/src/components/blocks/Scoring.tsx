import Section from '../common/section/Section';
import BarInput from '../common/inputs/BarInput';
import { useTranslator } from '@/hooks/translator';
import { IEventSchema } from '@packages/types';
import SectionItem from '../common/section/SectionItem';
import ChipGroupInput from '../common/inputs/ChipGroupInput';

export interface IScoringBlockProps {
  event: IEventSchema;
}

const Scoring = (props: IScoringBlockProps) => {
  const { t } = useTranslator();
  const { scoring } = props.event;

  return (
    <Section title={t('detailPanel.title.scoring')} collapsible={false}>
      <SectionItem title={t('sidebar.label.triageScore')}>
        <BarInput label={''} value={scoring.triage_score} />
      </SectionItem>
      <SectionItem title={t('sidebar.label.uncertaintyScore')}>
        <BarInput label={''} value={scoring.uncertainty_score} />
      </SectionItem>
      <SectionItem
        title={t('detailPanel.label.reasonCodes')}
        collapsible={false}
      >
        <ChipGroupInput values={scoring.reason_codes ?? []} readOnly />
      </SectionItem>
    </Section>
  );
};

export default Scoring;
