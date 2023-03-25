// Modules
import { middleware, MiddlewareConfig, WebhookEvent } from '@line/bot-sdk';
import express, { Application, NextFunction, Request, Response } from 'express';

// Project imports
import { connectToDatabase } from './database';
import { PORT, LINE_CHANNEL_SECRET, LINE_CHANNEL_ACCESS_TOKEN } from './environment';
import { handleEvent } from './eventHandlers';
import { webhookLogger } from './logger';

const middlewareConfig: MiddlewareConfig = {
  channelAccessToken: LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: LINE_CHANNEL_SECRET
};

const app: Application = express();

app.use(express.urlencoded({
  extended: true
}));

// Health check endpoint.
app.get('/health', (req: Request, res: Response, next: NextFunction): void => {
  console.log('ips', req.ips);
  console.log('sokcet', req.socket.remoteAddress);
  console.log('ip',req.ip);
  res.status(200).send();
  next();
});

app.post(
  '/webhook',
  middleware(middlewareConfig),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {

    if (!Array.isArray(req.body.events)) {
      res.status(500).end();
      return;
    }

    const events: Array<WebhookEvent> = req.body.events;
    console.log('LINE events:', events);

    // Process all of the received events asynchronously.
    Promise.all(events.map(handleEvent))
      .then(() => {
        res.status(200).send();
      })
      .catch((err: unknown) => {
        console.error(err);
        res.status(500).end();
      });
    next();
  }
);

app.use(webhookLogger());

app.listen(PORT, async () => {
  connectToDatabase();
  console.log(`LINE bot started on PORT: ${PORT} 🤖`);
});
