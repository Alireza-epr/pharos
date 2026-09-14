# Context Layers

The pipeline enriches normalized events using datasets.

All datasets are version pinned to ensure deterministic results.

**Geometry simplification** - the EEZ, MPA, and Coastline Polylines source files are simplified before being served (`@turf/simplify`, per-feature, tolerance 0.001-0.005° depending on the dataset - roughly 110-550m), so they are not the raw upstream download. This keeps the live server's parsed in-memory footprint within its hosting budget (the unsimplified files parse to several hundred MB combined). Point-in-polygon classification can shift right at a boundary edge, within roughly the tolerance distance; classification away from an edge is unaffected. See `docs/limitations.md`.

Each of the three keeps its unsimplified original alongside it in the same folder (`eez_polygons.full.geojson`, `mpa_polygons.full.geojson`, `coastline_polylines.full.geojson`). Set `CONTEXT_DATASET_QUALITY=full` (default is `simplified`) to serve those instead - only do this on a host with enough RAM to hold them.

**Available for every event, matched or unmatched.** EEZ/MPA/Bathymetry enrichment (`pipeline/schema/main.ts`) runs unconditionally on every event during schema generation, before `matched_flag` is even branched on anywhere downstream - so an AIS-unmatched detection carries exactly the same context-layer data as a matched one. This is deliberate, not incidental: these layers exist to help a reviewer interpret an *unmatched* detection (is it inside an MPA? in shallow water consistent with fishing?), so gating them on a successful AIS match would defeat their purpose. This is a different rule from two other enrichments that share the same "additional context" role but are each restricted to one side of the match: **Vessel Identity** (`vessels` module) only has anything to look up for a *matched* detection - unmatched has no AIS-derived vessel ID to query - and **Hotspot context** (`pipeline/aggregate/hotspots.ts`) is computed *only* for unmatched events, since it exists specifically to surface unmatched recurrence.

Feature extraction is implemented in:

rootDir = apps/backend/src/pipeline/features/

---

## EEZ

- Source - https://www.marineregions.org/
- Dataset - World_EEZ_20231025_LR:v12
- Citation - Flanders Marine Institute (2026): MarineRegions.org. Available online at www.marineregions.org. Consulted on 2026-04-24.
- Attribution - Copyright Flanders Marine Institute (2020) - marineregions.org.

Feature module:
rootDir/eez.ts

Each enrichment entry contains:

- id
- label

---

## MPA

- Source - https://www.protectedplanet.net/
- Dataset - WDPA_WDOECM_APR2026:v1.6
- Citation - UN Environment Programme World Conservation Monitoring Center (UNEP-WCMC) and International Union for Conservation of Nature (IUCN )(2022), Protected Planet: The World Database on Protected Areas (WDPA) and World Database on Other Effective Area-based Conservation Measures (WD-OECM) [Online], August 2022, Cambridge, UK: UNEP-WCMC and IUCN. Available at: www.protectedplanet.net.
- Attribution - You must ensure that one of the following citations is always clearly reproduced in any publication or analysis involving the Protected Planet Materials in any derived form or format. Use this citation for any downloads of Protected Planet Materials from ProtectedPlanet.net: UNEP-WCMC and IUCN (year), Protected Planet: The World Database on Protected Areas (WDPA) [On-line], [insert month/year of the version downloaded], Cambridge, UK: UNEP-WCMC and IUCN. Available at: www.protectedplanet.net.

Feature module:
rootDir/mpa.ts

Each enrichment entry contains:

- id
- label

---

## Bathymetry

- Source - https://www.gebco.net/
- Dataset - GEBCO_2025:v2.7
- Attribution - GEBCO Compilation Group (2025) GEBCO 2025 Grid (doi:10.5285/ 37c52e96-24ea-67cee063-7086abc05f29)

Feature module:
rootDir/bathymetry_cached.ts

Enrichment fields added to event:

- value ( in meter )

---

<!-- ## RFMO

Source: Global Fishing Watch
Dataset: public-rfmo:v3

Feature module:
rootDir/rfmo.ts

Example record:

{
"label": "LTA",
"id": "LTA"
}

Enrichment fields added to event:

- rfmo_id
- rfmo_label -->
