import express from 'express';
import { regionsController } from './regions.controllers';
import { authMiddleware } from '../../middlewares/authMiddleware';

const router = express.Router();

router.use(authMiddleware);
router.get('/', regionsController);

export default router;
