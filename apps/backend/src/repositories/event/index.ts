import { EEventRepository } from '@packages/enum';
import { IEventRepository } from '../../helpers/types/serviceTypes';
import { GfwEventRepository } from './GfwEventRepository';

type TEventRepository = IEventRepository;

const factories: Record<EEventRepository, () => TEventRepository> = {
  [EEventRepository.gfw]: () => new GfwEventRepository(),
};

const instances = new Map<EEventRepository, TEventRepository>();

/**
 * Resolve the event repository for a provider strategy. Defaults to the
 * `EVENT_REPOSITORY_STRATEGY` env var, else GFW -- mirrors
 * `repositories/vessel/index.ts`'s own strategy resolution. Instances are
 * memoised per strategy.
 */
export const getEventRepository = (
  a_Strategy?: EEventRepository,
): TEventRepository => {
  const strategy =
    a_Strategy ??
    (process.env.EVENT_REPOSITORY_STRATEGY as EEventRepository) ??
    EEventRepository.gfw;

  const make = factories[strategy] ?? factories[EEventRepository.gfw];
  if (!instances.has(strategy)) instances.set(strategy, make());
  return instances.get(strategy)!;
};
