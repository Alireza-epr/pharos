import express from 'express';
import { eventsController } from './events.controllers';
import { rateLimitMiddleware } from '../../middlewares/rateLimitMiddleware';

const router = express.Router();

router.use(rateLimitMiddleware)
router.post('/', eventsController);

export default router;
