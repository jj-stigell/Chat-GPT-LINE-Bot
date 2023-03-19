// Modules
import argon from 'argon2';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { Strategy as JWTStrategy, VerifiedCallback } from 'passport-jwt';
import { IVerifyOptions, Strategy as LocalStrategy } from 'passport-local';
import { Transaction } from 'sequelize';
import * as yup from 'yup';

// Project imports
import { constants, JwtExpiry } from '../configs/constants';
import { sequelize } from '../database';
import models from '../database/models';
import Account from '../database/models/account';
import UserAction from '../database/models/accountAction';
import { errors } from '../error/errorCodes';
import { ApiError, InvalidCredentials } from '../types/error';
import { JwtPayload, LoginResult } from '../types/general';
import { HttpCode } from '../types/httpCode';
import { Register } from '../types/request';
import { sendEmailConfirmation } from './utils/mailer';

// Dev delete later
import { JWT_SECRET, NODE_ENV } from '../configs/environment';









import UAParser, { IResult } from 'ua-parser-js';
import Session from '../database/models/session';
import { findAccountByEmail } from './utils/account';




export async function register(req: Request, res: Response): Promise<void> {
  const requestSchema: yup.ObjectSchema<Register> = yup.object({
    email: yup.
      string()
      .email(errors.validationErrors.notValidEmailError)
      .max(constants.account.emailMaxLength, errors.validationErrors.emailMaxLengthError)
      .typeError(errors.validationErrors.inputValueTypeError)
      .required(errors.validationErrors.requiredEmailError),
    username: yup
      .string()
      .max(constants.account.usernameMaxLength, errors.validationErrors.usernameMaxLengthError)
      .min(constants.account.usernameMinLength, errors.validationErrors.usernameMinLengthError)
      .typeError(errors.validationErrors.inputValueTypeError)
      .required(errors.validationErrors.requiredUsernameError),
    password: yup
      .string()
      .max(constants.account.passwordMaxLength, errors.validationErrors.passwordMaxLengthError)
      .min(constants.account.passwordMinLength, errors.validationErrors.passwordMinLengthError)
      .matches(constants.regex.lowercaseRegex, errors.validationErrors.passwordLowercaseError)
      .matches(constants.regex.uppercaseRegex, errors.validationErrors.passwordUppercaseError)
      .matches(constants.regex.numberRegex, errors.validationErrors.passwordNumberError)
      .typeError(errors.validationErrors.inputValueTypeError)
      .required(errors.validationErrors.requiredPasswordError),
    acceptTos: yup
      .boolean()
      .typeError(errors.validationErrors.inputValueTypeError)
      .required(errors.validationErrors.requiredAcceptToslError),
    allowNewsLetter: yup
      .boolean()
      .typeError(errors.validationErrors.inputValueTypeError)
      .notRequired(),
    language: yup
      .string()
      .oneOf(constants.general.availableLanguages)
      .typeError(errors.validationErrors.inputValueTypeError)
      .required()
  });

  await requestSchema.validate(req.body, { abortEarly: false });

  const {
    email, username, password, acceptTos, allowNewsLetter, language
  }: Register = req.body;

  if (!acceptTos) {
    throw new ApiError(errors.validationErrors.tosNotAcceptedError, HttpCode.BadRequest);
  }

  const usernameTaken: Account | null = await models.Account.findOne({
    where: {
      username: username
    }
  });

  if (usernameTaken) {
    throw new ApiError(errors.accountErrors.usernameInUseError, HttpCode.Conflict);
  }

  const emailTaken: Account | null = await models.Account.findOne({
    where: {
      email: email
    }
  });

  if (emailTaken) {
    throw new ApiError(errors.accountErrors.emailInUseError, HttpCode.Conflict);
  }

  const confirmation: [Account, UserAction] = await sequelize.transaction(
    async (t: Transaction) => {
      return models.Account.create({
        email,
        username,
        password: await argon.hash(password.trim()),
        allowNewsLetter: allowNewsLetter ?? false,
        tosAccepted: acceptTos,
        languageId: language.toUpperCase()
      }, { transaction: t }).then(async function (account: Account) {
        const confirmation: UserAction = await models.AccountAction.create({
          accountId: account.id,
          type: 'CONFIRM_EMAIL',
          expireAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        }, { transaction: t });
        return [account, confirmation];
      });
    });


  if (NODE_ENV !== 'test') {
    await sendEmailConfirmation(
      language, confirmation[0].username, email, confirmation[1].id
    );
  }

  res.status(HttpCode.Ok).json({
    success: true
  });
}

