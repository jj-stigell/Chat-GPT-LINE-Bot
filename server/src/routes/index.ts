// Modules
//import cookieParser from 'cookie-parser';
import { Router } from 'express';
//mport swaggerJsdoc, { OAS3Options } from 'swagger-jsdoc';
//import swaggerUI from 'swagger-ui-express';

// Project imports
//import { definition } from '../configs/swagger';

// Routes
//import { router as authRouter } from './auth';
//import { router as accountRouter } from './account';
import { router as botRouter } from './bot';

/*
const options: OAS3Options = {
  definition,
  apis: ['./src/routes/*.ts'],
};
*/

//const openapiSpecification: object = swaggerJsdoc(options);

export const router: Router = Router();

//router.use(cookieParser());
//router.use('/auth/', authRouter);
//router.use('/account/', accountRouter);
router.use('/bot/', botRouter);

//router.use('/api-docs', swaggerUI.serve);
//router.get('/api-docs', swaggerUI.setup(openapiSpecification));

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     jwtCookie:
 *       type: apiKey
 *       in: cookie
 *       name: jwt
 * definitions:
 *   Failure:
 *     type: object
 *     description: A reason for a failure, with a chiefly developer-facing error message.
 *     properties:
 *       success:
 *         type: boolean
 *         description: '`false` to indicate failure.'
 *         example: false
 *       errors:
 *         type: array
 *         items:
 *           type: string
 *         description: An error message to explain the error.
 */
