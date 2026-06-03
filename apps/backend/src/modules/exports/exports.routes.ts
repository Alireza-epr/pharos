import express from 'express';
import { evidenceController } from './exports.controllers';
import { EExportsRoutes } from '@packages/enum';
import { rateLimitMiddleware } from '../../middlewares/rateLimitMiddleware';

const router = express.Router();

router.use(rateLimitMiddleware)
router.post(EExportsRoutes.evidence, evidenceController);

export default router;