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
      // Which MCP_API_KEYS label authenticated this request (see
      // mcpAuthMiddleware) -- set for /v1/mcp only.
      mcpKeyLabel?: string;
    }
  }
}
