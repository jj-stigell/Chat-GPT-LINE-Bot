import { Router } from 'express';
import { ask } from '../controllers/bot';
import { controllerDispatcher } from '../middleware/controllerDispatcher';

export const router: Router = Router();

router.post(
  '/ask',
  controllerDispatcher(ask)
);
