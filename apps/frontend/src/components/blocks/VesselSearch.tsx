import Section from '../common/section/Section';
import SectionItem from '../common/section/SectionItem';
import TextInput from '../common/inputs/TextInput';
import DropdownInput from '../common/inputs/DropdownInput';
import NumberInput from '../common/inputs/NumberInput';
import { useTranslator } from '../../hooks/translator';
import { useVesselSearchStore } from '../../stores/vesselSearchStore';
import {
  vesselIncludeOptions,
  vesselMatchFieldOptions,
} from '../../helpers/fixtures/query';

export interface IVesselSearchProps {}

const MIN_LIMIT = 1;
const MAX_LIMIT = 50;

// The Vessel tab's search config block -- same Section/SectionItem shape as
// AdvancedQuery/Filter on the Report tab, but for GET /vessels/search's own
// (much smaller) parameter set. `datasets` isn't exposed here: GFW currently
// allows only one legal value, so the store sends it fixed rather than
// showing a picker with nothing to actually choose.
const VesselSearch = () => {
  const { t } = useTranslator();

  const query = useVesselSearchStore((s) => s.query);
  const setQuery = useVesselSearchStore((s) => s.setQuery);
  const where = useVesselSearchStore((s) => s.where);
  const setWhere = useVesselSearchStore((s) => s.setWhere);
  const matchFields = useVesselSearchStore((s) => s.matchFields);
  const setMatchFields = useVesselSearchStore((s) => s.setMatchFields);
  const includes = useVesselSearchStore((s) => s.includes);
  const setIncludes = useVesselSearchStore((s) => s.setIncludes);
  const limit = useVesselSearchStore((s) => s.limit);
  const setLimit = useVesselSearchStore((s) => s.setLimit);

  return (
    <Section title={t('sidebar.titles.vesselSearch')}>
      <SectionItem
        title={t('sidebar.label.vesselQuery')}
        hint={t('sidebar.hint.vesselQuery')}
        tab
      >
        <TextInput
          value={query}
          onChange={setQuery}
          placeholder={t('sidebar.placeholder.vesselQuery')}
          testId="vessel-query-input"
        />
      </SectionItem>

      <SectionItem
        title={t('sidebar.label.rawQuery')}
        hint={t('sidebar.hint.rawQuery')}
        tab
      >
        <TextInput
          value={where}
          onChange={setWhere}
          placeholder={t('sidebar.placeholder.rawQuery')}
          testId="vessel-where-input"
        />
      </SectionItem>

      <SectionItem
        title={t('sidebar.label.matchFields')}
        hint={t('sidebar.hint.matchFields')}
        tab
      >
        <DropdownInput
          value={matchFields}
          options={vesselMatchFieldOptions}
          onChange={setMatchFields}
          onClear={() => setMatchFields([])}
          clearLabel={t('general.label.clear')}
          hint={t('sidebar.hint.multipleSelect')}
          multiple
        />
      </SectionItem>

      <SectionItem
        title={t('sidebar.label.includes')}
        hint={t('sidebar.hint.includes')}
        tab
      >
        <DropdownInput
          value={includes}
          options={vesselIncludeOptions}
          onChange={setIncludes}
          onClear={() => setIncludes([])}
          clearLabel={t('general.label.clear')}
          hint={t('sidebar.hint.multipleSelect')}
          multiple
        />
      </SectionItem>

      <SectionItem
        title={t('general.label.limit')}
        hint={t('sidebar.hint.limit')}
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

export default VesselSearch;
