// import { WebhookEvent } from '@line/bot-sdk';
import { LineEvent, OpenAiReply } from '../src/types';

export const events: Array<LineEvent> = [
  {
    type: 'message',
    message: {
      type: 'text',
      id: '17834583846161',
      text: 'bot hi there'
    },
    webhookEventId: '01GVZ50WZVFRCYZMZTF4RKA5JQ',
    deliveryContext: {
      isRedelivery: false
    },
    timestamp: 1679303930754,
    source: {
      type: 'user',
      userId: 'X296da51f7cb7af978e73c87840y98qc3'
    },
    replyToken: '0f9a7bb6f39b4e0e94bfe1b96920f57a',
    mode: 'active'
  },
  {
    type: 'message',
    message: {
      type: 'text',
      id: '17834607084025',
      text: 'bot lets see how many tokens this will eat. tell my all about earth outer surface'
    },
    webhookEventId: '01GVZ58WM9CTZD89C697ZR3P3G',
    deliveryContext: {
      isRedelivery: false
    },
    timestamp: 1679304192288,
    source: {
      type: 'user',
      userId: 'X296da51f7cb7af978e73c87840y98qc3'
    },
    replyToken: 'db6cf3355cac4f1d83a7de3e09a81c92',
    mode: 'active'
  }
];

export const openAiReply: Array<OpenAiReply> = [
  {
    id: 'cmpl-6w5xESJoDrlErvDpGelJOXAEI1qAr',
    object: 'text_completion',
    created: 1679303932,
    model: 'text-davinci-003',
    choices: [
      {
        text: '\n\nHi there! How can I help you?',
        index: 0,
        logprobs: null,
        finish_reason: 'stop'
      }
    ],
    usage: { prompt_tokens: 3, completion_tokens: 11, total_tokens: 14 }
  },
  {
    id: 'cmpl-6w61Raiv35tjOzw55C88XQVNAdjtJ',
    object: 'text_completion',
    created: 1679304193,
    model: 'text-davinci-003',
    choices: [
      {
        text: '\n' +
          '\n' +
          'I\'m afraid I\'m not able to answer that question. I\'m a chatbot, not an encyclopedia!',
        index: 0,
        logprobs: null,
        finish_reason: 'stop'
      }
    ],
    usage: { prompt_tokens: 21, completion_tokens: 24, total_tokens: 45 }
  }
];
