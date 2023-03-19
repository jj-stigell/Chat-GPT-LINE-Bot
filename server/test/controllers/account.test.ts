import supertest from 'supertest';

import { app } from '../../src/app';
import { constants } from '../../src/configs/constants';
import models from '../../src/database/models';
import Account from '../../src/database/models/account';
import AccountAction from '../../src/database/models/accountAction';
import { errors } from '../../src/error/errorCodes';
import { HttpCode } from '../../src/types/httpCode';
import {
  emailConfirmationUri, resendEmailConfirmationUri, registerUri, takenAccount,
  requestResetPasswordUri, resetPasswordUri
} from '../utils/constants';
import { resetDatabase } from '../utils/resetDatabase';

const request: supertest.SuperTest<supertest.Test> = supertest(app);
let account: Account;
let confirmationCode: AccountAction;
const validPassword: string = 'This123IsValid';
const validUuid: string = 'ad60dc75-797d-48df-a9fa-be9b88ccb5d8';
const nonValidUuid: string = '088d2a92-aaaa-bbbb-bedd-2efc8f566dbb';

beforeEach(async () => {
  await resetDatabase();
  await request.post(registerUri).send(takenAccount);

  account = await models.Account.findOne({
    where: {
      email: takenAccount.email
    }
  }) as Account;

  confirmationCode = await models.AccountAction.findOne({
    where: {
      accountId: account.id
    }
  }) as AccountAction;
});

describe(`Test POST ${emailConfirmationUri}`, () => {

  it('should allow confirmation of (unconfirmed) email', async () => {
    const res: supertest.Response = await request.post(emailConfirmationUri)
      .set('Accept', 'application/json')
      .send({ confirmationId: confirmationCode.id })
      .expect('Content-Type', /json/);

    expect(res.body.success).toBeTruthy();
    expect(res.body.errors).not.toBeDefined();
    expect(res.statusCode).toBe(HttpCode.Ok);
  });

  it('should not allow confirmation of confirmed email', async () => {
    let res: supertest.Response = await request.post(emailConfirmationUri)
      .set('Accept', 'application/json')
      .send({ confirmationId: confirmationCode.id })
      .expect('Content-Type', /json/);

    expect(res.body.success).toBeTruthy();
    expect(res.body.errors).not.toBeDefined();
    expect(res.statusCode).toBe(HttpCode.Ok);

    res = await request.post(emailConfirmationUri)
      .set('Accept', 'application/json')
      .send({ confirmationId: confirmationCode.id })
      .expect('Content-Type', /json/);

    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors).toContain(errors.accountErrors.alreadyConfirmedError);
    expect(res.statusCode).toBe(HttpCode.Conflict);
  });

  it('should not allow confirmation if confirmationId is expired', async () => {
    confirmationCode.set({
      expireAt: new Date('2010-01-01')
    });
    await confirmationCode.save();

    const res: supertest.Response = await request.post(emailConfirmationUri)
      .set('Accept', 'application/json')
      .send({ confirmationId: confirmationCode.id })
      .expect('Content-Type', /json/);

    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors).toContain(errors.accountErrors.confirmationCodeExpiredError);
    expect(res.statusCode).toBe(HttpCode.NotFound);
  });

  it('should response with error if confirmationId is wrong type (RESET_PASSWORD)', async () => {
    // First confirm the account email.
    await request.post(emailConfirmationUri)
      .set('Accept', 'application/json')
      .send({ confirmationId: confirmationCode.id });

    // Get password reset code.
    await request.post(requestResetPasswordUri)
      .set('Accept', 'application/json')
      .send({ email: account.email });

    const accountAction: AccountAction = await models.AccountAction.findOne({
      where: {
        accountId: account.id,
        type: 'RESET_PASSWORD'
      }
    }) as AccountAction;

    const res: supertest.Response = await request.post(emailConfirmationUri)
      .set('Accept', 'application/json')
      .send({ confirmationId: accountAction.id })
      .expect('Content-Type', /json/);

    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors).toContain(errors.accountErrors.incorrectActionType);
    expect(res.statusCode).toBe(HttpCode.Conflict);
  });

  it('should response validation error if confirmationId is not valid UUID', async () => {
    const res: supertest.Response = await request.post(emailConfirmationUri)
      .set('Accept', 'application/json')
      .send({ confirmationId: nonValidUuid })
      .expect('Content-Type', /json/);

    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors).toContain(errors.validationErrors.inputValueTypeError);
    expect(res.statusCode).toBe(HttpCode.BadRequest);
  });

  it('should response validation error if confirmationId not send in request body', async () => {
    const res: supertest.Response = await request.post(emailConfirmationUri)
      .set('Accept', 'application/json')
      .send()
      .expect('Content-Type', /json/);

    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors).toContain(errors.validationErrors.requiredConfirmationCodeError);
    expect(res.statusCode).toBe(HttpCode.BadRequest);
  });
});

