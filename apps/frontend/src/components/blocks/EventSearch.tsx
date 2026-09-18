import Section from '../common/section/Section';
import SectionItem from '../common/section/SectionItem';
import SectionInputGroup from '../common/section/SectionInputGroup';
import TextInput from '../common/inputs/TextInput';
import DropdownInput from '../common/inputs/DropdownInput';
import NumberInput from '../common/inputs/NumberInput';
import DateInput from '../common/inputs/DateInput';
import CheckboxInput from '../common/inputs/CheckboxInput';
import { useTranslator } from '../../hooks/translator';
import { useGfwEventSearchStore } from '../../stores/gfwEventSearchStore';
import { useTimeRangeStore } from '../../stores/timeRangeStore';
import { useAOIStore } from '../../stores/areaOfInterestStore';
import {
  eventConfidenceOptions,
  eventEncounterTypeOptions,
  eventVesselTypeOptions,
} from '../../helpers/fixtures/query';
import {
  dataset_version_options,
  flags_options,
} from '../../helpers/fixtures/filters';
import { EEventDatasets, EEventDatasetsUI } from '@packages/enum';

export interface IEventSearchProps {}

const MIN_LIMIT = 1;
const MAX_LIMIT = 1000;

const EventSearch = () => {
  const { t } = useTranslator();

  const datasets = useGfwEventSearchStore((s) => s.datasets);
  const setDatasets = useGfwEventSearchStore((s) => s.setDatasets);
  const vessels = useGfwEventSearchStore((s) => s.vessels);
  const setVessels = useGfwEventSearchStore((s) => s.setVessels);
  const confidences = useGfwEventSearchStore((s) => s.confidences);
  const setConfidences = useGfwEventSearchStore((s) => s.setConfidences);
  const encounterTypes = useGfwEventSearchStore((s) => s.encounterTypes);
  const setEncounterTypes = useGfwEventSearchStore((s) => s.setEncounterTypes);
  const vesselTypes = useGfwEventSearchStore((s) => s.vesselTypes);
  const setVesselTypes = useGfwEventSearchStore((s) => s.setVesselTypes);
  const vesselGroups = useGfwEventSearchStore((s) => s.vesselGroups);
  const setVesselGroups = useGfwEventSearchStore((s) => s.setVesselGroups);
  const flags = useGfwEventSearchStore((s) => s.flags);
  const setFlags = useGfwEventSearchStore((s) => s.setFlags);
  const duration = useGfwEventSearchStore((s) => s.duration);
  const setDuration = useGfwEventSearchStore((s) => s.setDuration);
  const sort = useGfwEventSearchStore((s) => s.sort);
  const setSort = useGfwEventSearchStore((s) => s.setSort);
  const limit = useGfwEventSearchStore((s) => s.limit);
  const setLimit = useGfwEventSearchStore((s) => s.setLimit);
  const useReportAOI = useGfwEventSearchStore((s) => s.useReportAOI);
  const setUseReportAOI = useGfwEventSearchStore((s) => s.setUseReportAOI);

  // Shared with the Report tab
  const dateFrom = useTimeRangeStore((s) => s.dateFrom);
  const setDateFrom = useTimeRangeStore((s) => s.setDateFrom);
  const dateTo = useTimeRangeStore((s) => s.dateTo);
  const setDateTo = useTimeRangeStore((s) => s.setDateTo);

  // Same "is an AOI set" check ReportTab.tsx uses to gate its own Run
  const hasReportAOI = useAOIStore((s) =>
    Boolean(s.eezActive || s.mpaActive || s.feature),
  );
  const encountersActive = datasets[EEventDatasets.encountersEvent].active;

  return (
    <Section
      title={t('sidebar.titles.eventSearch')}
      collapsible={false}
      testId="event-search-section-header"
    >
      <SectionItem
        title={t('sidebar.label.datasets')}
        hint={t('sidebar.hint.eventDatasets')}
        collapsible={false}
        tab
      >
        {(
          Object.entries(datasets) as [
            EEventDatasets,
            (typeof datasets)[EEventDatasets],
          ][]
        ).map(([key], index) => (
          <SectionInputGroup direction="row" tab key={index}>
            <div style={{ width: '70%' }}>
              <CheckboxInput
                label={EEventDatasetsUI[key]}
                checked={datasets[key].active}
                onChange={(v) =>
                  setDatasets({
                    ...datasets,
                    [key]: { ...datasets[key], active: v },
                  })
                }
              />
            </div>
            <div style={{ width: '30%', display: 'flex' }}>
              <DropdownInput
                options={dataset_version_options}
                value={datasets[key].version}
                onChange={(v) =>
                  setDatasets({
                    ...datasets,
                    [key]: { ...datasets[key], version: v },
                  })
                }
              />
            </div>
          </SectionInputGroup>
        ))}
      </SectionItem>

      <SectionItem
        title={t('sidebar.tab.vessel')}
        hint={t('sidebar.hint.eventVessels')}
        tab
      >
        <TextInput
          value={vessels}
          onChange={setVessels}
          placeholder={t('sidebar.placeholder.eventVessels')}
          testId="event-vessels-input"
        />
      </SectionItem>

      <SectionItem title={t('general.label.from')} tab>
        <DateInput value={dateFrom} max={dateTo} onChange={setDateFrom} />
      </SectionItem>
      <SectionItem title={t('general.label.to')} tab>
        <DateInput value={dateTo} min={dateFrom} onChange={setDateTo} />
      </SectionItem>

      <SectionItem
        title={t('sidebar.label.eventUseReportAOI')}
        hint={
          hasReportAOI
            ? t('sidebar.hint.eventUseReportAOI')
            : t('sidebar.hint.eventUseReportAOINoAOI')
        }
        tab
      >
        <CheckboxInput
          label={t('sidebar.label.eventUseReportAOI')}
          checked={useReportAOI}
          disabled={!hasReportAOI}
          onChange={setUseReportAOI}
        />
      </SectionItem>

      <SectionItem
        title={t('sidebar.label.eventConfidences')}
        hint={t('sidebar.hint.eventConfidences')}
        tab
      >
        <DropdownInput
          value={confidences}
          options={eventConfidenceOptions}
          onChange={setConfidences}
          onClear={() => setConfidences([])}
          clearLabel={t('general.label.clear')}
          hint={t('sidebar.hint.multipleSelect')}
          multiple
        />
      </SectionItem>

      <SectionItem
        title={t('sidebar.label.eventEncounterTypes')}
        hint={t('sidebar.hint.eventEncounterTypes')}
        tab
      >
        <DropdownInput
          value={encounterTypes}
          options={eventEncounterTypeOptions}
          onChange={setEncounterTypes}
          onClear={() => setEncounterTypes([])}
          clearLabel={t('general.label.clear')}
          hint={t('sidebar.hint.multipleSelect')}
          multiple
          disabled={!encountersActive}
        />
      </SectionItem>

      <SectionItem title={t('sidebar.label.vesselTypes')} tab>
        <DropdownInput
          value={vesselTypes}
          options={eventVesselTypeOptions}
          onChange={setVesselTypes}
          onClear={() => setVesselTypes([])}
          clearLabel={t('general.label.clear')}
          hint={t('sidebar.hint.multipleSelect')}
          multiple
        />
      </SectionItem>

      <SectionItem title={t('sidebar.label.eventVesselGroups')} tab>
        <TextInput
          value={vesselGroups}
          onChange={setVesselGroups}
          placeholder={t('sidebar.placeholder.eventVesselGroups')}
        />
      </SectionItem>

      <SectionItem title={t('sidebar.label.flags')} tab>
        <DropdownInput
          value={flags}
          options={flags_options}
          onChange={setFlags}
          onClear={() => setFlags([])}
          clearLabel={t('general.label.clear')}
          hint={t('sidebar.hint.multipleSelect')}
          multiple
        />
      </SectionItem>

      <SectionItem
        title={t('sidebar.label.eventDuration')}
        hint={t('sidebar.hint.eventDuration')}
        tab
      >
        <NumberInput value={duration} onChange={setDuration} min={0} step={1} />
      </SectionItem>

      <SectionItem
        title={t('sidebar.label.eventSort')}
        hint={t('sidebar.hint.eventSort')}
        tab
      >
        <TextInput
          value={sort}
          onChange={setSort}
          placeholder={t('sidebar.placeholder.eventSort')}
        />
      </SectionItem>

      <SectionItem
        title={t('general.label.limit')}
        hint={t('sidebar.hint.eventLimit')}
        tab
      >
        <NumberInput
          value={limit}
          onChange={setLimit}
          min={MIN_LIMIT}
          max={MAX_LIMIT}
          step={1}
        />
      </SectionItem>
    </Section>
  );
};

export default EventSearch;
