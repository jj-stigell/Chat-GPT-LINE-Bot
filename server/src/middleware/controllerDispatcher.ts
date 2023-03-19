import express, { NextFunction, RequestHandler } from 'express';

export function controllerDispatcher<
 T, P, ResBody, ReqBody, ReqQuery, Locals extends Record<string, T>
>(
  fn: (
    req: express.Request<P, ResBody, ReqBody, ReqQuery, Locals>,
    res: express.Response<ResBody, Locals>,
    next: NextFunction,
  ) => Promise<void>
): RequestHandler<P, ResBody, ReqBody, ReqQuery, Locals> {
  return async (
    req: express.Request<P, ResBody, ReqBody, ReqQuery, Locals>,
    res: express.Response<ResBody, Locals>,
    next: NextFunction
  ): Promise<void> => {
    try {
      await fn(req, res, next);
      return;
    } catch (err: unknown) {
      next(err);
    }
  };
}