describe(`Test POST ${resendEmailConfirmationUri}`, () => {

  it('should resend confirmation code for (unconfirmed) email', async () => {
    let rows: number = await models.AccountAction.count();
    expect(rows).toBe(1);

    const res: supertest.Response = await request.post(resendEmailConfirmationUri)
      .set('Accept', 'application/json')
      .send({ email: account.email })
      .expect('Content-Type', /json/);

    rows = await models.AccountAction.count();
    expect(rows).toBe(2);
    expect(res.body.success).toBeTruthy();
    expect(res.body.errors).not.toBeDefined();
    expect(res.statusCode).toBe(HttpCode.Ok);
  });

  it('should not resend confirmation code for confirmed email', async () => {
    let rows: number = await models.AccountAction.count();
    expect(rows).toBe(1);

    // confirm email first
    let res: supertest.Response = await request.post(emailConfirmationUri)
      .set('Accept', 'application/json')
      .send({ confirmationId: confirmationCode.id })
      .expect('Content-Type', /json/);

    res = await request.post(resendEmailConfirmationUri)
      .set('Accept', 'application/json')
      .send({ email: account.email })
      .expect('Content-Type', /json/);

    rows = await models.AccountAction.count();
    expect(rows).toBe(1);
    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors).toContain(errors.accountErrors.alreadyConfirmedError);
    expect(res.statusCode).toBe(HttpCode.Conflict);
  });

  it('should response with error if email not found', async () => {
    const res: supertest.Response = await request.post(resendEmailConfirmationUri)
      .set('Accept', 'application/json')
      .send({ email: 'nonExisting@test.com' })
      .expect('Content-Type', /json/);

    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors).toContain(errors.accountErrors.emailNotFoundError);
    expect(res.statusCode).toBe(HttpCode.NotFound);
  });

  it('should response validation error if email not send in request body', async () => {
    const res: supertest.Response = await request.post(resendEmailConfirmationUri)
      .set('Accept', 'application/json')
      .send()
      .expect('Content-Type', /json/);

    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors).toContain(errors.validationErrors.requiredEmailError);
    expect(res.statusCode).toBe(HttpCode.BadRequest);
  });

  it('should response validation error if email not valid email', async () => {
    const res: supertest.Response = await request.post(resendEmailConfirmationUri)
      .set('Accept', 'application/json')
      .send({ email: 'notvalid' })
      .expect('Content-Type', /json/);

    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors).toContain(errors.validationErrors.notValidEmailError);
    expect(res.statusCode).toBe(HttpCode.BadRequest);
  });

  it('should response validation error if email too long', async () => {
    const res: supertest.Response = await request.post(resendEmailConfirmationUri)
      .set('Accept', 'application/json')
      .send({ email: `abfsdfsdfsdfdfsdfsdfsdfsdfsdfsdfc@abcbbbbfjhkjsdlkfjsdjfioje
      lfjiljsljfsjfoisdjflsjdksufsdipifsdjfipjsdlkfjsdfiosdjfijsdlkfjsdkljfklsdjkl
      fjsdkljfklsdjklfjsdkljfllfjsdifjslkjfklsdjfsjdlfkjsdklfjklsdjklfjslkdfjlksdj
      flksdjfkljsdlkfjklsdjfl.com`
      })
      .expect('Content-Type', /json/);

    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors).toContain(errors.validationErrors.emailMaxLengthError);
    expect(res.statusCode).toBe(HttpCode.BadRequest);
  });
});

