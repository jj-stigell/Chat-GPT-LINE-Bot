// Modules
import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * requestWrap is a higher-order function that wraps a given request handler
 * with error handling functionality. It catches any errors thrown by the handler
 * and passes them to the next middleware in the Express middleware chain.
 * This allows for centralized error handling and avoids the need for
 * repetitive try-catch blocks in individual route handlers.
 *
 * @param {Function} handler - The request handler to be wrapped. It must be a function
 *   that accepts three arguments (req, res, next) and returns a Promise.
 * @returns {RequestHandler} - A wrapped request handler function that will execute
 *   the original handler and catch any errors, passing them to the next middleware.
 */
export function requestWrap(handler: (
  req: Request, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    handler(req, res, next).catch(next);
  };
}
