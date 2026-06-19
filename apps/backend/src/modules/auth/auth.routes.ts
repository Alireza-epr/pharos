import express from 'express';
import {
  checkTokenController,
  loginController,
  refreshController,
} from './auth.controllers';
import { EAuthRoutes } from '@packages/enum';

const router = express.Router();

router.post(EAuthRoutes.login, loginController);
router.post(EAuthRoutes.checkToken, checkTokenController);
router.post(EAuthRoutes.refresh, refreshController);

export default router;
