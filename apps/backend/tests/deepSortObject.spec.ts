import { deepSortObject } from '@packages/utils';

describe('deepSortObject', () => {
  it('preserves_the_order_of_a_bbox_array', () => {
    const bbox = [-173.77, -17.56, -165.2, -10.02];

    expect(deepSortObject({ bbox })).toEqual({ bbox });
  });

  it('preserves_lng_lat_order_in_a_GeoJSON_Point_coordinates_array', () => {
    const geom = {
      type: 'Point',
      coordinates: [-170.20249999999993, -14.024903846153846],
    };

    expect(deepSortObject(geom).coordinates).toEqual(geom.coordinates);
  });

  it('preserves_the_order_of_a_polygon_ring', () => {
    const ring = [
      [14.1, 55.2],
      [14.7, 55.2],
      [14.7, 55.1],
      [14.1, 55.2],
    ];

    expect(deepSortObject({ coordinates: [ring] })).toEqual({
      coordinates: [ring],
    });
  });

  it('still_sorts_arrays_of_strings_for_stable_canonicalization', () => {
    expect(deepSortObject(['b', 'a', 'c'])).toEqual(['a', 'b', 'c']);
  });

  it('still_sorts_object_keys_and_strips_undefined_values', () => {
    expect(deepSortObject({ b: 1, a: 2, c: undefined })).toEqual({
      a: 2,
      b: 1,
    });
  });
});
