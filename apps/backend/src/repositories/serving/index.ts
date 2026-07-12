import { EServingRepository } from '@packages/enum';
import { ParquetServingRepository } from './ParquetServingRepository';
import { IServingRepository } from '../../helpers/types/serviceTypes';

/** Available serving-repository strategies (config-selectable). */
const factories: Record<EServingRepository, () => IServingRepository> = {
  [EServingRepository.parquet]: () => new ParquetServingRepository(),
};

const instances = new Map<EServingRepository, IServingRepository>();

/**
 * Resolve the serving repository for a strategy. Defaults to the
 * `SERVING_REPOSITORY_STRATEGY` env var, else Parquet. Switching the storage
 * backend is a config change here — the serving service is untouched. Instances
 * are memoised so callers share one repository per strategy.
 */
export const getServingRepository = (
  a_Strategy?: EServingRepository,
): IServingRepository => {
  const strategy =
    a_Strategy ??
    (process.env.SERVING_REPOSITORY_STRATEGY as EServingRepository) ??
    EServingRepository.parquet;

  const make = factories[strategy] ?? factories[EServingRepository.parquet];
  if (!instances.has(strategy)) instances.set(strategy, make());
  return instances.get(strategy)!;
};
