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
        <SectionInputGroup direction='column'>
          <ButtonInput label='Export All' onClick={handleExportConfig} />
          <ButtonInput label='Import All' onClick={handleImportConfig} caveat='importing will replace all current config'/>
        </SectionInputGroup>
    </Section>
  )
}

export default ExportAndImportConfig