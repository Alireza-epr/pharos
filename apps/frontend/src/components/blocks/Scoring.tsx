import Section from '../common/section/Section';
import BarInput from '../common/inputs/BarInput';
import { useTranslator } from '@/hooks/translator';
import { IEventSchema } from '@packages/types';
import SectionItem from '../common/section/SectionItem';
import ChipGroupInput from '../common/inputs/ChipGroupInput';
import { reasonCodeHint } from '@/helpers/utils/eventUtils';

export interface IScoringBlockProps {
  event: IEventSchema;
}

const Scoring = (props: IScoringBlockProps) => {
  const { t } = useTranslator();
  const { scoring } = props.event;

  return (
    <Section title={t('detailPanel.title.scoring')} collapsible={false}>
      <SectionItem
        title={t('sidebar.label.triageScore')}
        hint={t('detailPanel.hint.triageScore')}
        tab
      >
        <BarInput label={''} value={scoring.triage_score} />
      </SectionItem>
      <SectionItem
        title={t('sidebar.label.uncertaintyScore')}
        hint={t('detailPanel.hint.uncertaintyScore')}
        tab
      >
        <BarInput label={''} value={scoring.uncertainty_score} />
      </SectionItem>
      <SectionItem
        title={t('detailPanel.label.reasonCodes')}
        collapsible={false}
        tab
      >
        <ChipGroupInput
          values={scoring.reason_codes ?? []}
          titleFor={(code) => reasonCodeHint(code, t)}
          readOnly
        />
      </SectionItem>
    </Section>
  );
};

export default Scoring;
