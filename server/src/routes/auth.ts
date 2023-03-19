import { Router } from 'express';
import passport from 'passport';

import { login, logout, register } from '../controllers/auth';
import { controllerDispatcher } from '../middleware/controllerDispatcher';

export const router: Router = Router();

/**
 * @swagger
 * definitions:
 *   Credentials:
 *     type: object
 *     properties:
 *       email:
 *         type: string
 *         description: Account email address.
 *         required: true
 *       password:
 *         type: string
 *         description: Plaintext password of the user.
 *         required: true
 *   LoginResponse:
 *     type: object
 *     properties:
 *       success:
 *         type: boolean
 *         description: Success of the request.
 *       data:
 *         type: object
 *         properties:
 *           sessionId:
 *             type: string
 *             description: Id of the session the jwt is connected to.
 *   RegisterRequest:
 *     type: object
 *     properties:
 *       username:
 *         type: string
 *         description: Username for the account.
 *         required: true
 *       email:
 *         type: string
 *         description: Email address, to be used as a credential.
 *         required: true
 *       password:
 *         type: string
 *         description: Plaintext password.
 *         required: true
 *       acceptTos:
 *         type: boolean
 *         description: Information on accepting the terms of service.
 *         required: true
 *       allowNewsLetter:
 *         type: boolean
 *         description: Permit for sending news letters to the account email address.
 *         required: false
 *       language:
 *         type: string
 *         description: Language code (ISO 639-1) for the account, defaults to "EN".
 *         required: false
 *   RegisterResponse:
 *     type: object
 *     properties:
 *       success:
 *         type: boolean
 *         description: Success of the request.
 */

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     tags: [Auth]
 *     description: >
 *       Attempts to create a new user with the specified information, for
 *       logging in to the system.
 *     requestBody:
 *       description: Basic user information.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/definitions/RegisterRequest'
 *     responses:
 *       200:
 *         description: The user has been created and logged in.
 *         content:
 *           application/json:
 *             schema:
 *               $req: '#/definitions/RegisterResponse'
 *         headers:
 *           Set-Cookie:
 *             description: JWT token, storing an access token to allow using the API.
 *             schema:
 *               type: string
 *               example: jwt=wliuerhlwieurh; Secure; HttpOnly; SameSite=None
 *       409:
 *         description: A user with the specified email already exists.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 */
router.post(
  '/register',
  controllerDispatcher(register)
);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     tags: [Auth]
 *     description: Log in as a user.
 *     requestBody:
 *       description: The credentials for the user, currently consisting of the email and password.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/definitions/Credentials'
 *     responses:
 *       200:
 *         description: The login has succeeded, and an access token is return in a cookie.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/LoginResponse'
 *         headers:
 *            Set-Cookie:
 *              description: JWT token, storing an access token to allow using the API.
 *              schema:
 *                type: string
 *                example: jwt=xxxxx.yyyyy.zzzzz; Secure; HttpOnly; SameSite=None
 *       401:
 *         description: >
 *           The login has failed, due to invalid credentials or an invalid request format.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *
 */
router.post(
  '/login',
  controllerDispatcher(login)
);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     tags: [Auth]
 *     description: >
 *       Log out of a session, requesting the browser to remove
 *       its session JWT token from the cookie.
 *
 *       This requires the user to be already logged in, authenticated via a
 *       JWT token in the cookie.
 *     responses:
 *       200:
 *         description: The user has successfully logged out.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Whether the operation succeeded.
 *       401:
 *         description: The user is not logged in, or the JWT token is invalid/expired.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *     security:
 *       - cookieAuth: []
 */
router.post(
  '/logout',
  passport.authenticate('jwt', { session: false }),
  controllerDispatcher(logout)
);
