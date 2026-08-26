import express from 'express';
import { EVesselsRoutes } from '@packages/enum';
import {
  vesselListController,
  vesselSearchController,
} from './vessels.controllers';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { rateLimitMiddleware } from '../../middlewares/rateLimitMiddleware';

const router = express.Router();

router.use(authMiddleware);
router.use(rateLimitMiddleware);
router.get(`${EVesselsRoutes.search}`, vesselSearchController);
router.get('/', vesselListController);

export default router;
