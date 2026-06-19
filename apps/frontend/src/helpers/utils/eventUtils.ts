import { IEventSchema } from '@packages/types';
import { TTranslator } from '../types/generalTypes';

export const getMatchingStatus = (a_Event: IEventSchema, a_T: TTranslator) => {
  return a_Event.matched_flag
    ? a_T('general.label.matched')
    : a_T('general.label.unmatched');
};
