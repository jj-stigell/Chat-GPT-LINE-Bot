// Modules
import {
  Client, ClientConfig, MessageAPIResponseBase,
  middleware, MiddlewareConfig, TextMessage, WebhookEvent
} from '@line/bot-sdk';
import express, { Application, Request, Response } from 'express';
import https from 'https';
import * as yup from 'yup';

// Project imports
import {
  PORT, LINE_CHANNEL_SECRET, LINE_CHANNEL_ACCESS_TOKEN
} from './environment';
import { openAI } from './openAI';
import { LineEvent } from './types';

export const app: Application = express();

app.use(express.urlencoded({
  extended: true
}));

app.get('/health', (_req: Request, res: Response): Response => {
  return res.status(200).send();
});








app.post('/webhook/v2', async (req: Request, res: Response): Promise<void> => {
  res.status(200).send();

  const events: Array<LineEvent> = req.body.events;
  let prompt: string = events[0].message.text;

  console.log('EVENTS', events);
  console.log('EVENTS 0', events[0]);

  if (events[0].type === 'message' && prompt.toLowerCase().startsWith('bot')) {
    prompt = prompt.substring(3);

    // Message data, must be stringified
    const dataString: string = JSON.stringify({
      replyToken: events[0].replyToken,
      messages: [
        /*
        {
          'type': 'text',
          'text': req.body?.events[0]?.source?.userId ?
            `Hi user ${req.body?.events[0]?.source?.userId}` : 'Hi, here is the answer:'
        },
        */
        {
          'type': 'text',
          'text': req.body?.events[0]?.message?.text ?
            await openAI(events[0].message.text) : 'I could not parse your message'
        }
      ]
    });

    // Request header
    const headers: object = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + LINE_CHANNEL_ACCESS_TOKEN
    };

    // Options to pass into the request
    const webhookOptions: object = {
      'hostname': 'api.line.me',
      'path': '/v2/bot/message/reply',
      'method': 'POST',
      'headers': headers,
      'body': dataString
    };

    // Define request
    const request: any = https.request(webhookOptions, (res: any): void => {
      res.on('data', (d: any) => {
        process.stdout.write(d);
      });
    });

    // Handle error
    request.on('error', (err: unknown) => {
      console.error(err);
    });

    // Send data
    request.write(dataString);
    request.end();
  }

});






app.post('/ask', async (req: Request, res: Response): Promise<void> => {
  const requestSchema: yup.AnyObject = yup.object({
    question: yup
      .string()
      .required('question required')
  });

  await requestSchema.validate(req.body, { abortEarly: false }).then();
  const question: string = req.body.question;

  const answer: string = await openAI(question);

  console.log(answer);

  res.status(200).send({
    data: answer
  });
});












/*
const textEventHandler = async (
  event: WebhookEvent): Promise<MessageAPIResponseBase | undefined> => {
  // Process all variables here.
  if (event.type !== 'message' || event.message.type !== 'text') {
    return;
  }

  // Process all message related variables here.
  const { replyToken } = event;
  const { text } = event.message;

  // Create a new message.
  const response: TextMessage = {
    type: 'text',
    text,
  };

  // Reply to the user.
  await client.replyMessage(replyToken, response);
};





app.post(
  '/webhook',
  middleware(middlewareConfig),
  async (req: Request, res: Response): Promise<Response> => {
    const events: WebhookEvent[] = req.body.events;

    // Process all of the received events asynchronously.
    const results: any = await Promise.all(
      events.map(async (event: WebhookEvent) => {
        try {
          await textEventHandler(event);
        } catch (err: unknown) {
          if (err instanceof Error) {
            console.error(err);
          }

          // Return an error message.
          return res.status(500).json({
            status: 'error',
          });
        }
      })
    );

    // Return a successfull message.
    return res.status(200).json({
      status: 'success',
      results,
    });
  }
);
*/

const middlewareConfig: MiddlewareConfig = {
  channelAccessToken: LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: LINE_CHANNEL_SECRET
};

const clientConfig: ClientConfig = {
  channelAccessToken: LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: LINE_CHANNEL_SECRET,
};

const client: Client = new Client(clientConfig);



async function handleTextEvent(event: WebhookEvent): Promise<MessageAPIResponseBase | null> {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  const replyToken: string = event.replyToken;
  const text: string = await openAI(event.message.text);

  const response: TextMessage = {
    type: 'text',
    text,
  };

  return client.replyMessage(replyToken, response);
}








app.post(
  '/webhook',
  middleware(middlewareConfig),
  async (req: Request, res: Response): Promise<Response> => {

    const events: Array<WebhookEvent> = req.body.events;

    console.log(events);

    // Process all of the received events asynchronously.
    const results: any = await Promise.all(
      events.map(async (event: WebhookEvent) => {
        try {

          if (event.type === 'message' && event.message.type === 'text') {
            await handleTextEvent(event);
          }


        } catch (err: unknown) {
          if (err instanceof Error) {
            console.error(err);
          }

          // Return an error message.
          return res.status(500).json({
            status: 'error',
          });
        }
      })
    );

    // Return a successfull message.
    return res.status(200).json({
      status: 'success',
      results,
    });



    /*
    Promise
      .all(events.map(handleEvent))
      .then((result: any) => res.json(result));
      */

  });








/*
const app = express();
app.post('/webhook', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result));
});

const client = new line.Client(config);
function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: event.message.text
  });
}
  */

















app.use(express.json());

















app.listen(PORT, async () => {
  console.log(`Bot started on PORT: ${PORT}`);
});
