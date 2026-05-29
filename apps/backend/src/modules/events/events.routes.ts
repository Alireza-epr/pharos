import express from 'express';
import { eventsController } from './events.controllers';

const router = express.Router();

router.post('/', eventsController);

export default router;
