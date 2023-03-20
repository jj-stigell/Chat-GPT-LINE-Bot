export type Choices = {
    text: string;
    index: number;
    logprobs: string | number | boolean | null;
    finish_reason: string;
};

export type OpenAiReply = {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<Choices>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  }
};

export type LineEvent = {
  type: string;
  message: {
    type: string;
    id: string;
    text: string;
  };
  webhookEventId: string;
  deliveryContext: {
    isRedelivery: boolean;
  };
  timestamp: number;
  source: {
    type: string;
    userId: string;
  };
  replyToken: string;
  mode: string;
};
