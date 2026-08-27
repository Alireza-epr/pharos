import { useTranslator } from '../../hooks/translator';
import { useVesselStore } from '../../stores/vesselStore';
import {
  getVesselDisplayFields,
  getVesselKey,
} from '../../helpers/utils/vesselUtils';
import ButtonInput from '../common/inputs/ButtonInput';
import Section from '../common/section/Section';
import List from '../common/List';
import ListItem from '../common/ListItem';

export interface IVesselResultsProps {}

// The Vessel tab's result list -- compact clickable cards (this is a
// left-sidebar tab, not the bottom detections table's width), one per
// returned vessel identity. Clicking a row sets vesselStore's activeVessel;
// nothing consumes that yet (no vessel detail view exists this iteration),
// but it's ready for one.
const VesselResults = () => {
  const { t } = useTranslator();
  const vessels = useVesselStore((s) => s.vessels);
  const activeVessel = useVesselStore((s) => s.activeVessel);
  const setActiveVessel = useVesselStore((s) => s.setActiveVessel);
  const selectedVessels = useVesselStore((s) => s.selectedVessels);
  const setSelectedVessels = useVesselStore((s) => s.setSelectedVessels);

  const hasResults = vessels.length > 0;

  if (!hasResults) {
    return (
      <Section
        key="empty"
        title={t('sidebar.titles.vesselResults')}
        collapsible={false}
      >
        <span className="font-size-xs font-light font-family-header sub-text">
          {t('sidebar.text.noVesselResults')}
        </span>
      </Section>
    );
  }

  return (
    <Section key="results" title={t('sidebar.titles.vesselResults')} collapsible>
      <List testId="vessel-results-list">
        <span className="font-size-xs font-light font-family-header sub-text">
          {t('sidebar.text.vesselResultsCount', { count: String(vessels.length) })}
        </span>
        {vessels.map((vessel, index) => {
          const fields = getVesselDisplayFields(vessel);
          const isActive = activeVessel === vessel;
          const vesselKey = getVesselKey(vessel);
          const isExported = selectedVessels.some(
            (v) => getVesselKey(v) === vesselKey,
          );
          const subtitleParts = [
            fields.flag,
            fields.mmsi && `MMSI ${fields.mmsi}`,
            fields.imo && `IMO ${fields.imo}`,
            fields.callsign,
            fields.vesselType,
          ].filter(Boolean);

          const handleExportToggle = () => {
            if (isExported) {
              setSelectedVessels((prev) =>
                prev.filter((v) => getVesselKey(v) !== vesselKey),
              );
            } else {
              setSelectedVessels((prev) => [...prev, vessel]);
            }
          };

          return (
            <ListItem
              key={vesselKey ?? index}
              title={fields.shipName ?? t('sidebar.text.unknownVessel')}
              subtitle={
                subtitleParts.length > 0
                  ? subtitleParts.join(' · ')
                  : undefined
              }
              active={isActive}
              onClick={() => setActiveVessel(isActive ? null : vessel)}
              testId="vessel-result-row"
              action={
                <ButtonInput
                  active={isExported}
                  icon
                  label={isExported ? '✓' : '+'}
                  title={
                    isExported
                      ? t('detailPanel.action.removeFromExport')
                      : t('detailPanel.action.addToExport')
                  }
                  size="sm"
                  onClick={handleExportToggle}
                  testId="vessel-result-export"
                />
              }
            />
          );
        })}
      </List>
    </Section>
  );
};

export default VesselResults;
