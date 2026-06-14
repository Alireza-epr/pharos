import Section from '../common/section/Section';
import { formatTimestamp } from '@packages/utils';
import { useTranslator } from '@/hooks/translator';
import { shortenText } from '@packages/utils';
import { IEventSchema } from '@packages/types';
import SectionItem from '../common/section/SectionItem';
import TextInput from '../common/inputs/TextInput';
import SectionInputGroup from '../common/section/SectionInputGroup';
import ButtonInput from '../common/inputs/ButtonInput';
import { downloadJSON } from '@/helpers/utils/downloadUtils';

export interface IRunMetadataBlockProps {
  event: IEventSchema;
}

const RunMetadata = (props: IRunMetadataBlockProps) => {
  const { t } = useTranslator();
  const { run_metadata } = props.event;

  if (!run_metadata) return null;

  
  return (
    <Section title={t('detailPanel.title.runMetadata')} collapsible={false}>

      <SectionItem title={t('detailPanel.label.runTime')}>
        <TextInput
          value={formatTimestamp(new Date(run_metadata.run_time))}
          copyValue={run_metadata.run_time}
          readOnly
          copiable
        />
      </SectionItem>

      <SectionItem title={t('detailPanel.label.config')}>
        <SectionInputGroup direction='column'>
          <TextInput
            value={shortenText(run_metadata.config_hash, 16)}
            copyValue={run_metadata.config_hash}
            readOnly
            copiable
            copyLabel={t("general.action.copy")}
          />
          <ButtonInput 
            label={t('detailPanel.label.downloadConfig')}
            onClick={() => downloadJSON( run_metadata.config_json, `${run_metadata.config_hash}` )}
          />
        </SectionInputGroup>
      </SectionItem>

      <SectionItem title={t('detailPanel.label.contextLayersDatasets')}>
        {run_metadata.context_layer_versions?.split(",").map( (dataset, index) => 
          <TextInput 
            value={shortenText(dataset.trim(), 16)}
            copyValue={dataset.trim()}
            readOnly
            copiable
            key={index}
          />
         )}
      </SectionItem>  

    </Section>
  );
};

export default RunMetadata;
