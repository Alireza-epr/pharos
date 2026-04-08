# Context Layers

The pipeline enriches normalized events using spatial context layers provided by Global Fishing Watch.

All datasets are version pinned to ensure deterministic results.

Feature extraction is implemented in:

rootDir = apps/backend/src/pipeline/features/

---

## EEZ

Source: Global Fishing Watch  
Dataset: public-eez-areas:v3

Feature module:
rootDir/eez.ts

Example record:

{
"label": "Jordanian Exclusive Economic Zone",
"id": 8491,
"iso3": "JOR",
"territory1": "Jordan"
}

Enrichment fields added to event:

- eez_id
- eez_label

---

## MPA

Source: Global Fishing Watch  
Dataset: public-mpa-all:v3

Feature module:
rootDir/mpa.ts

Example record:

{
"label": "Diamond Reef - Marine Reserve",
"id": "1"
}

Enrichment fields added to event:

- mpa_id
- mpa_label

---

## RFMO

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
- rfmo_label
