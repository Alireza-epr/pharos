import sidebarStyle from '../Sidebar.module.scss';
import { useTranslator } from '../../../hooks/translator';
import { useEventStore } from '../../../stores/eventStore';
import SectionInputGroup from '../../../components/common/section/SectionInputGroup';
import ButtonInput from '../../../components/common/inputs/ButtonInput';
import { useFetchExportEvents } from '../../../hooks/fetch';
import { useConfigStore } from '../../../stores/configStore';
import SortRowInput from '../../../components/common/inputs/SortRowInput';
import SectionItem from '../../../components/common/section/SectionItem';
import ChipGroupInput from '../../../components/common/inputs/ChipGroupInput';
import { EExportEvidence } from '@packages/enum';
import { TBodyParams_export } from '@packages/types';
import { downloadFile } from '../../../helpers/utils/downloadUtils';
import Section from '../../../components/common/section/Section';
import { log_frontend } from '@packages/utils';

const ExportTab = () => {
  const { t } = useTranslator();

  const { execute, loading, error } = useFetchExportEvents();

  const selectedEvents = useEventStore((s) => s.selectedEvents);
  const setSelectedEvents = useEventStore((s) => s.setSelectedEvents);

  const config = useConfigStore((s) => s.config);
  const setConfig = useConfigStore((s) => s.setConfig);
  const exportConfig = useConfigStore((s) => s.getExport());

  const handleExportClick = async () => {
    if (!config) return;
    const body: TBodyParams_export = {
      config,
      events: selectedEvents,
    };
    log_frontend(body);
    const file = await execute(body);
    if (file) {
      downloadFile(file.blob, file.filename);
    }
  };

  const handleRemoveClick = (a_EventId: string) => {
    setSelectedEvents((prev) => prev.filter((e) => e.event_id !== a_EventId));
  };

  const toggleConfig = (a_Config: EExportEvidence) => {
    setConfig((prev) => {
      // Toggling only makes sense once a query has produced a full config; the
      // chips are disabled until then, so bail out instead of building a partial.
      if (!prev) return prev;
      const current = prev.export ?? exportConfig;
      return {
        ...prev,
        export: { ...current, [a_Config]: !current[a_Config] },
      };
    });
  };

  const handleClearClick = () => {
    setSelectedEvents([]);
  };

  return (
    <>
      <div className={`scrollbar ${sidebarStyle.scrollArea}`}>
        <Section title={t('sidebar.tab.event')} collapsible={false}>
          <SectionItem title={t('general.label.list')} collapsible={false} tab>
            {selectedEvents.length > 0 ? (
              selectedEvents.map((event, index) => {
                return (
                  <SortRowInput
                    key={index}
                    rank={index + 1}
                    value={event.event_id}
                    onRemove={() => handleRemoveClick(event.event_id)}
                  />
                );
              })
            ) : (
              <div className={` ${sidebarStyle.emptyState}`}>
                <span className={`font-size-sm font-bold font-family-header`}>
                  {t('exportPanel.empty.title')}
                </span>
                <span className={`font-size-xs font-light font-family-header`}>
                  {t('exportPanel.empty.body')}
                </span>
              </div>
            )}
          </SectionItem>

          <SectionItem title={t('exportPanel.title.includeFiles')} tab>
            <ChipGroupInput
              disabled={selectedEvents.length === 0}
              values={
                Object.keys(EExportEvidence).filter(
                  (e) => !e.includes('hotspot'),
                ) as EExportEvidence[]
              }
              active={Object.entries(exportConfig)
                .filter(([_, v]) => v)
                .map(([k]) => k as EExportEvidence)}
              onToggle={(config) => toggleConfig(config)}
            />
          </SectionItem>
        </Section>

        <Section title={t('sidebar.tab.hotspot')} collapsible>
          <SectionItem title={t('general.label.list')} collapsible={false} tab>
            <div className={` ${sidebarStyle.emptyState}`}>
              <span className={`font-size-sm font-bold font-family-header`}>
                {t('exportPanel.empty.titleHotspot')}
              </span>
              <span className={`font-size-xs font-light font-family-header`}>
                {t('exportPanel.empty.bodyHotspot')}
              </span>
            </div>
          </SectionItem>
          <SectionItem title={t('exportPanel.title.includeFiles')} tab>
            <ChipGroupInput
              disabled={true}
              values={
                Object.keys(EExportEvidence).filter((e) =>
                  e.includes('hotspot'),
                ) as EExportEvidence[]
              }
              active={Object.entries(exportConfig)
                .filter(([_, v]) => v)
                .map(([k]) => k as EExportEvidence)}
              onToggle={(config) => toggleConfig(config)}
            />
          </SectionItem>
        </Section>
      </div>
      <div className={` ${sidebarStyle.footer}`}>
        <SectionInputGroup direction="row">
          <ButtonInput
            label={t('general.label.export')}
            onClick={handleExportClick}
            disabled={
              selectedEvents.length === 0 ||
              loading ||
              !config ||
              Object.entries(exportConfig).filter(([_, v]) => v).length === 0
            }
            loading={loading}
          />
          <ButtonInput
            label={t('general.label.clear')}
            onClick={handleClearClick}
            disabled={selectedEvents.length === 0}
          />
        </SectionInputGroup>
        <span
          className={`font-size-xs font-light font-family-header sub-text ${error ? 'error' : ''}`}
        >
          {error
            ? t('exportPanel.error.exportFailed')
            : t('exportPanel.text.downloadNote')}
        </span>
      </div>
    </>
  );
};

export default ExportTab;