/**
 * Login to an existing account.
 * @param {Request} req - Express request.
 * @param {Response} res - Express response.
 * @throws {ApiError} - If email or password are incorrect or validation fails,
 * function throws an error with a relevant error code.
 */
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  passport.authenticate(
    'login',
    async (err: unknown, loginResult: LoginResult | boolean) => {
      if (err) {
        return next(err);
      }
      if (typeof loginResult === 'boolean') {
        return res.status(HttpCode.Unauthorized).send({
          success: false,
          errors: [errors.accountErrors.emailOrPasswordIncorrectError]
        });
      }

      req.login(
        loginResult,
        { session: false },
        async (error: unknown) => {
          if (error) {
            return next(error);
          }

          const payload: JwtPayload = {
            id: loginResult.id,
            sessionId: loginResult.sessionId
          };
          const token: string = jwt.sign(payload, JWT_SECRET, {
            expiresIn: JwtExpiry,
          });
          res.cookie('jwt', token, {
            httpOnly: true,
            secure: NODE_ENV === 'production',
            sameSite: 'none',
            maxAge: JwtExpiry,
          });
          return res.status(HttpCode.Ok).json({
            success: true,
            data: {
              sessionId: loginResult.sessionId,
            }
          });
        }
      );
    }
  )(req, res, next);
}

/**
 * Logout from existing session by removing jwt from cookies and deactivating session.
 * Possible error cases are handled by the error middleware.
 * @param {Request} _req - Express request.
 * @param {Response} res - Express response.
 * @param {NextFunction} next - Express next function.
 */
export async function logout(_req: Request, res: Response, next: NextFunction): Promise<void> {
  const userData: JwtPayload = _req.user as JwtPayload;

  Session.update(
    { active: false },
    { where: { id: userData.sessionId }
    }).then(function () {
    res.clearCookie('jwt', {
      httpOnly: true,
    });
    res.status(HttpCode.Ok).json({
      success: true
    });

  }).catch(function (error: unknown) {
    next(error);
  });
}

passport.use(
  'login',
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true
    },
    async (
      req: Request,
      email: string,
      password: string,
      done: (error: unknown | null, user?: LoginResult | false, options?: IVerifyOptions) => void
    ) => {
      try {
        const account: Account = await findAccountByEmail(email);

        if (!account.emailVerified) {
          throw new ApiError(errors.accountErrors.emailNotConfirmedError, HttpCode.Forbidden);
        }

        const userAgent: string = req?.headers['user-agent'] ?? '';
        const parsedUserAgent: IResult | undefined = UAParser(userAgent);

        const session: Session = await Session.create({
          accountId: account.id,
          expireAt: new Date(Date.now() + JwtExpiry),
          browser: parsedUserAgent?.browser.name ?? '-',
          os: parsedUserAgent?.os.name ?? '-',
          device: parsedUserAgent?.device.type ?? '-'
        });

        const match: boolean = await argon.verify(account.password.trim(), password);
        if (!match) {
          throw new InvalidCredentials();
        }

        const role: LoginResult = {
          id: account.id,
          sessionId: session.id
        };
        return done(null, role, { message: 'success' });
      } catch (error) {
        if (error instanceof InvalidCredentials) {
          return done(null, false, { message: 'invalid credentials' });
        }
        return done(error);
      }
    }
  ),
);

passport.use('jwt', new JWTStrategy(
  {
    secretOrKey: JWT_SECRET,
    jwtFromRequest: (req: Request): string | null => {
      return (req && req.cookies) ? req.cookies['jwt'] : null;
    }
  },
  async (jwt_payload: JwtPayload, done: VerifiedCallback): Promise<void> => {
    try {
      return done(null, jwt_payload);
    } catch(e) {
      return done(e, false);
    }
  }
)
);
