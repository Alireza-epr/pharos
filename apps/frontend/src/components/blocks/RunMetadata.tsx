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
import NumberInput from '../common/inputs/NumberInput';

export interface IRunMetadataBlockProps {
  event: IEventSchema;
}

const RunMetadata = (props: IRunMetadataBlockProps) => {
  const { t } = useTranslator();
  const { event_id, run_metadata, raw_metadata } = props.event;

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

      <SectionItem title={t('detailPanel.label.config')} collapsible={false}>
        <SectionInputGroup direction="column">
          <TextInput
            value={shortenText(run_metadata.config_hash, 16)}
            copyValue={run_metadata.config_hash}
            readOnly
            copiable
            copyLabel={t('general.action.copy')}
          />
          <ButtonInput
            label={t('detailPanel.label.downloadConfig')}
            onClick={() =>
              downloadJSON(run_metadata.config_json, `${event_id}_run_metadata`)
            }
          />
          <ButtonInput
            label={t('detailPanel.label.downloadRawData')}
            onClick={() =>
              downloadJSON(raw_metadata, `${event_id}_raw_metadata`)
            }
          />
        </SectionInputGroup>
      </SectionItem>

      <SectionItem
        title={t('detailPanel.label.contextLayersDatasets')}
        collapsible={false}
      >
        {run_metadata.context_layer_versions?.split(',').map((full, index) => {
          const context = full.trim().split(':')[0] ?? '';
          const dataset = full.trim().split(':')[1] ?? '';
          const version = Number(full.trim().split(':')[2]?.substring(1));
          return (
            <SectionItem title={context} key={index} tab>
              <SectionInputGroup direction="column">
                <TextInput
                  value={shortenText(dataset, 16)}
                  readOnly
                  copiable
                  copyValue={dataset}
                />
                <NumberInput
                  direction="row"
                  label={t('general.label.version')}
                  value={version}
                  readOnly
                />
              </SectionInputGroup>
            </SectionItem>
          );
        })}
      </SectionItem>
    </Section>
  );
};

export default RunMetadata;
