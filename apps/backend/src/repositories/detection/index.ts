import { EDetectionRepository } from '@packages/enum';
import { I4wingsAPIResponse } from '@packages/types';
import { IDetectionRepository } from '../../helpers/types/serviceTypes';
import { GfwDetectionRepository } from './GfwDetectionRepository';

// The provider response type this iteration returns (GFW 4Wings).
type TDetectionRepository = IDetectionRepository<I4wingsAPIResponse>;

const factories: Record<EDetectionRepository, () => TDetectionRepository> = {
  [EDetectionRepository.gfw]: () => new GfwDetectionRepository(),
};

const instances = new Map<EDetectionRepository, TDetectionRepository>();

/**
 * Resolve the detection repository for a provider strategy. Defaults to the
 * `DETECTION_REPOSITORY_STRATEGY` env var, else GFW (the key the route layer
 * already reserves). Swapping the provider is a config change here — the
 * detection service is untouched. Instances are memoised per strategy.
 */
export const getDetectionRepository = (
  a_Strategy?: EDetectionRepository,
): TDetectionRepository => {
  const strategy =
    a_Strategy ??
    (process.env.DETECTION_REPOSITORY_STRATEGY as EDetectionRepository) ??
    EDetectionRepository.gfw;

  const make = factories[strategy] ?? factories[EDetectionRepository.gfw];
  if (!instances.has(strategy)) instances.set(strategy, make());
  return instances.get(strategy)!;
};
