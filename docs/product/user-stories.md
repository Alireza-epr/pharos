## Problem Statement

AIS data is commonly used to show vessel locations, but sometimes AIS messages are missing or incomplete. SAR satellite data, such as Sentinel-1, can show vessel detections without using AIS, but these detections do not include vessel identity and can be uncertain in time and position. When looking at SAR and AIS data together, it is not always clear whether a SAR detection should match an AIS record or not. The difference may be caused by data gaps or by limitations in the matching process. This project looks at building a small prototype that combines open SAR and AIS data to show how likely a detection is to be matched or unmatched.

## User Stories

1. **As an analyst**, I can select an area of interest or choose an EEZ region from a predefined list, along with a time period, to view available vessel detections.
2. **As an analyst**, I can see which SAR detections include vessel identity information and which detections have no identity fields populated.
3. **As an analyst**, I can view the available attributes of a SAR detection, such as location, timestamps, flag, vessel type, and gear type.
4. **As an analyst**, I can compare SAR detections with AIS presence data for the same region and time window.
5. **As an analyst**, I can view recent position reports for a selected vessel, when such information is available, to support a basic comparison with detections.
6. **As a reviewer**, I can export the retrieved detections together with query parameters (area, time range) for documentation or further analysis.
