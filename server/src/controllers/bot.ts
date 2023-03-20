/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/typedef */
// Modules
import { Request, Response } from 'express';
import * as yup from 'yup';
import https from 'https';


// Project imports
import { HttpCode } from '../types/httpCode';
import { Configuration, OpenAIApi } from 'openai';



async function openAI(question: string): Promise<string> {

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

  console.log(response.data);


  return response.data.choices[0].text.trim();
}



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


  const answer: string = await openAI(question);

  console.log(answer);


  res.status(HttpCode.Ok).send({
    data: answer
  });
}









export async function line(req: Request, res: Response): Promise<void> {

  res.send('HTTP POST request sent to the webhook URL!');
  // If the user sends a message to your bot, send a reply message


  console.log('EVENTS', req.body.events);
  console.log('EVENTS 0', req.body.events[0]);

  const prompt: string = req.body.events[0].message.text;


  if (req.body.events[0].type === 'message' && prompt.toLowerCase().startsWith('bot')) {
    // Message data, must be stringified
    const dataString = JSON.stringify({
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


/*
Mar 20 01:23:29 PM  EVENTS [
Mar 20 01:23:29 PM    {
Mar 20 01:23:29 PM      type: 'message',
Mar 20 01:23:29 PM      message: { type: 'text', id: '17833171084297', text: 'Gkk' },
Mar 20 01:23:29 PM      webhookEventId: '01GVYM42CMA202VK0NE5091EYF',
Mar 20 01:23:29 PM      deliveryContext: { isRedelivery: false },
Mar 20 01:23:29 PM      timestamp: 1679286208641,
Mar 20 01:23:29 PM      source: { type: 'user', userId: 'U565da51f2cb7af446e73c87840e59ec3' },
Mar 20 01:23:29 PM      replyToken: '201ad4fa9ce940588b8b07c52a6783a4',
Mar 20 01:23:29 PM      mode: 'active'
Mar 20 01:23:29 PM    }
Mar 20 01:23:29 PM  ]
Mar 20 01:23:29 PM  EVENTS 0 {
Mar 20 01:23:29 PM    type: 'message',
Mar 20 01:23:29 PM    message: { type: 'text', id: '17833171084297', text: 'Gkk' },
Mar 20 01:23:29 PM    webhookEventId: '01GVYM42CMA202VK0NE5091EYF',
Mar 20 01:23:29 PM    deliveryContext: { isRedelivery: false },
Mar 20 01:23:29 PM    timestamp: 1679286208641,
Mar 20 01:23:29 PM    source: { type: 'user', userId: 'U565da51f2cb7af446e73c87840e59ec3' },
Mar 20 01:23:29 PM    replyToken: '201ad4fa9ce940588b8b07c52a6783a4',
Mar 20 01:23:29 PM    mode: 'active'
Mar 20 01:23:29 PM  }
*/
