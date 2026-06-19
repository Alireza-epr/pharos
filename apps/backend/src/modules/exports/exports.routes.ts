import express from 'express';
import { evidenceController } from './exports.controllers';
import { EExportsRoutes } from '@packages/enum';
import { authMiddleware } from '../../middlewares/authMiddleware';

const router = express.Router();

router.use(authMiddleware);
router.post(EExportsRoutes.events, evidenceController);

export default router;
