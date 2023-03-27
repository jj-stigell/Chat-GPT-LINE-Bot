import { NextFunction, Request, Response } from 'express';

// Middleware to log request information
export function loggerMiddleware(): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction) => {
    // eslint-disable-next-line @typescript-eslint/typedef
    const { method, path, ip } = req;
    const startTime: number = Date.now();

    res.on('finish', () => {
      const statusCode: number = res.statusCode;
      const endTime: number = Date.now();
      const elapsedTime: number = endTime - startTime;

      console.log(
        // eslint-disable-next-line max-len
        `IP: ${ip} | Time: ${new Date(startTime).toISOString()} | Method: ${method} | Path: ${path} | Status: ${statusCode} | Response Time: ${elapsedTime}ms`
      );
    });

    // eslint-disable-next-line max-len
    // Mar 26 12:25:30 AM  IP: ::ffff:127.0.0.1 | Time: 2023-03-25T15:25:30.538Z | Method: POST | Path: /webhook | Status: 404 | Response Time: 3ms

    next();
  };
}

