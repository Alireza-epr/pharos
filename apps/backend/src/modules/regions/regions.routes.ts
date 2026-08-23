import express from 'express';
import {
  regionGeometryController,
  regionsController,
} from './regions.controllers';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { ERegionsRoutes } from '@packages/enum';

const router = express.Router();

router.use(authMiddleware);
router.get(`${ERegionsRoutes.geometry}`, regionGeometryController);
router.get('/', regionsController);

export default router;
