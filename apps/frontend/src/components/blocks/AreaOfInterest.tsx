import Section from '../common/section/Section';
import SectionItem from '../common/section/SectionItem';
import SectionInputGroup from '../common/section/SectionInputGroup';
import ButtonInput from '../common/inputs/ButtonInput';
import DropdownInput from '../common/inputs/DropdownInput';
import NumberInput from '../common/inputs/NumberInput';
import { useTranslator } from '../../hooks/translator';
import { useEffect } from 'react';
import { eez_options, mpa_options } from '../../helpers/fixtures/context';
import {
  AOI_RADIUS_MIN_KM,
  useAOIStore,
} from '../../stores/areaOfInterestStore';
import { EGeoJSONGeometryType, ERegionDatasets } from '@packages/enum';
import { isNumber, isObject, isString } from '@packages/utils';
import { downloadJSON, openJSONFile } from '../../helpers/utils/downloadUtils';
import { useMessageStore } from '../../stores/messageStore';
import { TAOIQuery } from '../../helpers/types/storeTypes';

export const EAreaOfInterestTools = {
  zonal: 'zonal',
  point: 'point',
  eez: 'eez',
  mpa: 'mpa',
} as const;
export type TAreaOfInterestTools =
  (typeof EAreaOfInterestTools)[keyof typeof EAreaOfInterestTools];

export interface IAreaOfInterestProps {}

// Matches the shape getAOI() produces (a standard GeoJSON Feature): a named
// region has null geometry and a region descriptor in properties; a drawn
// Zonal polygon has real geometry and null properties; a drawn Point has real
// (buffered) geometry plus its radius in properties. An imported file is
// trusted only if it could plausibly have come from this section's own export.
const isValidAOIQuery = (a_Data: unknown): a_Data is TAOIQuery => {
  if (a_Data === null) return true;
  if (!isObject(a_Data) || a_Data['type'] !== 'Feature') return false;

  const geometry = a_Data['geometry'];
  const hasValidGeometry =
    geometry === null ||
    (isObject(geometry) &&
      isString(geometry['type']) &&
      'coordinates' in geometry);
  if (!hasValidGeometry) return false;

  const properties = a_Data['properties'];
  return (
    properties === null ||
    (isObject(properties) &&
      ((isString(properties['region-id']) &&
        (properties['region-dataset'] === ERegionDatasets.eez ||
          properties['region-dataset'] === ERegionDatasets.mpa)) ||
        isNumber(properties['radius'])))
  );
};

