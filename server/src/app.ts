/* eslint-disable @typescript-eslint/typedef */
/* eslint-disable @typescript-eslint/no-explicit-any */
// Modules
import express, { Application } from 'express';
//import * as line from '@line/bot-sdk';

import https from 'https';

// Project imports
import { router } from './routes/index';
import { errorHandler } from './middleware/errorHandler';

export const app: Application = express();


/*
const middlewareConfig: line.MiddlewareConfig = {
  channelSecret: process.env.CHANNEL_SECRET ?? '',
  channelAccessToken: process.env.CHANNEL_TOKEN ?? ''
};

const clientConfig: line.ClientConfig = {
  channelSecret: process.env.CHANNEL_SECRET ?? '',
  channelAccessToken: process.env.CHANNEL_TOKEN ?? ''
};
*/

const TOKEN: string = process.env.CHANNEL_TOKEN ?? '';


app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

app.use('/api/v1/', router);



app.post('/health', (req: any, res: any) => {
  res.statusCode(200);
});



/*
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
*/




app.post('/webhook', function (req: any, res: any) {
  res.send('HTTP POST request sent to the webhook URL!');
  // If the user sends a message to your bot, send a reply message
  if (req.body.events[0].type === 'message') {
    // Message data, must be stringified
    const dataString = JSON.stringify({
      replyToken: req.body.events[0].replyToken,
      messages: [
        {
          'type': 'text',
          'text': 'Hello, user'
        },
        {
          'type': 'text',
          'text': 'May I help you?'
        }
      ]
    });

    // Request header
    const headers: any = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + TOKEN
    };

    // Options to pass into the request
    const webhookOptions: any = {
      'hostname': 'api.line.me',
      'path': '/v2/bot/message/reply',
      'method': 'POST',
      'headers': headers,
      'body': dataString
    };

    // Define request
    const request = https.request(webhookOptions, (res: any) => {
      res.on('data', (d: any) => {
        process.stdout.write(d);
      });
    });

    // Handle error
    request.on('error', (err) => {
      console.error(err);
    });

    // Send data
    request.write(dataString);
    request.end();
  }
});















app.use(errorHandler);
