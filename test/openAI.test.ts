import axios, { AxiosStatic } from 'axios';

import { OpenAiData } from './data';
import openAI, { OpenAiCustomResponse } from '../src/openAI';

jest.mock('axios');
const mockedAxios: jest.Mocked<AxiosStatic> = axios as jest.Mocked<typeof axios>;

/*
export const OpenAiData: CreateCompletionResponse = {
  id: 'cmpl-703eHXpmKg6mTKQi1HhBiIx1soM0Z',
  object: 'text_completion',
  created: 1680248381,
  model: 'text-davinci-003',
  choices: [
    {
      text: 'testing OpenAI API',
      index: 0,
      logprobs: null,
      finish_reason: 'stop'
    },
    {
      text: 'should not show up in tests',
      index: 0,
      logprobs: null,
      finish_reason: 'stop'
    }
  ],
  usage: { prompt_tokens: 4, completion_tokens: 89, total_tokens: 93 }
};
*/

describe('Test OpenAI', () => {
  it('should respond with correct data when instance exists', async () => {
    mockedAxios.post.mockResolvedValue({
      data: OpenAiData
    });
    const res: OpenAiCustomResponse = await openAI('testing');
    expect(res.id).toBe(OpenAiData.id);
    expect(res.promptReply).toBe(OpenAiData.choices[0].text);
    expect(res.tokensUsed).toBe(OpenAiData.usage?.total_tokens);
  });
});
