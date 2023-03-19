import { NextFunction, Request, Response } from 'express';
import { ValidationError } from 'yup';

import { NODE_ENV } from '../configs/environment';
import { errors } from '../error/errorCodes';
import { ApiError } from '../types/error';
import { HttpCode } from '../types/httpCode';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction): void {

  if (NODE_ENV === 'development') {
    console.log(err);
  }

  if (err instanceof ApiError) {
    res.status(err.statusCode);

    res.send({
      success: false,
      errors: [err.message],
    });
    return;
  }

  if (err instanceof SyntaxError) {
    res.status(HttpCode.BadRequest);

    res.send({
      success: false,
      errors: ['syntaxError'],
    });
    return;
  }

  if (err instanceof ValidationError) {
    res.status(HttpCode.BadRequest).send({
      success: false,
      errors: err.errors
    });
    return;
  }

  // Fallback if no other error matches
  res.status(HttpCode.InternalServerError).send({
    success: false,
    errors: [errors.generalErrors.internalServerError]
  });
  return;
}
