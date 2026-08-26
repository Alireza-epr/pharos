import { IVesselIdentity } from '@packages/types';
import { EVesselDataset, EVesselRegistryInfoData } from '@packages/enum';
import {
  buildVesselIdentityRequestParams,
  getVesselDisplayFields,
  getVesselKey,
} from '../src/helpers/utils/vesselUtils';

const selfReportedOnly: IVesselIdentity = {
  dataset: 'public-global-vessel-identity:v4.0',
  selfReportedInfo: [
    {
      shipname: 'HAMMERSHUS',
      ssvid: '219026000',
      flag: 'DNK',
      imo: '9812107',
      callsign: 'OXPQ2',
    },
  ],
  combinedSourcesInfo: [
    {
      vesselId: '2cb75b670-08a6-fc17-8fd9-5d9d10a0fbdf',
      shiptypes: [{ name: 'PASSENGER' }],
      geartypes: [{ name: 'PASSENGER' }],
    },
  ],
};

const registryOnly: IVesselIdentity = {
  dataset: 'public-global-vessel-identity:v4.0',
  registryInfo: [
    {
      id: 'registry-id-1',
      shipname: 'REGISTRY ONLY',
      ssvid: '111111111',
      flag: 'ESP',
    },
  ],
};

describe('getVesselDisplayFields', () => {
  it('prefers_selfReportedInfo_over_registryInfo_when_both_are_present', () => {
    const vessel: IVesselIdentity = {
      ...selfReportedOnly,
      registryInfo: [
        { shipname: 'WRONG NAME', ssvid: '000000000', flag: 'XXX' },
      ],
    };

    const fields = getVesselDisplayFields(vessel);

    expect(fields.shipName).toBe('HAMMERSHUS');
    expect(fields.mmsi).toBe('219026000');
  });

  it('falls_back_to_registryInfo_when_selfReportedInfo_is_absent', () => {
    const fields = getVesselDisplayFields(registryOnly);

    expect(fields.shipName).toBe('REGISTRY ONLY');
    expect(fields.flag).toBe('ESP');
  });

  it('reads_vessel_and_gear_type_from_combinedSourcesInfo', () => {
    const fields = getVesselDisplayFields(selfReportedOnly);

    expect(fields.vesselType).toBe('PASSENGER');
    expect(fields.gearType).toBe('PASSENGER');
  });

  it('returns_undefined_fields_for_a_vessel_with_no_identity_sources_at_all', () => {
    const fields = getVesselDisplayFields({
      dataset: 'public-global-vessel-identity:v4.0',
    });

    expect(fields.shipName).toBeUndefined();
    expect(fields.flag).toBeUndefined();
    expect(fields.mmsi).toBeUndefined();
    expect(fields.imo).toBeUndefined();
    expect(fields.callsign).toBeUndefined();
    expect(fields.vesselType).toBeUndefined();
    expect(fields.gearType).toBeUndefined();
  });
});

describe('getVesselKey', () => {
  it('prefers_combinedSourcesInfo_vesselId', () => {
    expect(getVesselKey(selfReportedOnly)).toBe(
      '2cb75b670-08a6-fc17-8fd9-5d9d10a0fbdf',
    );
  });

  it('falls_back_to_selfReportedInfo_id_when_combinedSourcesInfo_is_absent', () => {
    const vessel: IVesselIdentity = {
      dataset: 'public-global-vessel-identity:v4.0',
      selfReportedInfo: [{ id: 'self-reported-id-1', shipname: 'X' }],
    };

    expect(getVesselKey(vessel)).toBe('self-reported-id-1');
  });

  it('falls_back_to_registryInfo_id_as_a_last_resort', () => {
    expect(getVesselKey(registryOnly)).toBe('registry-id-1');
  });

  it('returns_undefined_when_no_id_source_is_present', () => {
    expect(
      getVesselKey({ dataset: 'public-global-vessel-identity:v4.0' }),
    ).toBeUndefined();
  });

  // Regression: MMSI/IMO/callsign are vessel *attributes*, not identifiers --
  // GFW can (and does) return two different identity records sharing the
  // same MMSI. getVesselKey() must tell them apart; the earlier bug this
  // fixes was using MMSI directly as a React key and colliding across them.
  it('gives_two_different_vessels_sharing_the_same_MMSI_distinct_keys', () => {
    const vesselA: IVesselIdentity = {
      dataset: 'public-global-vessel-identity:v4.0',
      selfReportedInfo: [
        { id: 'vessel-a-id', shipname: 'ALPHA', ssvid: '247575000' },
      ],
    };
    const vesselB: IVesselIdentity = {
      dataset: 'public-global-vessel-identity:v4.0',
      selfReportedInfo: [
        { id: 'vessel-b-id', shipname: 'BRAVO', ssvid: '247575000' },
      ],
    };

    expect(getVesselKey(vesselA)).not.toBe(getVesselKey(vesselB));
  });
});

describe('buildVesselIdentityRequestParams', () => {
  it('builds_the_exact_params_useVesselIdentity_sends_for_a_given_id', () => {
    const params = buildVesselIdentityRequestParams(
      '2cb75b670-08a6-fc17-8fd9-5d9d10a0fbdf',
    );

    expect(params['datasets[0]']).toBe(EVesselDataset.vesselIdentity);
    expect(params['ids[0]']).toBe('2cb75b670-08a6-fc17-8fd9-5d9d10a0fbdf');
    expect(params['registries-info-data']).toBe(EVesselRegistryInfoData.ALL);
  });

  it('produces_different_params_for_different_ids', () => {
    const a = buildVesselIdentityRequestParams('vessel-a');
    const b = buildVesselIdentityRequestParams('vessel-b');

    expect(a['ids[0]']).not.toBe(b['ids[0]']);
  });
});
