import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getGitCommitSHA } from '../../helpers/utils/backendUtils';
import { registerRunQueryTool } from './tools/runQuery';

/**
 * Builds one fresh MCP server instance (master-plan 4.1) -- called
 * per-request by mcp.controllers.ts, since the stateless Streamable HTTP
 * transport expects a new server+transport pair per call rather than one
 * long-lived instance (see the SDK's own bundled
 * `examples/server/simpleStatelessStreamableHttp.ts`).
 */
export const buildPharosMcpServer = (): McpServer => {
  const server = new McpServer({
    name: 'pharos-mcp',
    version: '0.1.0',
  });

  server.registerTool(
    'pharos_health',
    {
      title: 'Pharos health check',
      description:
        'Confirms this Pharos MCP server is reachable and reports which backend build (git commit) is running. Takes no input.',
      inputSchema: {},
    },
    async () => {
      const gitCommitSHA = await getGitCommitSHA();
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                status: 'ok',
                gitCommitSHA,
                serverTime: new Date().toISOString(),
              },
              null,
              2,
            ),
          },
        ],
      };
    },
  );

  // The real one: calls this same backend's live POST /v1/events. See
  // tools/runQuery.ts for why it's an internal HTTP call rather than a
  // second implementation of the serving path.
  registerRunQueryTool(server);

  return server;
};
