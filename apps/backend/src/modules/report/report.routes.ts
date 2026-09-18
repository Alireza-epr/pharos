import express from 'express';
import { reportController } from './report.controllers';
import { rateLimitMiddleware } from '../../middlewares/rateLimitMiddleware';
import { authMiddleware } from '../../middlewares/authMiddleware';

const router = express.Router();

router.use(authMiddleware);
router.use(rateLimitMiddleware);
router.post('/', reportController);

export default router;
