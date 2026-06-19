import {
  IConfigJSON,
  IEventSchema,
  IRejectedEventSchema,
  I4wingsEntry,
  TGlobalEvent,
  IGeometry,
} from '@packages/types';
import { ERejectedEventSchemaReasons, EContextLayers } from '@packages/enum';
import { getEEZContext } from '../features/eez';
import { getMPAContext } from '../features/mpa';
import { distanceToCoast } from '../features/coast_distance';
import {
  isMatchedCase,
  isValidCoordinate,
  isValidDate,
  isVesselTypeValid,
} from '../normalize/validation';
import {
  generateConfidence,
  generateConfidence_heuristic,
  generateCoordinate,
  generateEventId,
  generateGeom,
  generateRunMetadata,
  generateScoring,
  generateSources,
  generateVersion,
  getISO8601,
} from '../normalize/generation';
import { coastlinePolylines, eezPolygons, mpaPolygons } from '../sample';
import { getBathymetryContext } from '../features/bathymetry_cached';
import {
  formatTimestamp,
  getGitCommitSHA,
  log,
} from '../../helpers/utils/backendUtils';
import { ELogType } from '../../helpers/types/generalTypes';
import { sortEventSchema } from '@packages/utils';

export const createEventSchema = async (
  a_Configuration: IConfigJSON,
  a_4wingsEntry: I4wingsEntry,
  a_EventEntry?: TGlobalEvent,
): Promise<IEventSchema | IRejectedEventSchema> => {
  const start = formatTimestamp();

  const version = generateVersion();

  /**
   * Validation
   */
  let rejected_reasons: ERejectedEventSchemaReasons[] = [];
  const validTimestamp = isValidDate(a_4wingsEntry.date);
  if (!validTimestamp) {
    rejected_reasons.push(ERejectedEventSchemaReasons.notValidTimestamp);
  }

  const validVesselType = isVesselTypeValid(a_4wingsEntry.vesselType);
  if (!validVesselType) {
    rejected_reasons.push(ERejectedEventSchemaReasons.notValidVesselType);
  }

  const timestamp_utc = getISO8601(a_4wingsEntry.date);

  const validCoordinates = isValidCoordinate(
    a_4wingsEntry.lat,
    a_4wingsEntry.lon,
  );

  if (!validCoordinates) {
    rejected_reasons.push(ERejectedEventSchemaReasons.notValidCoordinates);
  }

  if (rejected_reasons.length !== 0) {
    const end = formatTimestamp();
    const run_metadata = await generateRunMetadata(
      [a_Configuration],
      undefined,
      start,
      end,
    );
    return {
      reasons: rejected_reasons,
      rejected: true,
      run_metadata,
      raw_metadata: a_4wingsEntry,
      raw_event_metadata: a_EventEntry ?? null,
      version,
    };
  }

  /**
   * Generation
   */

  const lon = generateCoordinate(a_4wingsEntry.lon);
  const lat = generateCoordinate(a_4wingsEntry.lat);

  const sources = generateSources(a_Configuration, a_4wingsEntry);

  const event_id = await generateEventId(timestamp_utc, lon, lat, sources);

  const matched_flag = isMatchedCase(a_4wingsEntry);

  const confidence_proxy = generateConfidence(a_EventEntry ?? null);
  const confidence_tier = generateConfidence_heuristic(a_4wingsEntry);

  let geom: IGeometry = generateGeom(lon, lat);

  const eez = getEEZContext(eezPolygons, lon, lat);

  const mpa = getMPAContext(mpaPolygons, lon, lat);

  const bathymetry = await getBathymetryContext(lon, lat);

  const context_layers = {
    [EContextLayers.eez]: eez,
    [EContextLayers.mpa]: mpa,
    [EContextLayers.bathymetry]: bathymetry,
  };

  const distance_to_coast_km = distanceToCoast(
    coastlinePolylines,
    a_4wingsEntry.lon,
    a_4wingsEntry.lat,
  );

  const eventSchema: IEventSchema = {
    version: version,
    event_id,
    timestamp_utc,
    matched_flag,
    confidence_proxy,
    confidence_tier,
    lat,
    lon,
    source: sources,
    raw_metadata: a_4wingsEntry,
    raw_event_metadata: a_EventEntry ?? null,
    run_metadata: null,
    context_layers,
    distance_to_coast_km,
    scoring: {
      triage_score: null,
      uncertainty_score: null,
      reason_codes: null,
    },
    geom: geom,
    rejected: false,
    hotspot: null,
  };

  const scoring = generateScoring(eventSchema, a_Configuration);
  const end = formatTimestamp();
  const run_metadata = await generateRunMetadata(
    [a_Configuration],
    [eventSchema],
    start,
    end,
  );

  return {
    ...eventSchema,
    scoring,
    run_metadata,
  };
};

export const createSortedEventSchemas = async (
  a_Configuration: IConfigJSON,
  a_4wingsEntries: I4wingsEntry[],
): Promise<(IEventSchema | IRejectedEventSchema)[]> => {
  let events = [];
  const gitCommitSHA = await getGitCommitSHA();
  for (const entry of a_4wingsEntries) {
    try {
      const eventSchema = await createEventSchema(
        { ...a_Configuration, gitCommitSHA },
        entry,
      );
      if (eventSchema.rejected) {
        log(
          `[createSortedEventSchemas] Entry ${JSON.stringify(eventSchema.raw_metadata)} is rejected: ${JSON.stringify(eventSchema.reasons)}`,
          ELogType.error,
        );
      }
      events.push(eventSchema);
    } catch (error) {
      log(
        `[createSortedEventSchemas] Event Schema error: ${error}`,
        ELogType.error,
      );
    }
  }
  const sortedEvents = sortEventSchema(events, a_Configuration.sort);
  return sortedEvents;
};