describe(`Test POST ${requestResetPasswordUri}`, () => {

  it('should send password reset link for confirmed email', async () => {
    // First confirm the account email.
    await request.post(emailConfirmationUri)
      .set('Accept', 'application/json')
      .send({ confirmationId: confirmationCode.id });

    const res: supertest.Response = await request.post(requestResetPasswordUri)
      .set('Accept', 'application/json')
      .send({ email: account.email })
      .expect('Content-Type', /json/);

    expect(res.body.success).toBeTruthy();
    expect(res.body.errors).not.toBeDefined();
    expect(res.statusCode).toBe(HttpCode.Ok);
  });

  it('should not send password reset link for unconfirmed email', async () => {
    const res: supertest.Response = await request.post(requestResetPasswordUri)
      .set('Accept', 'application/json')
      .send({ email: account.email })
      .expect('Content-Type', /json/);

    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors).toContain(errors.accountErrors.emailNotConfirmedError);
    expect(res.statusCode).toBe(HttpCode.Forbidden);
  });

  it('should response with error if email not found', async () => {
    const res: supertest.Response = await request.post(requestResetPasswordUri)
      .set('Accept', 'application/json')
      .send({ email: 'nonExisting@test.com' })
      .expect('Content-Type', /json/);

    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors).toContain(errors.accountErrors.emailNotFoundError);
    expect(res.statusCode).toBe(HttpCode.NotFound);
  });

  it('should response validation error if email not valid email', async () => {
    const res: supertest.Response = await request.post(requestResetPasswordUri)
      .set('Accept', 'application/json')
      .send({ email: 'notvalid' })
      .expect('Content-Type', /json/);

    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors).toContain(errors.validationErrors.notValidEmailError);
    expect(res.statusCode).toBe(HttpCode.BadRequest);
  });

  it('should response validation error if email too long', async () => {
    const res: supertest.Response = await request.post(requestResetPasswordUri)
      .set('Accept', 'application/json')
      .send({ email: `abfsdfsdfsdfdfsdfsdfsdfsdfsdfsdfc@abcbbbbfjhkjsdlkfjsdjfioje
      lfjiljsljfsjfoisdjflsjdksufsdipifsdjfipjsdlkfjsdfiosdjfijsdlkfjsdkljfklsdjkl
      fjsdkljfklsdjklfjsdkljfllfjsdifjslkjfklsdjfsjdlfkjsdklfjklsdjklfjslkdfjlksdj
      flksdjfkljsdlkfjklsdjfl.com`
      })
      .expect('Content-Type', /json/);

    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors).toContain(errors.validationErrors.emailMaxLengthError);
    expect(res.statusCode).toBe(HttpCode.BadRequest);
  });
});

