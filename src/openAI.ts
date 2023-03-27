import { Configuration, OpenAIApi } from 'openai';

import { failMessage } from './configs/configuration';
import OpenAIRequest, { IOpenAIRequest } from './database/models/OpenAIRequest';
import { OPENAI_API_KEY, OPENAI_ORGANIZATION } from './configs/environment';

const configuration: Configuration = new Configuration({
  apiKey: OPENAI_API_KEY,
  organization: OPENAI_ORGANIZATION
});

const openai: OpenAIApi = new OpenAIApi(configuration);

export async function openAI(prompt: string, conversationId: string = '-'): Promise<string> {
  try {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: any= await openai.createCompletion({
      model: 'text-davinci-003',
      prompt,
      temperature: 0,
      max_tokens: 200,
      top_p: 1,
      frequency_penalty: 0.0,
      presence_penalty: 0.0
    });

    console.log('OpenAI response:', response.data);
    const message: string = response.data.choices[0].text.trim();

    const openAIRequest: IOpenAIRequest = new OpenAIRequest({
      _id: response.data.id,
      conversationId,
      message,
      tokensUsed: Number(response.data.usage.total_tokens)
    });
    await openAIRequest.save();

    return message;
  } catch (error: unknown) {
    console.log('OpenAI query failed, error:', error);
    return failMessage;
  }
}
