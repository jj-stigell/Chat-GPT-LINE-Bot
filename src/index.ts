// Modules
import express, { Application, Request, Response } from 'express';
import https from 'https';
import * as yup from 'yup';

// Project imports
import { PORT, LINE_CHANNEL_TOKEN,  } from './environment';
import { openAI } from './openAi';



export const app: Application = express();



app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));



app.get('/health', (_req: Request, res: Response): void => {
  res.status(200).send();
  return;
});



app.post('/webhook', async (req: Request, res: Response): Promise<void> => {
  res.status(200).send();

  console.log('EVENTS', req.body.events);
  console.log('EVENTS 0', req.body.events[0]);

  let prompt: string = req.body.events[0].message.text;

  if (req.body.events[0].type === 'message' && prompt.toLowerCase().startsWith('bot')) {
    prompt = prompt.substring(3);

    // Message data, must be stringified
    const dataString: string = JSON.stringify({
      replyToken: req.body.events[0].replyToken,
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
            await openAI(req.body.events[0].message.text) : 'I could not parse your message'
        }
      ]
    });

    // Request header
    const headers: object = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + LINE_CHANNEL_TOKEN
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
    const request: any = https.request(webhookOptions, (res: any) => {
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



app.listen(PORT, async () => {
  console.log(`Application started on PORT: ${PORT}`);
});
