import { Request, Response, NextFunction, RequestHandler } from 'express';

export function requestWrap(handler: (
  req: Request, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    handler(req, res, next).catch(next);
  };
}
