import Account from '../../database/models/account';
import { errors } from '../../error/errorCodes';

import { ApiError } from '../../types/error';
import { HttpCode } from '../../types/httpCode';

/**
 * Finds a account by its ID.
 * @param {number} id - The ID of the account to be found.
 * @returns {Promise<Account>} - A promise that resolves with the found account model object.
 * @throws {ApiError} - If the account is not found, it throws an error with a message
 * indicating the missing account with the specific ID.
 */
export async function findAccountById(id: number): Promise<Account> {
  const account: Account | null = await Account.findByPk(id);
  if (!account) {
    throw new ApiError(errors.accountErrors.accountNotFoundError, HttpCode.NotFound);
  }
  return account;
}

/**
 * Finds a account by its email address.
 * @param {string} email - The email address of the account to be found.
 * @returns {Promise<Account>} - A promise that resolves with the found account model object.
 * @throws {ApiError} - If the account is not found, it throws an error with a message
 * indicating the missing account with the specific email.
 */
export async function findAccountByEmail(email: string): Promise<Account> {
  const account: Account | null = await Account.findOne({
    where: {
      email: email
    }
  });
  if (!account) {
    throw new ApiError(errors.accountErrors.emailNotFoundError, HttpCode.NotFound);
  }
  return account;
}
