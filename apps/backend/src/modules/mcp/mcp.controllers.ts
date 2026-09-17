import { Request, Response, NextFunction } from 'express';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { config } from '../../config/api';
import { controllerResponse } from '../../helpers/utils/controllerUtils';
import { EResponseError, EStatusCode } from '@packages/enum';
import { log } from '../../helpers/utils/backendUtils';
import { ELogType } from '../../helpers/types/generalTypes';
import { buildPharosMcpServer } from './mcp.server';

const BEARER_PREFIX = 'Bearer ';

// token -> label, built once from config.auth.mcp_api_keys (label -> token,
// the natural shape for a human editing the MCP_API_KEYS env var) rather
// than re-inverting it on every request.
const keysByToken: Record<string, string> = Object.fromEntries(
  Object.entries(config.auth.mcp_api_keys).map(([label, token]) => [
    token,
    label,
  ]),
);

// A dedicated check, not the user-facing authMiddleware -- an AI agent
// isn't a logged-in browser user with a JWT. Each agent/person gets its own
// named key (MCP_API_KEYS) instead of one secret everyone shares: one can
// be revoked (delete its entry, restart) without touching anyone else's.
// Still a stand-in for real OAuth 2.1 -- see mcp_api_keys in
// generalTypes.ts for why that's deliberately not built yet.
export const mcpAuthMiddleware = (
  a_Req: Request,
  a_Res: Response,
  a_Next: NextFunction,
) => {
  const authHeader = a_Req.headers.authorization;
  const token = authHeader?.startsWith(BEARER_PREFIX)
    ? authHeader.slice(BEARER_PREFIX.length)
    : undefined;

  const label = token ? keysByToken[token] : undefined;
  if (!label) {
    log('[MCP] Rejected request: missing/invalid API key', ELogType.error);
    return controllerResponse(a_Res, EStatusCode.UNAUTHORIZED_401, {
      success: false,
      error: [EResponseError.InvalidOrExpiredToken],
    });
  }

  a_Req.mcpKeyLabel = label;
  log(`[MCP] Authenticated request from "${label}"`, ELogType.success);
  return a_Next();
};

// Stateless mode: a fresh McpServer + transport per request, torn down
// when the response closes. Matches the SDK's own bundled example
// (examples/server/simpleStatelessStreamableHttp.ts) -- no session to
// juggle, which is the right tradeoff for a handful of read-only tools.
export const mcpPostController = async (a_Req: Request, a_Res: Response) => {
  const server = buildPharosMcpServer();
  try {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });
    await server.connect(transport);
    await transport.handleRequest(a_Req, a_Res, a_Req.body);

    a_Res.on('close', () => {
      void transport.close();
      void server.close();
    });
  } catch (err) {
    log(`[MCP] Request handling failed: ${err}`, ELogType.error);
    if (!a_Res.headersSent) {
      a_Res.status(EStatusCode.INTERNAL_SERVER_ERROR_500).json({
        jsonrpc: '2.0',
        error: { code: -32603, message: 'Internal server error' },
        id: null,
      });
    }
  }
};

// Stateless mode has no session to resume/close via GET (SSE stream) or
// DELETE (session termination) -- reject both the same way the SDK's own
// stateless example does, with a JSON-RPC-shaped error body (this is what
// an MCP client expects here, not our app's normal {success, error} shape).
export const mcpMethodNotAllowedController = (a_Req: Request, a_Res: Response) => {
  a_Res.status(405).json({
    jsonrpc: '2.0',
    error: { code: -32000, message: 'Method not allowed.' },
    id: null,
  });
};
