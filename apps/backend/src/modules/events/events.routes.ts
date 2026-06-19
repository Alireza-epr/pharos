import express from 'express';
import { eventsController } from './events.controllers';
import { rateLimitMiddleware } from '../../middlewares/rateLimitMiddleware';
import { authMiddleware } from '../../middlewares/authMiddleware';

const router = express.Router();

router.use(authMiddleware);
router.use(rateLimitMiddleware);
router.post('/', eventsController);

export default router;
