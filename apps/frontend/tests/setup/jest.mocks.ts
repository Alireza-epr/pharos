// @turf/turf ships ESM-only (and pulls in other ESM-only packages, e.g.
// kdbush via @turf/clusters-dbscan) that Jest's default CommonJS transform
// can't parse -- same constraint as apps/backend's own tests/setup/jest.mocks.ts,
// which mocks it for the identical reason. areaOfInterestStore.ts is the one
// module here that imports it (for the Point AOI tool's circle/centroid
// math); a bare stub is enough since no test in this suite exercises that
// code path -- they only need the module graph to load without crashing.
jest.mock('@turf/turf', () => ({
  centroid: jest.fn(),
  circle: jest.fn(),
}));

// hooks/fetch.ts pulls in hooks/index.ts, which reads `import.meta.env`
// (Vite-only syntax ts-jest's CommonJS transform can't parse at all --
// unrelated to the turf issue above, but the same class of problem). No
// test in this suite exercises loadRegionOptions() for real -- it always
// runs against a live/mocked backend, never unit-tested directly -- so a
// no-op stub is enough; the "real" behavior it fronts (importAOI() with a
// region already resolvable) is covered by exercising importAOI() itself.
jest.mock('../../src/hooks/fetch', () => ({
  loadRegionOptions: jest.fn(async () => undefined),
}));
