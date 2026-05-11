### Confidence Tier

The `confidence_tier` is derived from provider-side indicators across multiple signals.  
It represents a processing classification and must not be interpreted as a statistical probability.

## Signal Basis

The tier is derived from a combination of:

- SAR detection count or observation duration (depending on dataset availability)
- provider noise indicators

## Tier Definitions

| Tier | Conditions |
|---|---|
| `low` | Weak or isolated signal, short observation duration, or presence of noise indicators |
| `medium` | Repeated detections or moderate observation persistence |
| `high` | Strong repeated detections and/or sustained observation persistence with low noise indicators |

