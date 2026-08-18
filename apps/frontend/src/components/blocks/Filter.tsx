import Section from '../common/section/Section';
import SectionItem from '../common/section/SectionItem';
import SectionInputGroup from '../common/section/SectionInputGroup';
import NumberInput from '../common/inputs/NumberInput';
import CheckboxInput from '../common/inputs/CheckboxInput';
import ChipGroupInput from '../common/inputs/ChipGroupInput';
import { useTranslator } from '../../hooks/translator';
import { useFilterStore } from '../../stores/filterStore';
import {
  E4wingsDatasets,
  E4wingsDatasetsUI,
  EInclusionMode,
  EMatchFilter,
  EReasonCodesStatic,
  TInclusionMode,
} from '@packages/enum';
import { IFilterStoreStates } from '../../helpers/types/storeTypes';
import DropdownInput from '../common/inputs/DropdownInput';
import TextInput from '../common/inputs/TextInput';
import {
  dataset_version_options,
  flags_options,
  gear_types_options,
  matched_options,
  minimumDistanceFromPorts_options,
  neural_vessel_type_options,
  speed_options,
  vessel_types_options,
} from '../../helpers/fixtures/filters';
import { TDatasetVersion } from '@packages/types';
import { downloadJSON, openJSONFile } from '../../helpers/utils/downloadUtils';
import { isValidFilterQuery } from '../../helpers/utils/validationUtils';
import { useMessageStore } from '../../stores/messageStore';

export interface IFilterProps {}

const reasonCodes = Object.values(EReasonCodesStatic);

