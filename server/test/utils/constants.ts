import { Register } from '../../src/types/request';

export const registerUri: string = '/api/v1/auth/register';
export const loginUri: string = '/api/v1/auth/login';
export const logoutUri: string = '/api/v1/auth/logout';
export const emailConfirmationUri: string = '/api/v1/account/confirmation';
export const resendEmailConfirmationUri: string = '/api/v1/account/confirmation/resend';
export const requestResetPasswordUri: string = '/api/v1/account/password/reset';
export const resetPasswordUri: string = '/api/v1/account/password/reset';

export const takenAccount: Register = {
  email: 'takenAccount@test.com',
  username: 'taken',
  password: 'TestPassword123',
  acceptTos: true,
  allowNewsLetter: true,
  language: 'EN'
};

export const createAccount: Register = {
  email: 'newaccount@test.com',
  username: 'testNewUser',
  password: 'TestPassword123',
  acceptTos: true,
  allowNewsLetter: true,
  language: 'EN'
};
