import { Configuration, OpenAIApi } from 'openai';
import { OPENAI_API_KEY, OPENAI_ORGANIZATION } from './environment';

const configuration: Configuration = new Configuration({
  apiKey: OPENAI_API_KEY,
  organization: OPENAI_ORGANIZATION
});

const openai: OpenAIApi = new OpenAIApi(configuration);

export async function openAI(prompt: string): Promise<string> {

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response: any = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt,
    temperature: 0,
    max_tokens: 200,
    top_p: 1,
    frequency_penalty: 0.0,
    presence_penalty: 0.0
  });

  console.log('OpenAI response:', response.data);

  return response.data.choices[0].text.trim();
}
