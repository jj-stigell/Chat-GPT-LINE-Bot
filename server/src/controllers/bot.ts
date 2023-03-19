/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/typedef */
// Modules
import { Request, Response } from 'express';
import * as yup from 'yup';
import https from 'https';


// Project imports
import { HttpCode } from '../types/httpCode';
import { Configuration, OpenAIApi } from 'openai';

const TOKEN: string = process.env.CHANNEL_TOKEN ?? '';


let counter: number = 0;

export async function ask(req: Request, res: Response): Promise<void> {
  const requestSchema: yup.AnyObject = yup.object({
    question: yup
      .string()
      .required('question required')
  });

  counter++;

  if (counter % 5 === 0) {
    res.status(HttpCode.Ok).send({
      data: 'this is ad'
    });
    return;
  }

  await requestSchema.validate(req.body, { abortEarly: false });
  const question: string = req.body.question;

  const configuration: Configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const openai: OpenAIApi = new OpenAIApi(configuration);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response: any = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: question,
    temperature: 0,
    max_tokens: 1000,
    top_p: 1,
    frequency_penalty: 0.0,
    presence_penalty: 0.0
  });

  res.status(HttpCode.Ok).send({
    data: response.data.choices[0].text
  });
}

export async function line(req: Request, res: Response): Promise<void> {

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


}
