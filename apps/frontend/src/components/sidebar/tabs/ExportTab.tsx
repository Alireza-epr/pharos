import sidebarStyle from '../Sidebar.module.scss';
import { useTranslator } from '../../../hooks/translator';
import { useEventStore } from '../../../stores/eventStore';
import { useVesselStore } from '../../../stores/vesselStore';
import SectionInputGroup from '../../../components/common/section/SectionInputGroup';
import ButtonInput from '../../../components/common/inputs/ButtonInput';
import { useFetchExportEvents } from '../../../hooks/fetch';
import { useConfigStore } from '../../../stores/configStore';
import SortRowInput from '../../../components/common/inputs/SortRowInput';
import SectionItem from '../../../components/common/section/SectionItem';
import ChipGroupInput from '../../../components/common/inputs/ChipGroupInput';
import { EExportEvidence } from '@packages/enum';
import { TBodyParams_export } from '@packages/types';
import { downloadFile, downloadJSON } from '../../../helpers/utils/downloadUtils';
import Section from '../../../components/common/section/Section';
import { log_frontend } from '@packages/utils';
import {
  getVesselDisplayFields,
  getVesselKey,
} from '../../../helpers/utils/vesselUtils';

const ExportTab = () => {
  const { t } = useTranslator();

  const { execute, loading, error } = useFetchExportEvents();

  const selectedEvents = useEventStore((s) => s.selectedEvents);
  const setSelectedEvents = useEventStore((s) => s.setSelectedEvents);

  const selectedVessels = useVesselStore((s) => s.selectedVessels);
  const setSelectedVessels = useVesselStore((s) => s.setSelectedVessels);

  const config = useConfigStore((s) => s.config);
  const setConfig = useConfigStore((s) => s.setConfig);
  const exportConfig = useConfigStore((s) => s.getExport());

  // The Report section still goes through the backend zip pipeline (it
  // needs `config` and at least one Include Files format checked --
  // evidenceController rejects an empty events list outright). Vessels have
  // no backend bundle format at all yet -- a vessel identity record is
  // already fully present client-side, so its export is a plain JSON
  // download of whatever's in the list, no format choice, no round-trip.
  const eventsExportReady =
    !!config &&
    selectedEvents.length > 0 &&
    Object.entries(exportConfig).filter(([, v]) => v).length > 0;
  const vesselsExportReady = selectedVessels.length > 0;

  const handleExportClick = async () => {
    if (eventsExportReady && config) {
      const body: TBodyParams_export = {
        config,
        events: selectedEvents,
      };
      log_frontend(body);
      const file = await execute(body);
      if (file) {
        downloadFile(file.blob, file.filename);
      }
    }

    if (vesselsExportReady) {
      downloadJSON(selectedVessels, 'vessels_export');
    }
  };

  const handleRemoveClick = (a_EventId: string) => {
    setSelectedEvents((prev) => prev.filter((e) => e.event_id !== a_EventId));
  };

  const handleRemoveVesselClick = (a_VesselKey: string | undefined) => {
    setSelectedVessels((prev) =>
      prev.filter((v) => getVesselKey(v) !== a_VesselKey),
    );
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
    setSelectedVessels([]);
  };

  return (
    <>
      <div className={`scrollbar ${sidebarStyle.scrollArea}`}>
        <Section title={t('sidebar.tab.report')} collapsible={false}>
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

        <Section title={t('sidebar.tab.vessel')} collapsible={false}>
          <SectionItem title={t('general.label.list')} collapsible={false} tab>
            {selectedVessels.length > 0 ? (
              selectedVessels.map((vessel, index) => {
                const vesselKey = getVesselKey(vessel);
                const shipName = getVesselDisplayFields(vessel).shipName;
                return (
                  <SortRowInput
                    key={vesselKey ?? index}
                    rank={index + 1}
                    value={shipName ?? t('sidebar.text.unknownVessel')}
                    onRemove={() => handleRemoveVesselClick(vesselKey)}
                  />
                );
              })
            ) : (
              <div className={` ${sidebarStyle.emptyState}`}>
                <span className={`font-size-sm font-bold font-family-header`}>
                  {t('exportPanel.empty.titleVessel')}
                </span>
                <span className={`font-size-xs font-light font-family-header`}>
                  {t('exportPanel.empty.bodyVessel')}
                </span>
              </div>
            )}
          </SectionItem>
        </Section>
      </div>
      <div className={` ${sidebarStyle.footer}`}>
        <SectionInputGroup direction="row">
          <ButtonInput
            label={t('general.label.export')}
            onClick={handleExportClick}
            disabled={loading || (!eventsExportReady && !vesselsExportReady)}
            loading={loading}
          />
          <ButtonInput
            label={t('general.label.clear')}
            onClick={handleClearClick}
            disabled={selectedEvents.length === 0 && selectedVessels.length === 0}
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
