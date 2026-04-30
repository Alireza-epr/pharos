import express from 'express';
import { healthController } from './system.controllers';
import { ESystemRoutes } from '@packages/enum';

const router = express.Router();

router.get(ESystemRoutes.health, healthController);

export default router;
