import { IServingRepository } from '../../helpers/types/serviceTypes';
import { ParquetServingRepository } from './ParquetServingRepository';

/** Available serving-repository strategies (config-selectable). */
export enum EServingRepositoryStrategy {
  parquet = 'parquet',
}

const factories: Record<EServingRepositoryStrategy, () => IServingRepository> = {
  [EServingRepositoryStrategy.parquet]: () => new ParquetServingRepository(),
};

const instances = new Map<EServingRepositoryStrategy, IServingRepository>();

/**
 * Resolve the serving repository for a strategy. Defaults to the
 * `SERVING_REPOSITORY_STRATEGY` env var, else Parquet. Switching the storage
 * backend is a config change here — the serving service is untouched. Instances
 * are memoised so callers share one repository per strategy.
 */
export const getServingRepository = (
  a_Strategy?: EServingRepositoryStrategy,
): IServingRepository => {
  const strategy =
    a_Strategy ??
    (process.env.SERVING_REPOSITORY_STRATEGY as EServingRepositoryStrategy) ??
    EServingRepositoryStrategy.parquet;

  const make = factories[strategy] ?? factories[EServingRepositoryStrategy.parquet];
  if (!instances.has(strategy)) instances.set(strategy, make());
  return instances.get(strategy)!;
};
