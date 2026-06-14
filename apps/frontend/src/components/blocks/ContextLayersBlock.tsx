import Section from '../common/section/Section';
import { useTranslator } from '../../hooks/translator';
import { IEventSchema } from '@packages/types';
import SectionItem from '../common/section/SectionItem';
import TextInput from '../common/inputs/TextInput';

export interface IContextLayersBlockProps {
  event: IEventSchema;
}

const ContextLayersBlock = (props: IContextLayersBlockProps) => {
  const { t } = useTranslator();

  return (
    <Section title={t('detailPanel.title.contextLayers')} collapsible={false}>
      {Object.entries(props.event.context_layers).filter( ([_, value ]) => value.enrichments.length > 0 ).map(([name, layer], index) => {
        return(
          <SectionItem title={name} key={index}>
            {layer.enrichments.map((e, index2) => {
              const value = e.value ?? e.label ?? ''
              return (
                <TextInput 
                  value={value}
                  readOnly
                  copiable
                  key={index2}
                />
              )
            })}
          </SectionItem>
        )
      })}
    </Section>
  );
};

export default ContextLayersBlock;
