import Section from '../common/section/Section';
import SectionItem from '../common/section/SectionItem';
import SectionInputGroup from '../common/section/SectionInputGroup';
import TextInput from '../common/inputs/TextInput';
import ButtonInput from '../common/inputs/ButtonInput';
import { useTranslator } from '../../hooks/translator';
import { IEventSchema } from '@packages/types';
import { useVesselIdentity } from '../../hooks/useVesselIdentity';
import {
  buildVesselIdentityRequestParams,
  getVesselDisplayFields,
  getVesselKey,
} from '../../helpers/utils/vesselUtils';
import { downloadJSON } from '../../helpers/utils/downloadUtils';

export interface IVesselIdentityContextProps {
  event: IEventSchema;
}

// Shown only for a matched detection whose raw_metadata carries a resolvable
// vesselId -- fetches (and caches, see useVesselIdentity) that vessel's full
// identity from GFW on demand, purely for display: this never feeds
// triage_score/uncertainty_score, and nothing here is persisted back onto
// the event.
const VesselIdentityContext = (props: IVesselIdentityContextProps) => {
  const { t } = useTranslator();
  const vesselId = props.event.raw_metadata.vesselId;
  const { vessel, loading } = useVesselIdentity(vesselId || undefined);

  if (!vesselId) return null;

  if (vessel === undefined) {
    return (
      <Section
        title={t('detailPanel.title.vesselIdentity')}
        collapsible={false}
      >
        <span className="font-size-xs font-light font-family-header sub-text">
          {loading ? t('detailPanel.text.vesselIdentityLoading') : ''}
        </span>
      </Section>
    );
  }

  if (vessel === null) {
    return (
      <Section
        title={t('detailPanel.title.vesselIdentity')}
        collapsible={false}
      >
        <span className="font-size-xs font-light font-family-header sub-text">
          {t('detailPanel.text.vesselIdentityNotFound')}
        </span>
      </Section>
    );
  }

  const fields = getVesselDisplayFields(vessel);
  const owner = vessel.registryOwners?.[0]?.name;
  const tonnageGt = vessel.registryInfo?.[0]?.tonnageGt;

  return (
    <Section title={t('detailPanel.title.vesselIdentity')} collapsible={false}>
      <SectionItem title={t('detailPanel.label.shipName')} tab>
        <TextInput readOnly copiable value={fields.shipName ?? '—'} />
      </SectionItem>
      <SectionItem title={t('detailPanel.label.flag')} tab>
        <TextInput readOnly copiable value={fields.flag ?? '—'} />
      </SectionItem>
      <SectionItem title={t('detailPanel.label.mmsi')} tab>
        <TextInput readOnly copiable value={fields.mmsi ?? '—'} />
      </SectionItem>
      <SectionItem title={t('detailPanel.label.imo')} tab>
        <TextInput readOnly copiable value={fields.imo ?? '—'} />
      </SectionItem>
      <SectionItem title={t('detailPanel.label.callSign')} tab>
        <TextInput readOnly copiable value={fields.callsign ?? '—'} />
      </SectionItem>
      <SectionItem title={t('detailPanel.label.vesselType')} tab>
        <TextInput readOnly copiable value={fields.vesselType ?? '—'} />
      </SectionItem>
      <SectionItem title={t('detailPanel.label.gearType')} tab>
        <TextInput readOnly copiable value={fields.gearType ?? '—'} />
      </SectionItem>
      {owner && (
        <SectionItem title={t('detailPanel.label.registryOwner')} tab>
          <TextInput readOnly copiable value={owner} />
        </SectionItem>
      )}
      {tonnageGt != null && (
        <SectionItem title={t('detailPanel.label.tonnageGt')} tab>
          <TextInput readOnly copiable value={String(tonnageGt)} />
        </SectionItem>
      )}
      <SectionInputGroup direction='column'>
        <ButtonInput
          label={t('detailPanel.label.downloadVesselIdentity')}
          onClick={() =>
            // The full raw record as GFW returned it -- every field, not
            // just what the SectionItems above summarize.
            downloadJSON(
              vessel,
              `vessel_identity_${fields.shipName ?? getVesselKey(vessel) ?? vesselId}`,
            )
          }
          testId="download-vessel-identity-button"
        />
        <ButtonInput
          label={t('detailPanel.label.downloadConfig')}
          onClick={() =>
            // The exact GET /vessels params sent to GFW for this vessel --
            // same "download config" idea as RunMetadata.tsx's button, just
            // for the request this section itself made.
            downloadJSON(
              buildVesselIdentityRequestParams(vesselId),
              `vessel_identity_config_${fields.shipName ?? getVesselKey(vessel) ?? vesselId}`,
            )
          }
          testId="download-vessel-identity-config-button"
        />
      </SectionInputGroup>
    </Section>
  );
};

export default VesselIdentityContext;
