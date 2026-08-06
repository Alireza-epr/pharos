import Section from '../common/section/Section'
import SectionInputGroup from '../common/section/SectionInputGroup'
import ButtonInput from '../common/inputs/ButtonInput'
import { useTranslator } from '../../hooks/translator'
import { downloadJSON, openJSONFile } from '../../helpers/utils/downloadUtils'
import { buildConfig, importConfig, isValidConfig } from '../../helpers/utils/configUtils'
import { useMessageStore } from '../../stores/messageStore'
import { stripHiddenConfiguration } from '@packages/utils'

const ExportAndImportConfig = () => {
  const { t } = useTranslator()

  const handleExportConfig = () => {
    const config = buildConfig()
    const [stripped] = stripHiddenConfiguration([config])
    downloadJSON(stripped ?? config, 'config')
  }

  const handleImportConfig = () => {
    const reportInvalid = () =>
      useMessageStore.getState().setWarn(t('general.text.invalidImportFile'))

    openJSONFile((data) => {
      if (!isValidConfig(data)) {
        reportInvalid()
        return
      }
      importConfig(data)
    }, reportInvalid)
  }

  return (
    <Section title={t('sidebar.titles.exportImportConfig')} collapsible={false}>
        <SectionInputGroup direction='column'>
          <ButtonInput
            label={t('sidebar.label.exportAllConfig')}
            onClick={handleExportConfig}
          />
          <ButtonInput
            label={t('sidebar.label.importAllConfig')}
            onClick={handleImportConfig}
            caveat={t('sidebar.caveat.importReplacesConfig')}
          />
        </SectionInputGroup>
    </Section>
  )
}

export default ExportAndImportConfig