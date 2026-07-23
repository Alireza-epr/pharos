import Section from '../common/section/Section'
import SectionInputGroup from '../common/section/SectionInputGroup'
import ButtonInput from '../common/inputs/ButtonInput'


const ExportAndImportConfig = () => {

  const handleExportConfig = () => {

  }

  const handleImportConfig = () => {
    
  }
  
  return (
    <Section title='Export/Import Config' collapsible={false}>
        <SectionInputGroup direction='column' tab>
            <ButtonInput label='Export' onClick={handleExportConfig} />
            <ButtonInput label='Import' onClick={handleImportConfig} />
        </SectionInputGroup>
    </Section>
  )
}

export default ExportAndImportConfig