/* eslint-disable @typescript-eslint/no-explicit-any */
// Modules
import express, { Application } from 'express';
import * as line from '@line/bot-sdk';

// Project imports
import { router } from './routes/index';
import { errorHandler } from './middleware/errorHandler';

export const app: Application = express();

const middlewareConfig: line.MiddlewareConfig = {
  channelSecret: process.env.CHANNEL_SECRET ?? '',
  channelAccessToken: process.env.CHANNEL_TOKEN ?? ''
};

const clientConfig: line.ClientConfig = {
  channelSecret: process.env.CHANNEL_SECRET ?? '',
  channelAccessToken: process.env.CHANNEL_TOKEN ?? ''
};




app.use(express.json());
app.use('/api/v1/', router);




app.post('/webhook', line.middleware(middlewareConfig), (req: any, res: any) => {
  console.log('EVENTS:', req.body.events);

  Promise.all(req.body.events.map(handleEvent)).then((result: any) =>
    res.json('RESULT:', result)
  );
});

const client: line.Client = new line.Client(clientConfig);

async function handleEvent(event: any): Promise<null | line.MessageAPIResponseBase> {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  let replyText: string = '';
  replyText = event.message.text;

  console.log('REPLY TEXT:', replyText);

  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: replyText,
  });
}







app.use(errorHandler);
