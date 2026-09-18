import express from 'express';
import { EEventsRoutes } from '@packages/enum';
import { eventSearchController } from './events.controllers';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { rateLimitMiddleware } from '../../middlewares/rateLimitMiddleware';

const router = express.Router();

router.use(authMiddleware);
router.use(rateLimitMiddleware);
router.post(EEventsRoutes.search, eventSearchController);

export default router;
