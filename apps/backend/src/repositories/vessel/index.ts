import { EVesselRepository } from '@packages/enum';
import { IVesselRepository } from '../../helpers/types/serviceTypes';
import { GfwVesselRepository } from './GfwVesselRepository';

type TVesselRepository = IVesselRepository;

const factories: Record<EVesselRepository, () => TVesselRepository> = {
  [EVesselRepository.gfw]: () => new GfwVesselRepository(),
};

const instances = new Map<EVesselRepository, TVesselRepository>();

/**
 * Resolve the vessel repository for a provider strategy. Defaults to the
 * `VESSEL_REPOSITORY_STRATEGY` env var, else GFW -- mirrors
 * `repositories/detection/index.ts`'s own strategy resolution. Instances are
 * memoised per strategy.
 */
export const getVesselRepository = (
  a_Strategy?: EVesselRepository,
): TVesselRepository => {
  const strategy =
    a_Strategy ??
    (process.env.VESSEL_REPOSITORY_STRATEGY as EVesselRepository) ??
    EVesselRepository.gfw;

  const make = factories[strategy] ?? factories[EVesselRepository.gfw];
  if (!instances.has(strategy)) instances.set(strategy, make());
  return instances.get(strategy)!;
};
