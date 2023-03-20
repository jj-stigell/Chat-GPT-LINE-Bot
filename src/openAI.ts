import { Configuration, OpenAIApi } from 'openai';
import { OPENAI_API_KEY } from './environment';

export async function openAI(question: string): Promise<string> {

  const configuration: Configuration = new Configuration({
    apiKey: OPENAI_API_KEY
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
