// Modules
import { middleware, MiddlewareConfig, WebhookEvent } from '@line/bot-sdk';
import express, { Application, Request, Response } from 'express';

// Project imports
//import { connectToDatabase } from './database';
import { PORT, LINE_CHANNEL_SECRET, LINE_CHANNEL_ACCESS_TOKEN } from './environment';
import {
  handleFollowEvent, handleJoinEvent, handleLeaveEvent, handleMessageEvent, handleUnfollowEvent
} from './handleEvents';

const middlewareConfig: MiddlewareConfig = {
  channelAccessToken: LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: LINE_CHANNEL_SECRET
};

//await connectToDatabase();

const app: Application = express();

app.use(express.urlencoded({
  extended: true
}));

// Health check endpoint.
app.get('/health', (_req: Request, res: Response): void => {
  res.status(200).send();
  return;
});

app.post(
  '/webhook',
  middleware(middlewareConfig),
  async (req: Request, res: Response): Promise<void> => {
    const events: Array<WebhookEvent> = req.body.events;
    console.log('LINE events:', events);

    // Process all of the received events asynchronously.
    await Promise.all(
      events.map(async (event: WebhookEvent): Promise<void> => {
        try {
          switch (event.type) {
          case 'message':
            handleMessageEvent(event);
            break;
          case 'follow':
            handleFollowEvent(event);
            break;
          case 'unfollow':
            handleUnfollowEvent(event);
            break;
          case 'join':
            handleJoinEvent(event);
            break;
          case 'leave':
            handleLeaveEvent(event);
            break;
          default:
            console.log(`Unsupported event type: ${event.type}`);
            Promise.resolve(null);
            break;
          }
        } catch (err: unknown) {
          console.error(err);

          // Return an error message.
          res.status(500).json({
            status: 'error'
          });
          return;
        }
      })
    );

    // Return a successfull message.
    res.status(200).send();
    return;
  }
);

app.listen(PORT, async () => {
  console.log(`LINE bot started on PORT: ${PORT} 🤖`);
});
