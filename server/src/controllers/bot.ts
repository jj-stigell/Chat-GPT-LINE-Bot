// Modules
import { Request, Response } from 'express';
import * as yup from 'yup';

// Project imports
import { HttpCode } from '../types/httpCode';
import { Configuration, OpenAIApi } from 'openai';

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
