import { Router } from 'express';

import {
  confirmEmail, resendConfirmEmail, requestResetPassword, resetPassword
} from '../controllers/account';
import { controllerDispatcher } from '../middleware/controllerDispatcher';

export const router: Router = Router();

router.post(
  '/confirmation',
  controllerDispatcher(confirmEmail)
);

router.post(
  '/confirmation/resend',
  controllerDispatcher(resendConfirmEmail)
);

router.post(
  '/password/reset',
  controllerDispatcher(requestResetPassword)
);

router.patch(
  '/password/reset',
  controllerDispatcher(resetPassword)
);
