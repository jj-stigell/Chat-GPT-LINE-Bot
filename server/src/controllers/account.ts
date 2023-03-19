// Modules
import argon from 'argon2';
import { Request, Response } from 'express';
import * as yup from 'yup';

// Project imports
import { constants, ConfirmationExpiryTime } from '../configs/constants';
import models from '../database/models';
import Account from '../database/models/account';
import AccountAction from '../database/models/accountAction';
import { errors } from '../error/errorCodes';
import { ApiError } from '../types/error';
import { HttpCode } from '../types/httpCode';
import { ResetPassword } from '../types/request';
import { findAccountById, findAccountByEmail } from './utils/account';
import { findAccountActionById } from './utils/accountAction';
import { sendEmailConfirmation, sendPasswordResetLink } from './utils/mailer';

import { NODE_ENV } from '../configs/environment';

/**
 * Confirm new account email address.
 * @param {Request} req - Express request.
 * @param {Response} res - Express response.
 * @throws {ApiError} - If the code is not found, its expired, or already
 * confirmed, function throws an error with a relevant error code.
 */
export async function confirmEmail(req: Request, res: Response): Promise<void> {
  const requestSchema: yup.AnyObject = yup.object({
    confirmationId: yup
      .string()
      .uuid(errors.validationErrors.inputValueTypeError)
      .required(errors.validationErrors.requiredConfirmationCodeError)
  });

  await requestSchema.validate(req.body, { abortEarly: false }
  );
  const confirmationId: string = req.body.confirmationId;

  const confirmation: AccountAction = await findAccountActionById(confirmationId);

  if (confirmation.type !== 'CONFIRM_EMAIL') {
    throw new ApiError(errors.accountErrors.incorrectActionType, HttpCode.Conflict);
  }

  if (confirmation?.expireAt && confirmation.expireAt < new Date) {
    throw new ApiError(errors.accountErrors.confirmationCodeExpiredError, HttpCode.NotFound);
  }

  const account: Account = await findAccountById(confirmation.accountId);

  if (account.emailVerified) {
    throw new ApiError(errors.accountErrors.alreadyConfirmedError, HttpCode.Conflict);
  }

  account.set({
    emailVerified: true
  });

  await account.save();

  res.status(HttpCode.Ok).json({
    success: true
  });
}

/**
 * Resend confirmation code to accounts email address.
 * @param {Request} req - Express request.
 * @param {Response} res - Express response.
 * @throws {ApiError} - If the account is not found or account's email is already
 * confirmed, function throws an error with a relevant error code.
 */
export async function resendConfirmEmail(req: Request, res: Response): Promise<void> {
  const requestSchema: yup.AnyObject = yup.object({
    email: yup.string()
      .email(errors.validationErrors.notValidEmailError)
      .max(constants.account.emailMaxLength, errors.validationErrors.emailMaxLengthError)
      .typeError(errors.validationErrors.inputValueTypeError)
      .required(errors.validationErrors.requiredEmailError)
  });

  await requestSchema.validate(req.body, { abortEarly: false });
  const email: string = req.body.email;

  const account: Account = await findAccountByEmail(email);

  if (account.emailVerified) {
    throw new ApiError(errors.accountErrors.alreadyConfirmedError, HttpCode.Conflict);
  }

  const confirmation: AccountAction = await models.AccountAction.create({
    accountId: account.id,
    type: 'CONFIRM_EMAIL',
    expireAt: new Date(Date.now() + ConfirmationExpiryTime)
  });

  if (NODE_ENV !== 'test') {
    await sendEmailConfirmation(
      account.languageId, account.username, email, confirmation.id
    );
  }

  res.status(HttpCode.Ok).json({
    success: true
  });
}

/**
 * Send link for the account to reset their password.
 * @param {Request} req - Express request.
 * @param {Response} res - Express response.
 * @throws {ApiError} - If the account's email is already confirmed,
 * function throws an error with a relevant error code.
 */
export async function requestResetPassword(req: Request, res: Response): Promise<void> {
  const requestSchema: yup.AnyObject = yup.object({
    email: yup.string()
      .email(errors.validationErrors.notValidEmailError)
      .max(constants.account.emailMaxLength, errors.validationErrors.emailMaxLengthError)
      .typeError(errors.validationErrors.inputValueTypeError)
      .required(errors.validationErrors.requiredEmailError)
  });

  await requestSchema.validate(req.body, { abortEarly: false });
  const email: string = req.body.email;

  const account: Account = await findAccountByEmail(email);

  if (!account.emailVerified) {
    throw new ApiError(errors.accountErrors.emailNotConfirmedError, HttpCode.Forbidden);
  }

  const confirmation: AccountAction = await models.AccountAction.create({
    accountId: account.id,
    type: 'RESET_PASSWORD',
    expireAt: new Date(Date.now() + ConfirmationExpiryTime)
  });

  if (NODE_ENV !== 'test') {
    await sendPasswordResetLink(
      account.languageId, account.username, account.email, confirmation.id
    );
  }

  res.status(HttpCode.Ok).json({
    success: true
  });
}

/**
 * Reset account password.
 * @param {Request} req - Express request.
 * @param {Response} res - Express response.
 * @throws {ApiError} - If errors are encountered,
 * function throws an error with a relevant error code.
 */
export async function resetPassword(req: Request, res: Response): Promise<void> {
  const requestSchema: yup.AnyObject = yup.object({
    confirmationId: yup
      .string()
      .uuid(errors.validationErrors.inputValueTypeError)
      .required(errors.validationErrors.requiredConfirmationCodeError),
    password: yup.string()
      .max(constants.account.passwordMaxLength, errors.validationErrors.passwordMaxLengthError)
      .min(constants.account.passwordMinLength, errors.validationErrors.passwordMinLengthError)
      .matches(constants.regex.lowercaseRegex, errors.validationErrors.passwordLowercaseError)
      .matches(constants.regex.uppercaseRegex, errors.validationErrors.passwordUppercaseError)
      .matches(constants.regex.numberRegex, errors.validationErrors.passwordNumberError)
      .typeError(errors.validationErrors.inputValueTypeError)
      .required(errors.validationErrors.requiredPasswordError)
  });

  await requestSchema.validate(req.body, { abortEarly: false });
  const { confirmationId, password }: ResetPassword = req.body;

  const confirmation: AccountAction = await findAccountActionById(confirmationId);

  if (confirmation.type !== 'RESET_PASSWORD') {
    throw new ApiError(errors.accountErrors.incorrectActionType, HttpCode.Conflict);
  }

  const account: Account = await findAccountById(confirmation.accountId);

  if (!account.emailVerified) {
    throw new ApiError(errors.accountErrors.emailNotConfirmedError, HttpCode.Forbidden);
  }

  account.update({
    password: await argon.hash(password.trim()),
  });

  await account.save();
  await confirmation.destroy();

  res.status(HttpCode.Ok).json({
    success: true
  });
}