describe(`Test PATCH ${resetPasswordUri}`, () => {

  it('should reset password succesfully for confirmed email', async () => {
    // First confirm the account email.
    await request.post(emailConfirmationUri)
      .set('Accept', 'application/json')
      .send({ confirmationId: confirmationCode.id });

    // Get reset code.
    await request.post(requestResetPasswordUri)
      .set('Accept', 'application/json')
      .send({ email: account.email });

    const accountAction: AccountAction = await models.AccountAction.findOne({
      where: {
        accountId: account.id,
        type: 'RESET_PASSWORD'
      }
    }) as AccountAction;

    const res: supertest.Response = await request.patch(resetPasswordUri)
      .set('Accept', 'application/json')
      .send({ confirmationId: accountAction.id, password: validPassword })
      .expect('Content-Type', /json/);

    expect(res.body.success).toBeTruthy();
    expect(res.body.errors).not.toBeDefined();
    expect(res.statusCode).toBe(HttpCode.Ok);
  });

  it('should response with error if confirmationId is not found', async () => {
    const res: supertest.Response = await request.patch(resetPasswordUri)
      .set('Accept', 'application/json')
      .send({ confirmationId: validUuid, password: validPassword })
      .expect('Content-Type', /json/);

    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors).toContain(errors.accountErrors.confirmationCodeNotFoundError);
    expect(res.statusCode).toBe(HttpCode.NotFound);
  });

  it('should response with error if confirmationId is wrong type (CONFIRM_EMAIL)', async () => {
    const res: supertest.Response = await request.patch(resetPasswordUri)
      .set('Accept', 'application/json')
      .send({ confirmationId: confirmationCode.id, password: validPassword })
      .expect('Content-Type', /json/);

    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors).toContain(errors.accountErrors.incorrectActionType);
    expect(res.statusCode).toBe(HttpCode.Conflict);
  });

  it('should response validation error if confirmationId is not valid UUID', async () => {
    const res: supertest.Response = await request.patch(resetPasswordUri)
      .set('Accept', 'application/json')
      .send({ confirmationId: nonValidUuid, password: validPassword })
      .expect('Content-Type', /json/);

    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors).toContain(errors.validationErrors.inputValueTypeError);
    expect(res.statusCode).toBe(HttpCode.BadRequest);
  });

  it('should response validation error if confirmationId is not send in body', async () => {
    const res: supertest.Response = await request.patch(resetPasswordUri)
      .set('Accept', 'application/json')
      .send({ password: validPassword })
      .expect('Content-Type', /json/);

    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors).toContain(errors.validationErrors.requiredConfirmationCodeError);
    expect(res.statusCode).toBe(HttpCode.BadRequest);
  });

  it('should response validation error if password does not match requirements', async () => {
    // No lowercase letters.
    let res: supertest.Response = await request.patch(resetPasswordUri)
      .set('Accept', 'application/json')
      .send({ confirmationId: validUuid, password: 'NOLOWERCASE12345LETTERS' })
      .expect('Content-Type', /json/);

    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors).toContain(errors.validationErrors.passwordLowercaseError);
    expect(res.statusCode).toBe(HttpCode.BadRequest);

    // No uppercase letters.
    res = await request.patch(resetPasswordUri)
      .set('Accept', 'application/json')
      .send({ confirmationId: validUuid, password: 'nouppercase12345letters' })
      .expect('Content-Type', /json/);

    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors).toContain(errors.validationErrors.passwordUppercaseError);
    expect(res.statusCode).toBe(HttpCode.BadRequest);

    // No numbers.
    res = await request.patch(resetPasswordUri)
      .set('Accept', 'application/json')
      .send({ confirmationId: validUuid, password: 'JUSTlettersINthisEXAMPLE' })
      .expect('Content-Type', /json/);

    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors).toContain(errors.validationErrors.passwordNumberError);
    expect(res.statusCode).toBe(HttpCode.BadRequest);

    // Not long enough password.
    res = await request.patch(resetPasswordUri)
      .set('Accept', 'application/json')
      .send({
        confirmationId: validUuid,
        password: 'x'.repeat(constants.account.passwordMinLength - 1)
      })
      .expect('Content-Type', /json/);

    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors).toContain(errors.validationErrors.passwordNumberError);
    expect(res.statusCode).toBe(HttpCode.BadRequest);

    // Too long password.
    res = await request.patch(resetPasswordUri)
      .set('Accept', 'application/json')
      .send({
        confirmationId: validUuid,
        password: 'x'.repeat(constants.account.passwordMaxLength + 1)
      })
      .expect('Content-Type', /json/);

    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors).toContain(errors.validationErrors.passwordNumberError);
    expect(res.statusCode).toBe(HttpCode.BadRequest);
  });

  it('should response validation error if password is not send in body', async () => {
    const res: supertest.Response = await request.patch(resetPasswordUri)
      .set('Accept', 'application/json')
      .send({ confirmationId: validUuid })
      .expect('Content-Type', /json/);

    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors).toContain(errors.validationErrors.requiredPasswordError);
    expect(res.statusCode).toBe(HttpCode.BadRequest);
  });
});
