// Modules
import {
  Client, ClientConfig, MessageAPIResponseBase,
  middleware, MiddlewareConfig, TextMessage, WebhookEvent
} from '@line/bot-sdk';
import express, { Application, Request, Response } from 'express';
import * as yup from 'yup';

// Project imports
import { promtCharLimit } from './configuration';
//import { connectToDatabase } from './database';
import {
  PORT, LINE_CHANNEL_SECRET, LINE_CHANNEL_ACCESS_TOKEN
} from './environment';
import { openAI } from './openAI';

const app: Application = express();

//await connectToDatabase();

app.use(express.urlencoded({
  extended: true
}));

const middlewareConfig: MiddlewareConfig = {
  channelAccessToken: LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: LINE_CHANNEL_SECRET
};

const clientConfig: ClientConfig = {
  channelAccessToken: LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: LINE_CHANNEL_SECRET
};

const client: Client = new Client(clientConfig);

app.get('/health', (_req: Request, res: Response): void => {
  res.status(200).send();
  return;
});

async function handleTextEvent(event: WebhookEvent): Promise<MessageAPIResponseBase | null> {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  const replyToken: string = event.replyToken;
  const prompt: string = event.message.text.substring(3);
  const text: string = prompt.length <= promtCharLimit ?
    await openAI(event.message.text.substring(3)) : `${promtCharLimit}文字未満のメッセージしか返信できません`;

  const response: TextMessage = {
    type: 'text',
    text
  };

  return await client.replyMessage(replyToken, response);
}

app.post(
  '/webhook',
  middleware(middlewareConfig),
  async (req: Request, res: Response): Promise<void> => {
    const events: Array<WebhookEvent> = req.body.events;

    console.log('LINE events:', events);

    // Process all of the received events asynchronously.
    await Promise.all(
      events.map(async (event: WebhookEvent) => {
        try {

          /*

          map events to correct handlers

          MESSAGES:
          - user message
          - group message

          REMOVE:
          - user remove bot
          - group remove bot

          JOIN:
          - bot joins user chat
          - bot joins group chat

          */









          if (
            event.type === 'message' &&
            event.message.type === 'text' &&
            event.message.text.toLowerCase().startsWith('bot')
          ) {
            await handleTextEvent(event);
          } else {
            return Promise.resolve(null);
          }
        } catch (err: unknown) {
          if (err instanceof Error) {
            console.error(err);
          }

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

app.use(express.json());

app.post('/ask', async (req: Request, res: Response): Promise<void> => {
  const requestSchema: yup.AnyObject = yup.object({
    question: yup
      .string()
      .required('question required')
  });

  await requestSchema.validate(req.body, { abortEarly: false });
  const question: string = req.body.question;

  const answer: string = await openAI(question);

  console.log(answer);

  res.status(200).send({
    data: answer
  });
  return;
});

app.listen(PORT, async () => {
  console.log(`Bot started on PORT: ${PORT}`);
});
