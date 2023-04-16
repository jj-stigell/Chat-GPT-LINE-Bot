// Modules
import { middleware, WebhookEvent } from '@line/bot-sdk';
import express, { Application, NextFunction, Request, Response } from 'express';

// Project imports
import { lineMiddlewareConfig } from './configs/configuration';
import { connectToDatabase } from './database';
import { NODE_ENV, PORT } from './configs/environment';
import { populateCache } from './util/cache';
import loggerMiddleware from './middleware/loggerMiddleware';
import { testGetUser, testHash } from './controllers.dev';
import logger from './configs/winston';
import { handleEvent } from './util/eventHandlers';

export const app: Application = express();

app.use(express.urlencoded({ extended: true }));
app.use(loggerMiddleware);

// Health check endpoint.
app.get('/health', (_req: Request, res: Response, next: NextFunction) => {
  res.status(200).send();
  next();
});

// Handle LINE webhook calls.
app.post(
  '/webhook',
  middleware(lineMiddlewareConfig),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!Array.isArray(req.body.events)) {
      res.status(500).end();
      next();
    }
    const events: Array<WebhookEvent> = req.body.events;
    logger.info(`${events.length} new LINE event(s) received.`);

    // Process all of the received events asynchronously.
    Promise.all(events.map(handleEvent))
      .then(() => {
        logger.info('All events processed succesfully!');
        res.status(200).send();
      })
      .catch((err: unknown) => {
        if (err instanceof Error) {
          logger.error(err.message);
        } else {
          logger.error(err);
        }
        res.status(500).end();
      }).finally(() => {
        next();
      });
  }
);

if (NODE_ENV === 'development') {
  app.get('/test/:conversationId', testGetUser);
  app.post('/test/hash', express.json(), testHash);
}

app.listen(PORT, async function () {
  populateCache();
  await connectToDatabase();
  logger.info(`LINE AI bot running on PORT: ${PORT} 🤖`);
});
