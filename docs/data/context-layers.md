# Context Layers

The pipeline enriches normalized events using datasets.

All datasets are version pinned to ensure deterministic results.

Feature extraction is implemented in:

rootDir = apps/backend/src/pipeline/features/

---

## EEZ

- Source – https://www.marineregions.org/
- Dataset – World_EEZ_20231025_LR:v12
- Citation – Flanders Marine Institute (2026): MarineRegions.org. Available online at www.marineregions.org. Consulted on 2026-04-24.
- Attribution – Copyright Flanders Marine Institute (2020) – marineregions.org.

Feature module:
rootDir/eez.ts

Enrichment fields added to event:

- eez_id
- eez_label

---

## MPA

- Source – https://www.protectedplanet.net/
- Dataset – WDPA_WDOECM_APR2026:v1.6
- Citation – UN Environment Programme World Conservation Monitoring Center (UNEP-WCMC) and International Union for Conservation of Nature (IUCN )(2022), Protected Planet: The World Database on Protected Areas (WDPA) and World Database on Other Effective Area-based Conservation Measures (WD-OECM) [Online], August 2022, Cambridge, UK: UNEP-WCMC and IUCN. Available at: www.protectedplanet.net.
- Attribution – You must ensure that one of the following citations is always clearly reproduced in any publication or analysis involving the Protected Planet Materials in any derived form or format. Use this citation for any downloads of Protected Planet Materials from ProtectedPlanet.net: UNEP-WCMC and IUCN (year), Protected Planet: The World Database on Protected Areas (WDPA) [On-line], [insert month/year of the version downloaded], Cambridge, UK: UNEP-WCMC and IUCN. Available at: www.protectedplanet.net.

Feature module:
rootDir/mpa.ts

Enrichment fields added to event:

- mpa_id
- mpa_label

---

## Bathymetry

- Source – https://www.gebco.net/
- Dataset – GEBCO_2025:v2.7
- Attribution – GEBCO Compilation Group (2025) GEBCO 2025 Grid (doi:10.5285/ 37c52e96-24ea-67cee063-7086abc05f29)

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
