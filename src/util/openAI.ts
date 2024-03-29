// Modules
import { Configuration, OpenAIApi } from 'openai';

// Project imports
import { failMessage } from '../configs/configuration';
import { CHATGTP_MODEL, OPENAI_API_KEY, OPENAI_ORGANIZATION } from '../configs/environment';
import logger from '../configs/winston';

const configuration: Configuration = new Configuration({
  apiKey: OPENAI_API_KEY,
  organization: OPENAI_ORGANIZATION
});

const openai: OpenAIApi = new OpenAIApi(configuration);

export type OpenAiCustomResponse = {
  id?: string;
  promptReply: string;
  tokensUsed: number;
};

/**
 * Calls the OpenAI API to generate a completion for a given prompt.
 * @param {string} prompt - The text prompt for which a completion is requested.
 * @returns {Promise<OpenAiCustomResponse>} - A Promise that resolves to an object of type "OpenAiCustomResponse".
 */
export default async function openAI(prompt: string): Promise<OpenAiCustomResponse> {
  try {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: any = await openai.createCompletion({
      model: CHATGTP_MODEL,
      prompt,
      temperature: 0,
      max_tokens: 200,
      top_p: 1,
      frequency_penalty: 0.0,
      presence_penalty: 0.0
    });

    const promptReply: string = response.data.choices[0].text.trim();
    const tokensUsed: number = Number(response.data.usage.total_tokens);
    logger.info(`OpenAi RESPONSE: "${promptReply}", COST: ${tokensUsed} tokens.`);

    return {
      id: response.data.id,
      promptReply,
      tokensUsed
    };
  } catch (error: unknown) {
    logger.error(`OpenAI query failed, error: ${error}`);
    return {
      id: undefined,
      promptReply: failMessage,
      tokensUsed: 0
    };
  }
}