const Filter = () => {
  const filter = useFilterStore((s) => s.filter);
  const setFilter = useFilterStore((s) => s.setFilter);

  const filtersUI = useFilterStore((s) => s.filtersUI);
  const setFiltersUI = useFilterStore((s) => s.setFiltersUI);

  const getFilterConfig = useFilterStore((s) => s.getFilterConfig);
  const importFilterConfig = useFilterStore((s) => s.importFilterConfig);

  const { t } = useTranslator();

  const updateFilter = (patch: Partial<IFilterStoreStates['filter']>) => {
    setFilter((prev) => ({ ...prev, ...patch }));
  };

  const updateFilterUI = (patch: Partial<IFilterStoreStates['filtersUI']>) => {
    setFiltersUI((prev) => ({ ...prev, ...patch }));
  };

  const toggleReasonCode = (
    a_Mode: TInclusionMode,
    a_Code: EReasonCodesStatic,
  ) => {
    setFilter((prev) => {
      const include = (prev.reason_codes_include ?? []) as EReasonCodesStatic[];
      const exclude = (prev.reason_codes_exclude ?? []) as EReasonCodesStatic[];
      if (a_Mode === EInclusionMode.include) {
        const isActive = include.includes(a_Code);
        return {
          ...prev,
          reason_codes_include: isActive
            ? include.filter((c) => c !== a_Code)
            : [...include, a_Code],
          reason_codes_exclude: exclude.filter((c) => c !== a_Code),
        };
      }
      const isActive = exclude.includes(a_Code);
      return {
        ...prev,
        reason_codes_exclude: isActive
          ? exclude.filter((c) => c !== a_Code)
          : [...exclude, a_Code],
        reason_codes_include: include.filter((c) => c !== a_Code),
      };
    });
  };

  const handleExport = () => {
    downloadJSON(getFilterConfig(), 'filter');
  };

  const handleImport = () => {
    const reportInvalid = () =>
      useMessageStore.getState().setWarn(t('general.text.invalidImportFile'));

    openJSONFile((data) => {
      if (!isValidFilterQuery(data)) {
        reportInvalid();
        return;
      }
      importFilterConfig(data);
    }, reportInvalid);
  };

  return (
    <Section
      title={t('sidebar.titles.filter')}
      collapsible={false}
      showExport
      showImport
      onExport={handleExport}
      onImport={handleImport}
    >
      <SectionItem title={t('sidebar.label.datasets')} collapsible={false} tab >
        {(
          Object.entries(filtersUI.datasets) as [
            E4wingsDatasets,
            { active: boolean; version: TDatasetVersion },
          ][]
        ).map(([key], index) => {
          return (
            <SectionInputGroup direction="row" tab key={index}>
              <div style={{width: "70%"}}>
                <CheckboxInput
                  label={E4wingsDatasetsUI[key]}
                  checked={filtersUI.datasets[key].active}
                  onChange={(v) =>
                    updateFilterUI({
                      datasets: {
                        ...filtersUI.datasets,
                        [key]: {
                          ...filtersUI.datasets[key],
                          active: v,
                        },
                      },
                    })
                  }
                />
              </div>
              <div style={{width: "30%", display: "flex" }}>
                <DropdownInput
                  options={dataset_version_options}
                  value={filtersUI.datasets[key].version}
                  onChange={(v) =>
                    updateFilterUI({
                      datasets: {
                        ...filtersUI.datasets,
                        [key]: {
                          ...filtersUI.datasets[key],
                          version: v,
                        },
                      },
                    })
                  }
                />
              </div>
            </SectionInputGroup>
          );
        })}
      </SectionItem>

      <SectionItem
        title={t('sidebar.titles.datasetsFilter')}
        collapsible={false}
        caveat={t('sidebar.hint.highlightedDataset')}
        tab
      >
        <SectionItem
          title={E4wingsDatasetsUI['public-global-sar-presence']}
          tab
          collapsible={false}
          active={filtersUI.datasets['public-global-sar-presence'].active}
        >
          <SectionInputGroup direction="column" tab>
            <DropdownInput
              title={t('sidebar.titles.matchingStatus')}
              placeholder={t('sidebar.placeholder.none')}
              onClear={() =>
                updateFilterUI({ matchingStatus: EMatchFilter.all })
              }
              value={filtersUI.matchingStatus}
              options={matched_options}
              onChange={(v) => updateFilterUI({ matchingStatus: v })}
            />
            <DropdownInput
              title={t('sidebar.label.flags')}
              onClear={() => updateFilterUI({ flags: [] })}
              hint={t('sidebar.hint.multipleSelect')}
              value={filtersUI.flags}
              options={flags_options}
              onChange={(v) => updateFilterUI({ flags: v })}
              multiple
            />
            <DropdownInput
              title={t('sidebar.label.vesselTypes')}
              onClear={() => updateFilterUI({ vesselTypes: [] })}
              hint={t('sidebar.hint.multipleSelect')}
              value={filtersUI.vesselTypes}
              options={vessel_types_options}
              onChange={(v) => updateFilterUI({ vesselTypes: v })}
              multiple
            />
            <DropdownInput
              title={t('sidebar.label.gearTypes')}
              onClear={() => updateFilterUI({ gearTypes: [] })}
              hint={t('sidebar.hint.multipleSelect')}
              value={filtersUI.gearTypes}
              options={gear_types_options}
              onChange={(v) => updateFilterUI({ gearTypes: v })}
              multiple
            />
            <DropdownInput
              title={t('sidebar.label.neuralVesselType')}
              placeholder={t('sidebar.placeholder.none')}
              onClear={() => updateFilterUI({ neuralVesselType: '' })}
              value={filtersUI.neuralVesselType}
              options={neural_vessel_type_options}
              onChange={(v) => updateFilterUI({ neuralVesselType: v })}
            />
            <TextInput
              title={t('sidebar.label.vesselId')}
              value={filtersUI.vessel_id}
              onChange={(v) => updateFilterUI({ vessel_id: v })}
              caveat={t('sidebar.caveat.apiInternalId')}
            />
          </SectionInputGroup>
        </SectionItem>

        <SectionItem
          title={E4wingsDatasetsUI['public-global-presence']}
          tab
          collapsible={false}
          active={filtersUI.datasets['public-global-presence'].active}
        >
          <SectionInputGroup direction="column" tab>
            <DropdownInput
              title={t('sidebar.label.flags')}
              onClear={() => updateFilterUI({ flags: [] })}
              hint={t('sidebar.hint.multipleSelect')}
              value={filtersUI.flags}
              options={flags_options}
              onChange={(v) => updateFilterUI({ flags: v })}
              multiple
            />
            <DropdownInput
              title={t('sidebar.label.vesselTypes')}
              onClear={() => updateFilterUI({ vesselTypes: [] })}
              hint={t('sidebar.hint.multipleSelect')}
              value={filtersUI.vesselTypes}
              options={vessel_types_options}
              onChange={(v) => updateFilterUI({ vesselTypes: v })}
              multiple
            />
            <DropdownInput
              title={t('sidebar.label.speeds')}
              onClear={() => updateFilterUI({ speeds: [] })}
              hint={t('sidebar.hint.multipleSelect')}
              value={filtersUI.speeds}
              options={speed_options}
              onChange={(v) => updateFilterUI({ speeds: v })}
              multiple
            />
          </SectionInputGroup>
        </SectionItem>

        <SectionItem
          title={E4wingsDatasetsUI['public-global-fishing-effort']}
          tab
          collapsible={false}
          active={filtersUI.datasets['public-global-fishing-effort'].active}
        >
          <SectionInputGroup direction="column" tab>
            <DropdownInput
              title={t('sidebar.label.flags')}
              onClear={() => updateFilterUI({ flags: [] })}
              hint={t('sidebar.hint.multipleSelect')}
              value={filtersUI.flags}
              options={flags_options}
              onChange={(v) => updateFilterUI({ flags: v })}
              multiple
            />
            <DropdownInput
              title={t('sidebar.label.gearTypes')}
              onClear={() => updateFilterUI({ gearTypes: [] })}
              hint={t('sidebar.hint.multipleSelect')}
              value={filtersUI.gearTypes}
              options={gear_types_options}
              onChange={(v) => updateFilterUI({ gearTypes: v })}
              multiple
            />
            <DropdownInput
              title={t('sidebar.label.minimumDistanceFromPorts')}
              placeholder={t('sidebar.placeholder.none')}
              onClear={() => updateFilterUI({ minimumDistanceFromPorts: '' })}
              value={filtersUI.minimumDistanceFromPorts}
              options={minimumDistanceFromPorts_options}
              onChange={(v) => updateFilterUI({ minimumDistanceFromPorts: v })}
            />
            <TextInput
              title={t('sidebar.label.vesselId')}
              value={filtersUI.vessel_id}
              onChange={(v) => updateFilterUI({ vessel_id: v })}
              caveat={t('sidebar.caveat.apiInternalId')}
            />
          </SectionInputGroup>
        </SectionItem>
      </SectionItem>

      <SectionItem title={t('sidebar.label.triageScore')} collapsible={false} tab >
        <SectionInputGroup direction="row">
          <NumberInput
            label={t('general.label.min')}
            value={filter.triage_score_min ?? 0}
            min={0}
            max={1}
            step={0.01}
            onChange={(v) => updateFilter({ triage_score_min: v })}
          />
          <NumberInput
            label={t('general.label.max')}
            value={filter.triage_score_max ?? 1}
            min={0}
            max={1}
            step={0.01}
            onChange={(v) => updateFilter({ triage_score_max: v })}
          />
        </SectionInputGroup>
      </SectionItem>

      <SectionItem
        title={t('sidebar.label.uncertaintyScore')}
        collapsible={false}
        tab
      >
        <SectionInputGroup direction="row">
          <NumberInput
            label={t('general.label.min')}
            value={filter.uncertainty_score_min ?? 0}
            min={0}
            max={1}
            step={0.01}
            onChange={(v) => updateFilter({ uncertainty_score_min: v })}
          />
          <NumberInput
            label={t('general.label.max')}
            value={filter.uncertainty_score_max ?? 1}
            min={0}
            max={1}
            step={0.01}
            onChange={(v) => updateFilter({ uncertainty_score_max: v })}
          />
        </SectionInputGroup>
      </SectionItem>

      <SectionItem
        title={t('sidebar.label.distanceToCoast')}
        collapsible={false}
        tab
      >
        <SectionInputGroup direction="row">
          <NumberInput
            label={t('general.label.min')}
            value={filter.distance_to_coast_km_min ?? 0}
            min={0}
            onChange={(v) => updateFilter({ distance_to_coast_km_min: v })}
          />
          <NumberInput
            label={t('general.label.max')}
            value={filter.distance_to_coast_km_max ?? 100}
            min={0}
            onChange={(v) => updateFilter({ distance_to_coast_km_max: v })}
          />
        </SectionInputGroup>
      </SectionItem>

      <SectionItem title={t('sidebar.label.bathymetry')} collapsible={false} tab>
        <SectionInputGroup direction="row">
          <NumberInput
            label={t('general.label.min')}
            value={filter.bathymetry_min ?? 0}
            onChange={(v) => updateFilter({ bathymetry_min: v })}
          />
          <NumberInput
            label={t('general.label.max')}
            value={filter.bathymetry_max ?? 0}
            onChange={(v) => updateFilter({ bathymetry_max: v })}
          />
        </SectionInputGroup>
      </SectionItem>

      <SectionItem
        title={t('bottomPanel.column.detectionId')}
        collapsible={false}
        tab
      >
        <TextInput
          value={filter.event_id ?? ''}
          onChange={(v) => updateFilter({ event_id: v })}
        />
      </SectionItem>

      <SectionItem title={t('sidebar.label.contextZone')} collapsible={false} tab>
        <SectionInputGroup direction="column">
          <CheckboxInput
            label={t('sidebar.label.insideEezOnly')}
            checked={filter.only_inside_eez ?? false}
            onChange={(v) => updateFilter({ only_inside_eez: v })}
          />
          <CheckboxInput
            label={t('sidebar.label.insideMpaOnly')}
            checked={filter.only_inside_mpa ?? false}
            onChange={(v) => updateFilter({ only_inside_mpa: v })}
          />
        </SectionInputGroup>
      </SectionItem>

      <SectionItem
        title={t('sidebar.label.reasonCodesInclude')}
        collapsible={false}
        tab
      >
        <ChipGroupInput
          values={reasonCodes}
          active={(filter.reason_codes_include ?? []) as EReasonCodesStatic[]}
          onToggle={(code) => toggleReasonCode(EInclusionMode.include, code)}
          variant={EInclusionMode.include}
        />
      </SectionItem>

      <SectionItem
        title={t('sidebar.label.reasonCodesExclude')}
        collapsible={false}
        tab
      >
        <ChipGroupInput
          values={reasonCodes}
          active={(filter.reason_codes_exclude ?? []) as EReasonCodesStatic[]}
          onToggle={(code) => toggleReasonCode(EInclusionMode.exclude, code)}
          variant={EInclusionMode.exclude}
        />
      </SectionItem>
    </Section>
  );
};

export default Filter;
