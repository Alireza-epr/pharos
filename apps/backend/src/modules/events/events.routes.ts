import express from 'express';
import { eventsController } from './events.controllers';
import { rateLimitMiddleware } from './events.middlewares';

const router = express.Router();

router.use(rateLimitMiddleware)
router.post('/', eventsController);

export default router;
