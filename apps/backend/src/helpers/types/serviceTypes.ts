import { IConfigJSON, IEventSchema } from '@packages/types';
import { ICoverageManifest } from './servingTypes';

/**
 * Repository contract for the serving service: the partition data plus the
 * coverage manifest. The service depends only on this interface, so a different
 * backend (DB, object store, remote API) is a new implementation — the service
 * does not change. (Controller → Service → Repository → External.)
 *
 * The contract is fixed for every serving-repository implementation; each
 * implementation hides one endpoint's syntax behind these generic verbs. It
 * lives here (a neutral types module) rather than in the service or repository
 * so both layers can depend on the abstraction without a circular import.
 */
export interface IServingRepository {
  /** Read one (day, region) partition back into full events. Missing → empty. */
  readPartition(a_Date: string, a_Partition: string): Promise<IEventSchema[]>;

  /** Merge events into a (day, region) partition, deduplicated by `event_id`. */
  writePartition(
    a_Date: string,
    a_Partition: string,
    a_Events: IEventSchema[],
  ): Promise<void>;

  /** Load the coverage manifest (which cells are fetched per day + query). */
  readCoverage(): ICoverageManifest;

  /** Persist the coverage manifest. */
  writeCoverage(a_Manifest: ICoverageManifest): void;
}

/**
 * Repository contract for a detection provider. It hides one provider's syntax
 * (GFW today) behind a single verb and returns the provider's **raw** response;
 * normalising and enriching it into canonical events is the `DetectionService`'s
 * job. Swapping the SAR/AIS source is a new implementation of this interface.
 */
export interface IDetectionRepository<T> {
  /** Fetch the raw provider response for a query. */
  fetch(a_Config: IConfigJSON): Promise<T>;
}
