/* eslint-disable @typescript-eslint/no-unused-vars */
import { Cookie, CookieAccessInfo } from 'cookiejar';
import supertest, { SuperAgentTest } from 'supertest';

import { app } from '../../src/app';
import models from '../../src/database/models';
import Account from '../../src/database/models/account';
import Session from '../../src/database/models/session';
import { errors } from '../../src/error/errorCodes';
import { HttpCode } from '../../src/types/httpCode';
import { createAccount, loginUri, logoutUri, registerUri, takenAccount } from '../utils/constants';
import { resetDatabase } from '../utils/resetDatabase';

const request: supertest.SuperTest<supertest.Test> = supertest(app);
let account: Account;

beforeEach(async () => {
  await resetDatabase();
  await request.post(registerUri).send(takenAccount);


  account = await models.Account.findOne({
    where: {
      email: takenAccount.email
    }
  }) as Account;

});

describe(`Test POST ${registerUri}`, () => {

  it('should allow creation of a new account', async () => {
    const res: supertest.Response = await request.post(registerUri)
      .set('Accept', 'application/json')
      .send(createAccount)
      .expect('Content-Type', /json/);

    expect(res.body.success).toBeTruthy();
    expect(res.body.errors).not.toBeDefined();
    expect(res.statusCode).toBe(HttpCode.Ok);
  });

  it('should not allow creation of a new account if email taken', async () => {
    const  res: supertest.Response = await request.post(registerUri)
      .set('Accept', 'application/json')
      .send({ ...takenAccount, username: 'notTaken' })
      .expect('Content-Type', /json/);

    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors).toContain(errors.accountErrors.emailInUseError);
    expect(res.statusCode).toBe(HttpCode.Conflict);
  });

  it('should not allow creation of a new account if username taken', async () => {
    const  res: supertest.Response = await request.post(registerUri)
      .set('Accept', 'application/json')
      .send({ ...takenAccount, email: 'test@testing.com' })
      .expect('Content-Type', /json/);

    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors).toContain(errors.accountErrors.usernameInUseError);
    expect(res.statusCode).toBe(HttpCode.Conflict);
  });
});

describe(`Test POST ${loginUri}`, () => {

  it('should allow logging in with the correct credentials and return jwt in cookie', async () => {
    account.set({ emailVerified: true });
    await account.save();

    const res: supertest.Response = await request.post(loginUri)
      .send({ email: takenAccount.email, password: takenAccount.password })
      .expect('Content-Type', /json/);

    const cookies: Array<string> = res.headers['set-cookie'];
    expect(cookies[0]).toMatch(/^jwt/);
    expect(res.body.success).toBeTruthy();
    expect(res.body.errors).not.toBeDefined();
    expect(res.body.data.sessionId).toBeDefined();
    expect(res.statusCode).toBe(HttpCode.Ok);
  });

  it('should not allow logging in with the non-existing credentials (email)', async () => {
    const res: supertest.Response = await request.post(loginUri)
      .send({ email: 'abc@abc.com', password: takenAccount.password })
      .expect('Content-Type', /json/);

    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors).toContain(errors.accountErrors.emailNotFoundError);
    expect(res.body.data).not.toBeDefined();
    expect(res.statusCode).toBe(HttpCode.NotFound);
  });

  it('should not allow logging in with the incorrect credentials (password)', async () => {
    account.set({ emailVerified: true });
    await account.save();

    const res: supertest.Response = await request.post(loginUri)
      .send({ email: takenAccount.email, password: '1234567' })
      .expect('Content-Type', /json/);

    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors).toContain(errors.accountErrors.emailOrPasswordIncorrectError);
    expect(res.body.data).not.toBeDefined();
    expect(res.statusCode).toBe(HttpCode.Unauthorized);
  });
});

describe(`Test POST ${logoutUri}`, () => {

  it('should logout (clear cookie) successfully when valid cookie supplied', async () => {
    account.set({ emailVerified: true });
    await account.save();

    // No sessions should exists in the database.
    const rows: number = await models.Session.count();
    expect(rows).toBe(0);

    let res: supertest.Response = await request.post(loginUri)
      .send({ email: takenAccount.email, password: takenAccount.password })
      .expect('Content-Type', /json/);

    const sessionId: string = res.body.data.sessionId;
    let session: Session = await models.Session.findByPk(sessionId) as Session;
    let cookies: Array<string> = res.headers['set-cookie'];

    expect(session.active).toBeTruthy();
    expect(cookies[0]).toMatch(/^jwt/);

    res = await request.post(logoutUri)
      .send()
      .set('Cookie', cookies)
      .expect('Content-Type', /json/);

    // Session should be inactive.
    session = await models.Session.findByPk(sessionId) as Session;
    cookies = res.headers['set-cookie'];

    expect(session.active).toBeFalsy();
    expect(cookies[0]).toMatch(/^jwt=;/);
    expect(res.body.success).toBeTruthy();
    expect(res.body.errors).not.toBeDefined();
    expect(res.statusCode).toBe(HttpCode.Ok);
  });

  it('should give error no cookie supplied', async () => {
    const res: supertest.Response = await request.post(logoutUri).send();

    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).not.toBeDefined();
    expect(res.statusCode).toBe(HttpCode.Unauthorized);
  });
});

/*
describe('Test POST /v1/auth/login and expiry', () => {
  it('should expire the session after a set time', async () => {
    // Use the agent for cookie persistence
    const agent: SuperAgentTest = supertest.agent(app);
    const realDate: Date = new Date();
    await agent.post('/v1/auth/login')
      .withCredentials(true)
      .send({ email: 'sysadmin@aalto.fi', password: 'grades' })
      .expect('Content-Type', /json/)
      .expect(HttpCode.Ok);
    await agent.get('/v1/auth/self-info').withCredentials(true).expect(HttpCode.Ok);
    const jwt: Cookie | undefined = agent.jar.getCookie('jwt', CookieAccessInfo.All);
    if (!jwt) {
      throw new Error('jwt not available');
    }
    // Simulate situtation where the browser does not properly expire the cookie
    mockdate.set(realDate.setMilliseconds(realDate.getMilliseconds() + JWT_COOKIE_EXPIRY_MS + 1));
    jwt.expiration_date = realDate.setSeconds(realDate.getSeconds() + JWT_EXPIRY_SECONDS * 2);
    agent.jar.setCookie(jwt);
    await agent.get('/v1/auth/self-info').withCredentials(true).expect(HttpCode.Ok);
    mockdate.set(realDate.setSeconds(realDate.getSeconds() + JWT_EXPIRY_SECONDS + 1));
    await agent.get('/v1/auth/self-info').withCredentials(true).expect(HttpCode.Unauthorized);
  });
});
*/
