// Modules
import path from 'path';

// Project imports
import { FrontendUrl } from '../../../configs/constants';
import { ConfirmEmailPayload } from '../../../types/email';
import { sendMail } from './emailClient';
import confirmAccountTranslations from './locales/confirmAccount.json';
import resetPasswordTranslations from './locales/resetPassword.json';

// Dev delete later
import { DEV_EMAIL, NODE_ENV } from '../../../configs/environment';

export async function sendEmailConfirmation(
  language: string, username: string, email: string, confirmationId: string
): Promise<void> {
  let translation: object;
  let subject: string;

  switch (language) {
  case 'FI':
    translation = confirmAccountTranslations['FI'];
    subject = confirmAccountTranslations['FI'].subject;
    break;
  default:
    translation = confirmAccountTranslations['EN'];
    subject = confirmAccountTranslations['EN'].subject;
    break;
  }

  const templateData: ConfirmEmailPayload = {
    translation,
    email: NODE_ENV === 'production' ? email : DEV_EMAIL,
    username: username,
    url: `${FrontendUrl}/account/confirmation/${confirmationId}`,
  };

  await sendMail<ConfirmEmailPayload>({
    subject,
    templateData,
    templatePath: path.join(__dirname, './templates/confirmAccount.html'),
    to: email
  });
}

export async function sendPasswordResetLink(
  language: string, username: string, email: string, confirmationId: string
): Promise<void> {
  let translation: object;
  let subject: string;

  switch (language) {
  case 'FI':
    translation = resetPasswordTranslations['FI'];
    subject = resetPasswordTranslations['FI'].subject;
    break;
  default:
    translation = resetPasswordTranslations['EN'];
    subject = resetPasswordTranslations['EN'].subject;
    break;
  }

  const templateData: ConfirmEmailPayload = {
    translation,
    email: NODE_ENV === 'production' ? email : DEV_EMAIL,
    username: username,
    url: `${FrontendUrl}/account/reset-password/${confirmationId}`,
  };

  await sendMail<ConfirmEmailPayload>({
    subject,
    templateData,
    templatePath: path.join(__dirname, './templates/resetPassword.html'),
    to: email
  });
}
