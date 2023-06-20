import axios, { AxiosStatic } from 'axios';

import { OpenAiData } from './data';
import openAI, { OpenAiCustomResponse } from '../src/util/openAI';

jest.mock('axios');
const mockedAxios: jest.Mocked<AxiosStatic> = axios as jest.Mocked<typeof axios>;

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
