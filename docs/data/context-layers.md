# Context Layers

The pipeline enriches normalized events using spatial context layers provided by Global Fishing Watch.

All datasets are version pinned to ensure deterministic results.

Feature extraction is implemented in:

src/pipeline/features/

---

## EEZ

Source: Global Fishing Watch  
Dataset: public-eez-areas:v3

Feature module:
src/pipeline/features/eez.ts

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
src/pipeline/features/mpa.ts

Example record:

{
"label": "Diamond Reef - Marine Reserve",
"id": "1"
}

Enrichment fields added to event:

- mpa_ids
- mpa_labels

---

## RFMO

Source: Global Fishing Watch  
Dataset: public-rfmo:v3

Feature module:
src/pipeline/features/rfmo.ts

Example record:

{
"label": "LTA",
"id": "LTA"
}

Enrichment fields added to event:

- rfmo_ids
- rfmo_labels
