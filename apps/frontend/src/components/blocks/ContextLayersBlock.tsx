import Section from '../common/section/Section';
import { useTranslator } from '../../hooks/translator';
import { IEventSchema } from '@packages/types';
import SectionItem from '../common/section/SectionItem';
import TextInput from '../common/inputs/TextInput';
import CheckboxInput from '../common/inputs/CheckboxInput';
import { EContextLayers } from '@packages/enum';
import { useContextLayersStore } from '../../stores/contextLayersStore';
import { useSyncRegionGeometry } from '../../hooks/useSyncRegionGeometry';

export interface IContextLayersBlockProps {
  event: IEventSchema;
}

const ContextLayersBlock = (props: IContextLayersBlockProps) => {
  const { t } = useTranslator();

  const eezBoundaries = useContextLayersStore((s) => s.eezBoundaries);
  const setEezBoundaries = useContextLayersStore((s) => s.setEezBoundaries);
  const mpaZones = useContextLayersStore((s) => s.mpaZones);
  const setMpaZones = useContextLayersStore((s) => s.setMpaZones);
  const setEezGeometries = useContextLayersStore((s) => s.setEezGeometries);
  const setMpaGeometries = useContextLayersStore((s) => s.setMpaGeometries);

  // An event can carry more than one enrichment per layer (overlapping /
  // disputed EEZ claims) -- fetch every id, not just the first.
  const eezIds = props.event.context_layers[EContextLayers.eez].enrichments
    .map((e) => e.id)
    .filter((id): id is string => !!id);
  const mpaIds = props.event.context_layers[EContextLayers.mpa].enrichments
    .map((e) => e.id)
    .filter((id): id is string => !!id);

  useSyncRegionGeometry(
    EContextLayers.eez,
    eezBoundaries,
    eezIds,
    setEezGeometries,
  );
  useSyncRegionGeometry(EContextLayers.mpa, mpaZones, mpaIds, setMpaGeometries);

  // Bathymetry is a point-sampled depth reading at the event's own location,
  // not a boundary polygon -- there's nothing to fetch/draw for it the way
  // there is for EEZ/MPA, so it gets no "show on map" toggle.
  const showOnMapToggle: Partial<
    Record<EContextLayers, { checked: boolean; onChange: (v: boolean) => void }>
  > = {
    [EContextLayers.eez]: { checked: eezBoundaries, onChange: setEezBoundaries },
    [EContextLayers.mpa]: { checked: mpaZones, onChange: setMpaZones },
  };

  return (
    <Section title={t('detailPanel.title.contextLayers')} collapsible={false}>
      {Object.entries(props.event.context_layers)
        .filter(([_, value]) => value.enrichments.length > 0)
        .map(([name, layer], index) => {
          const toggle = showOnMapToggle[name as EContextLayers];

          return (
            <SectionItem title={name} key={index} tab>
              {layer.enrichments.map((e, index2) => {
                const value = e.value ?? e.label ?? '';
                return (
                  <TextInput
                    value={
                      name === EContextLayers.bathymetry ? `${value} m` : value
                    }
                    readOnly
                    copiable
                    key={index2}
                  />
                );
              })}
              {toggle && (
                <CheckboxInput
                  label={t('detailPanel.label.showOnMap')}
                  checked={toggle.checked}
                  onChange={toggle.onChange}
                />
              )}
            </SectionItem>
          );
        })}
    </Section>
  );
};

export default ContextLayersBlock;
