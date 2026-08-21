import { EContextLayers, EGeoJSONGeometryType } from '@packages/enum';

// The global setup (tests/setup/jest.mocks.ts) strips @turf/turf down to a
// bare `{ config: jest.fn() }` stub for every test file. getRegionOptions()
// only *wires* turf's bbox()/centroid() output onto each feature -- it isn't
// responsible for their geometry math -- so this override supplies a
// deterministic fake that mirrors turf's one real, relevant failure mode:
// it throws on a feature with an empty `coordinates: []` (a real, confirmed
// gap in the source data -- e.g. EEZ MRGID 48998 "Overlapping claim Perejil
// Island", and ~22% of MPA features), and returns fixed values otherwise.
const mockCentroidGeometry = { type: 'Point', coordinates: [5, 6] };

jest.mock('@turf/turf', () => ({
  bbox: (f: any) => {
    if (f.geometry.coordinates.length === 0) {
      throw new Error('coordinates must contain numbers');
    }
    return [1, 2, 3, 4];
  },
  centroid: () => ({
    type: 'Feature',
    properties: {},
    geometry: { type: 'Point', coordinates: [5, 6] },
  }),
}));

import { getRegionOptions } from '../src/helpers/geo/regionOptions';

// getRegionOptions() returns the full FeatureCollection (or undefined for an
// unsupported dataset); these tests only care about eez/mpa, which always
// resolve, so unwrap `.features` once here rather than asserting-non-null
// in every test.
const featuresOf = (a_Dataset: EContextLayers.eez | EContextLayers.mpa) =>
  getRegionOptions(a_Dataset)!.features;

describe('getRegionOptions', () => {
  it('returns_a_GeoJSON_FeatureCollection_for_eez_and_mpa', () => {
    expect(getRegionOptions(EContextLayers.eez)?.type).toBe('FeatureCollection');
    expect(getRegionOptions(EContextLayers.mpa)?.type).toBe('FeatureCollection');
  });

  it('returns_undefined_for_an_unsupported_dataset', () => {
    expect(getRegionOptions(EContextLayers.bathymetry)).toBeUndefined();
  });

  it('resolves_a_known_EEZ_id_to_its_title_and_the_wired_bbox_and_centroid', () => {
    const usAmericanSamoa = featuresOf(EContextLayers.eez).find(
      (o) => o.properties.id === '8444',
    );

    expect(usAmericanSamoa).toBeDefined();
    expect(usAmericanSamoa!.properties.title).toBe(
      'United States Exclusive Economic Zone (American Samoa)',
    );
    expect(usAmericanSamoa!.geometry).toEqual(mockCentroidGeometry);
    expect(usAmericanSamoa!.bbox).toEqual([1, 2, 3, 4]);
  });

  it('resolves_a_known_MPA_id_to_its_title_and_the_wired_bbox_and_centroid', () => {
    const capDesTroisFourches = featuresOf(EContextLayers.mpa).find(
      (o) => o.properties.id === '902704',
    );

    expect(capDesTroisFourches).toBeDefined();
    expect(capDesTroisFourches!.properties.title).toBe('Cap des trois Fourches');
    expect(capDesTroisFourches!.geometry).toEqual(mockCentroidGeometry);
    expect(capDesTroisFourches!.bbox).toEqual([1, 2, 3, 4]);
  });

  it('gives_every_returned_EEZ_and_MPA_feature_a_string_id_and_title', () => {
    const eez = featuresOf(EContextLayers.eez);
    const mpa = featuresOf(EContextLayers.mpa);

    expect(eez.length).toBeGreaterThan(0);
    expect(mpa.length).toBeGreaterThan(0);

    for (const option of [...eez, ...mpa]) {
      expect(option.type).toBe('Feature');
      expect(option.geometry.type).toBe(EGeoJSONGeometryType.Point);
      expect(typeof option.properties.id).toBe('string');
      expect(typeof option.properties.title).toBe('string');
    }
  });

  it('returns_the_same_FeatureCollection_instance_on_repeated_calls', () => {
    // Memoized: the bbox/centroid pass over every feature should only run once.
    expect(getRegionOptions(EContextLayers.eez)).toBe(
      getRegionOptions(EContextLayers.eez),
    );
    expect(getRegionOptions(EContextLayers.mpa)).toBe(
      getRegionOptions(EContextLayers.mpa),
    );
  });

  it('skips_the_real_EEZ_feature_with_no_boundary_instead_of_crashing_the_whole_dataset', () => {
    // MRGID 48998 "Overlapping claim Perejil Island: Spain / Morocco" carries
    // `coordinates: []` in the real committed dataset.
    const features = featuresOf(EContextLayers.eez);

    expect(features.find((o) => o.properties.id === '48998')).toBeUndefined();
    // 285 EEZ features on disk, one unusable.
    expect(features.length).toBe(284);
  });

  it('skips_MPA_features_with_no_boundary_instead_of_crashing_the_whole_dataset', () => {
    const features = featuresOf(EContextLayers.mpa);

    // ~22% of the real MPA dataset carries an empty geometry; every surviving
    // option must still have come from a feature bbox()/centroid() accepted.
    expect(features.length).toBeGreaterThan(0);
    expect(features.length).toBeLessThan(17172);
  });
});
