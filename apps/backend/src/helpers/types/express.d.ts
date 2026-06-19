import { IEventSchema } from '@packages/types';
import { TDecoded } from './tokenTypes';

export {};

declare global {
  namespace Express {
    interface Request {
      events?: IEventSchema[];
      start_time?: string;
      gitCommitSHA?: string;
      user?: TDecoded;
    }
  }
}
