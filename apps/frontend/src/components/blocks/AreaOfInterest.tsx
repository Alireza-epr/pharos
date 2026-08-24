import Section from '../common/section/Section';
import SectionItem from '../common/section/SectionItem';
import SectionInputGroup from '../common/section/SectionInputGroup';
import ButtonInput from '../common/inputs/ButtonInput';
import DropdownInput, { IDropdownOption } from '../common/inputs/DropdownInput';
import NumberInput from '../common/inputs/NumberInput';
import { useTranslator } from '../../hooks/translator';
import { useEffect, useMemo } from 'react';
import {
  AOI_RADIUS_MIN_KM,
  useAOIStore,
} from '../../stores/areaOfInterestStore';
import { EContextLayers, EGeoJSONGeometryType } from '@packages/enum';
import { downloadJSON, openJSONFile } from '../../helpers/utils/downloadUtils';
import { isValidAOIQuery } from '../../helpers/utils/validationUtils';
import { useMessageStore } from '../../stores/messageStore';
import { useFetchRegions } from '../../hooks/fetch';
import { useSyncRegionGeometry } from '../../hooks/useSyncRegionGeometry';

export const EAreaOfInterestTools = {
  zonal: 'zonal',
  point: 'point',
  eez: 'eez',
  mpa: 'mpa',
} as const;
export type TAreaOfInterestTools =
  (typeof EAreaOfInterestTools)[keyof typeof EAreaOfInterestTools];

export interface IAreaOfInterestProps {}

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

  const setEezGeometries = useAOIStore((s) => s.setEezGeometries);
  const setMpaGeometries = useAOIStore((s) => s.setMpaGeometries);

  const getAOI = useAOIStore((s) => s.getAOI);
  const importAOI = useAOIStore((s) => s.importAOI);

  const { t } = useTranslator();

  const eezFetch = useFetchRegions();
  const mpaFetch = useFetchRegions();

  // Fetches the chosen EEZ/MPA's full boundary so it can be drawn on the map
  // as the AOI (useAOIRegionBoundary) -- same fetch-by-id mechanism
  // ContextLayersBlock.tsx uses for an event's own EEZ/MPA. Always "enabled"
  // (no separate show-on-map toggle here): picking a region from the
  // dropdown *is* the AOI, so its boundary should always draw. The id array
  // is at most one entry -- eez/mpa selection is single-select -- and
  // resolves to [] on clear, which the hook reads as "clear the geometry".
  useSyncRegionGeometry(
    EContextLayers.eez,
    true,
    eezActive ? [eezActive.properties.id] : [],
    setEezGeometries,
  );
  useSyncRegionGeometry(
    EContextLayers.mpa,
    true,
    mpaActive ? [mpaActive.properties.id] : [],
    setMpaGeometries,
  );

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
    const eez = eezOptions.find((eez) => eez.properties.id === a_Value);
    setEEZActive(eez);
  };

  const handleChangeMPAOption = (a_Value: string) => {
    deactivateExcept(EAreaOfInterestTools.mpa);
    setFeature(null);
    const mpa = mpaOptions.find((mpa) => mpa.properties.id === a_Value);
    setMPAActive(mpa);
  };

  const handleClearEEZ = () => {
    setEEZActive(undefined);
  };

  const handleClearMPA = () => {
    setMPAActive(undefined);
  };

  useEffect(() => {
    const reportLoadFailed = () =>
      useMessageStore.getState().setWarn(t('sidebar.text.regionsLoadFailed'));

    eezFetch.execute(EContextLayers.eez).then((json) => {
      if (!json?.success) return reportLoadFailed();
      setEEZOptions(json.entries ?? []);
    });
    mpaFetch.execute(EContextLayers.mpa).then((json) => {
      if (!json?.success) return reportLoadFailed();
      setMPAOptions(json.entries ?? []);
    });
  }, []);

  // MPA alone is 17k+ rows -- derive the dropdown's plain {value,label} shape
  // once per fetch rather than re-mapping on every render.
  const eezDropdownOptions = useMemo<IDropdownOption<string>[]>(
    () =>
      eezOptions.map((o) => ({ value: o.properties.id, label: o.properties.title })),
    [eezOptions],
  );
  const mpaDropdownOptions = useMemo<IDropdownOption<string>[]>(
    () =>
      mpaOptions.map((o) => ({ value: o.properties.id, label: o.properties.title })),
    [mpaOptions],
  );

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
          placeholder={
            eezFetch.loading
              ? t('sidebar.placeholder.loadingRegions')
              : t('sidebar.placeholder.selectEEZ')
          }
          disabled={eezFetch.loading}
          searchable
          options={eezDropdownOptions}
          value={eezActive ? eezActive.properties.id : ''}
          onChange={handleChangeEEZOption}
          onClear={handleClearEEZ}
          clearLabel={t('general.label.clear')}
          testId="eez-select"
        />
      </SectionItem>

      <SectionItem title={t('sidebar.text.orChooseMPARegion')} tab >
        <DropdownInput
          placeholder={
            mpaFetch.loading
              ? t('sidebar.placeholder.loadingRegions')
              : t('sidebar.placeholder.selectMPA')
          }
          disabled={mpaFetch.loading}
          searchable
          options={mpaDropdownOptions}
          value={mpaActive ? mpaActive.properties.id : ''}
          onChange={handleChangeMPAOption}
          onClear={handleClearMPA}
          clearLabel={t('general.label.clear')}
          testId="mpa-select"
        />
      </SectionItem>
    </Section>
  );
};

export default AreaOfInterest;
