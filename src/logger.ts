import { NextFunction, Request, Response } from 'express';


// Middleware to log webhook information
export function webhookLogger(): (req: Request, res: Response, next: NextFunction) => void {
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

    next();
  };
}

