import { RequestHandler } from 'express';
import morgan from 'morgan';

import logger from '../configs/winston';

// Logs incoming requests and their responses using Winston logger.
const loggerMiddleware: RequestHandler = morgan(
  'Method: :method Path: :url Status: :status Content-length: :res[content-length] - response time: :response-time ms',
  {
    stream: {
      write: (message: string) => logger.http(message.trim())
    }
  }
);

export default loggerMiddleware;