const AreaOfInterest = () => {
  const zonal = useAOIStore((s) => s.zonal);
  const setZonal = useAOIStore((s) => s.setZonal);

  const point = useAOIStore((s) => s.point);
  const setPoint = useAOIStore((s) => s.setPoint);

  const feature = useAOIStore((s) => s.feature);
  const setFeature = useAOIStore((s) => s.setFeature);
  const radius = useAOIStore((s) => s.radius);
  const setRadius = useAOIStore((s) => s.setRadius);

  const eezOptions = useAOIStore((s) => s.eezOptions);
  const setEEZOptions = useAOIStore((s) => s.setEEZOptions);
  const eezActive = useAOIStore((s) => s.eezActive);
  const setEEZActive = useAOIStore((s) => s.setEEZActive);

  const mpaOptions = useAOIStore((s) => s.mpaOptions);
  const setMPAOptions = useAOIStore((s) => s.setMPAOptions);
  const mpaActive = useAOIStore((s) => s.mpaActive);
  const setMPAActive = useAOIStore((s) => s.setMPAActive);

  const getAOI = useAOIStore((s) => s.getAOI);
  const importAOI = useAOIStore((s) => s.importAOI);

  const { t } = useTranslator();

  const deactivateExcept = (a_Tool: TAreaOfInterestTools) => {
    switch (a_Tool) {
      case EAreaOfInterestTools.point:
        setZonal(false);
        setEEZActive(undefined);
        setMPAActive(undefined);
        break;
      case EAreaOfInterestTools.zonal:
        setPoint(false);
        setEEZActive(undefined);
        setMPAActive(undefined);
        break;
      case EAreaOfInterestTools.eez:
        setPoint(false);
        setZonal(false);
        setMPAActive(undefined);
        break;
      case EAreaOfInterestTools.mpa:
        setPoint(false);
        setZonal(false);
        setEEZActive(undefined);
        break;
    }
  };

  // A drawn AOI lives in `feature` (a standard GeoJSON Feature); its geometry
  // type tells us which tool owns it (tools are mutually exclusive and clear
  // each other's geometry).
  const zonalHasFeature = feature?.geometry.type === EGeoJSONGeometryType.Polygon;
  const pointHasFeature = feature?.geometry.type === EGeoJSONGeometryType.Point;

  const handleZonalClick = () => {
    // Re-clicking once a shape exists clears it (button reads "Clear Zonal").
    if (zonalHasFeature) {
      setFeature(null);
      setZonal(false);
      return;
    }
    deactivateExcept(EAreaOfInterestTools.zonal);
    setFeature(null);
    setZonal(!zonal);
  };

  const handlePointClick = () => {
    if (pointHasFeature) {
      setFeature(null);
      setPoint(false);
      return;
    }
    deactivateExcept(EAreaOfInterestTools.point);
    setFeature(null);
    setPoint(!point);
  };

  const handleChangeEEZOption = (a_Value: string) => {
    deactivateExcept(EAreaOfInterestTools.eez);
    setFeature(null);
    const eez = eezOptions.find((eez) => eez.value === a_Value);
    setEEZActive(eez);
  };

  const handleChangeMPAOption = (a_Value: string) => {
    deactivateExcept(EAreaOfInterestTools.mpa);
    setFeature(null);
    const mpa = mpaOptions.find((mpa) => mpa.value === a_Value);
    setMPAActive(mpa);
  };

  const handleClearEEZ = () => {
    setEEZActive(undefined);
  };

  const handleClearMPA = () => {
    setMPAActive(undefined);
  };

  useEffect(() => {
    setEEZOptions(eez_options);
    setMPAOptions(mpa_options);
  }, []);

  const handleExport = () => {
    const aoi = getAOI();
    if (!aoi) return;
    downloadJSON(aoi, 'area_of_interest');
  };

  const handleImport = () => {
    const reportInvalid = () =>
      useMessageStore.getState().setWarn(t('general.text.invalidImportFile'));

    openJSONFile((data) => {
      if (!isValidAOIQuery(data)) {
        reportInvalid();
        return;
      }
      importAOI(data);
    }, reportInvalid);
  };

  return (
    <Section
      title={t('sidebar.titles.areaOfInterest')}
      collapsible={false}
      testId="aoi-section-header"
      showExport
      showImport
      onExport={handleExport}
      onImport={handleImport}
    >
      <SectionItem title={t('sidebar.titles.drawOnMap')} tab >
        <SectionInputGroup>
          <ButtonInput
            label={
              zonalHasFeature
                ? t('general.label.clearZonal')
                : t('general.label.zonal')
            }
            onClick={handleZonalClick}
            active={zonal || zonalHasFeature}
          />
          <ButtonInput
            label={
              pointHasFeature
                ? t('general.label.clearPoint')
                : t('general.label.point')
            }
            onClick={handlePointClick}
            active={point || pointHasFeature}
          />
        </SectionInputGroup>
        {(point || pointHasFeature) && (
          <NumberInput
            label={t('sidebar.label.radiusKm')}
            value={radius}
            onChange={setRadius}
            min={AOI_RADIUS_MIN_KM}
            step={1}
            direction="row"
          />
        )}
      </SectionItem>

      <SectionItem title={t('sidebar.text.orChooseEEZRegion')} tab >
        <DropdownInput
          placeholder={t('sidebar.placeholder.selectEEZ')}
          options={eezOptions}
          value={eezActive ? eezActive.value : ''}
          onChange={handleChangeEEZOption}
          onClear={handleClearEEZ}
          clearLabel={t('general.label.clear')}
          testId="eez-select"
        />
      </SectionItem>

      <SectionItem title={t('sidebar.text.orChooseMPARegion')} tab >
        <DropdownInput
          placeholder={t('sidebar.placeholder.selectMPA')}
          options={mpaOptions}
          value={mpaActive ? mpaActive.value : ''}
          onChange={handleChangeMPAOption}
          onClear={handleClearMPA}
          clearLabel={t('general.label.clear')}
        />
      </SectionItem>
    </Section>
  );
};

export default AreaOfInterest;
