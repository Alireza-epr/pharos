import express from 'express';
import {
  mcpAuthMiddleware,
  mcpMethodNotAllowedController,
  mcpPostController,
} from './mcp.controllers';

const router = express.Router();

router.use(mcpAuthMiddleware);
// POST is the only real MCP Streamable HTTP verb in stateless mode --
// GET (server-initiated SSE stream) and DELETE (session termination) both
// only make sense with a session, which this server deliberately doesn't
// keep. See mcp.controllers.ts.
router.post('/', mcpPostController);
router.get('/', mcpMethodNotAllowedController);
router.delete('/', mcpMethodNotAllowedController);

export default router;
