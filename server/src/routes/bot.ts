import { Request, Response, Router } from 'express';
import { ask, line } from '../controllers/bot';
import { controllerDispatcher } from '../middleware/controllerDispatcher';

export const router: Router = Router();

router.get('/health', (req: Request, res: Response): void => {
  res.status(200).send();
  return;
});

router.post(
  '/ask',
  controllerDispatcher(ask)
);

router.post(
  '/line',
  controllerDispatcher(line)
);
