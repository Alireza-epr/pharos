import express from 'express';
import { evidenceController } from './exports.controllers';
import { EExportsRoutes } from '@packages/enum';
import { rateLimitMiddleware } from '../../middlewares/rateLimitMiddleware';
import { authMiddleware } from '../../middlewares/authMiddleware';

const router = express.Router();

router.use(authMiddleware);
router.use(rateLimitMiddleware);
router.post(EExportsRoutes.evidence, evidenceController);

export default router;
