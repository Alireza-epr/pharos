import { Request, Response, NextFunction } from 'express';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { config } from '../../config/api';
import { controllerResponse } from '../../helpers/utils/controllerUtils';
import { EResponseError, EStatusCode } from '@packages/enum';
import { log } from '../../helpers/utils/backendUtils';
import { ELogType } from '../../helpers/types/generalTypes';
import { buildPharosMcpServer } from './mcp.server';

const BEARER_PREFIX = 'Bearer ';

// A dedicated check, not the user-facing authMiddleware -- an AI agent
// isn't a logged-in browser user with a JWT, it's a single shared secret
// for this learning-spike stage (see mcp_shared_secret in generalTypes.ts).
export const mcpAuthMiddleware = (
  a_Req: Request,
  a_Res: Response,
  a_Next: NextFunction,
) => {
  const authHeader = a_Req.headers.authorization;
  const token = authHeader?.startsWith(BEARER_PREFIX)
    ? authHeader.slice(BEARER_PREFIX.length)
    : undefined;

  const expected = config.auth.mcp_shared_secret;
  if (!expected || !token || token !== expected) {
    log('[MCP] Rejected request: missing/invalid bearer token', ELogType.error);
    return controllerResponse(a_Res, EStatusCode.UNAUTHORIZED_401, {
      success: false,
      error: [EResponseError.InvalidOrExpiredToken],
    });
  }

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
