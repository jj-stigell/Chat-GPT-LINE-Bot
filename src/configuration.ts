/* eslint-disable max-len */
// Modules
import { MiddlewareConfig, QuickReplyItem, TextMessage } from '@line/bot-sdk';
import { Options } from 'node-cache';

// Project imports
import { LINE_CHANNEL_ACCESS_TOKEN, LINE_CHANNEL_SECRET } from './environment';

// Config for LINE middleware for verifying signatures.
export const lineMiddlewareConfig: MiddlewareConfig = {
  channelAccessToken: LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: LINE_CHANNEL_SECRET
};

// Caching options for the messaging webhook prompts.
export const nodeCacheOptions: Options = {
  stdTTL: 3600 * 24, // The standard ttl as number in seconds for every generated cache element. 0 = unlimited
  checkperiod: 3600, // The period in seconds, as a number, used for the automatic delete check interval. 0 = no periodic check.
  useClones: false, //If true you'll get a copy of the cached variable. If false you'll save and get just the reference.
  deleteOnExpire: true, // If true the variable will be deleted. If false the variable will remain.
  maxKeys: -1 // A maximum amount of keys that can be stored in the cache. If a new item is set and the cache is full, an error is thrown and the key will not be saved in the cache. -1 disables the key limit.
};

// Terms of service URL.
const tosUrl: string = 'https://neko-ai.onrender.com/#tos';

// how to use URL.
const howToUseUrl: string = 'https://neko-ai.onrender.com/#usage';

// OpenAI prompt fail message.
export const failMessage: string = '回答生成に失敗しました。もう一度お試しください。';

// Max character amount user is allowed to "ask" the bot.
export const promtCharLimit: number = 100;

// Error message in case the prompt is too long.
export const promptTooLong: string = `${promtCharLimit}文字未満のメッセージしか返信できません`;

// Keyword to which bot reacts in group and multi-person chats.
export const activateBotKeyword: string = 'bot';

// Quickreply menu sent in with the first message after follow or join event.
const shareWithFriend: QuickReplyItem = {
  type: 'action',
  action: {
    type: 'uri',
    label: '友達に勧める',
    uri: 'https://line.me/R/nv/recommendOA/@linedevelopers'
  }
};

const tos: QuickReplyItem = {
  type: 'action',
  action: {
    type: 'uri',
    label: '利用規約',
    uri: tosUrl
  }
};

const howToUse: QuickReplyItem = {
  type: 'action',
  action: {
    type: 'uri',
    label: '使い方',
    uri: howToUseUrl
  }
};

const tonightsMenuUser: QuickReplyItem = {
  type: 'action',
  action: {
    type: 'message',
    label: '今夜の献立',
    text: '今夜の献立教えて下さい。'
  }
};

const tonightsMenuGroup: QuickReplyItem = {
  type: 'action',
  action: {
    type: 'message',
    label: '今夜の献立',
    text: 'bot 今夜の献立教えて下さい。'
  }
};

const translationExampleUser: QuickReplyItem = {
  type: 'action',
  action: {
    type: 'message',
    label: '野球の英訳',
    text: '野球の英訳して下さい。'
  }
};

const translationExampleGroup: QuickReplyItem = {
  type: 'action',
  action: {
    type: 'message',
    label: '野球の英訳',
    text: 'bot 野球の英訳して下さい。'
  }
};

// Default message for 1-on-1 chat.
export const userWelcomeMessage: TextMessage = {
  type: 'text',
  text: `チャットボットをご利用いただきありがとうございます！私とのチャットを始める前に、プライバシーポリシーと利用規約をお読みください。最大の質問の長さは${promtCharLimit}文字です。私には何でもお聞きいただけます。以下は、よく受け取る一般的な質問です。`,
  quickReply: {
    items: [
      howToUse,
      tonightsMenuUser,
      translationExampleUser,
      shareWithFriend,
      tos
    ]
  }
};

// Default message for group and multi-person chats.
export const groupWelcomeMessage: TextMessage = {
  type: 'text',
  text: `皆さん、こんにちは！チャットボットをご利用いただきありがとうございます！私とのチャットを始める前に、プライバシーポリシーと利用規約をお読みください。最大の質問の長さは${promtCharLimit}文字です。私には何でもお聞きいただけます。メッセージの最初に「${activateBotKeyword}」というキーワードを含めると、ボットに質問することができます。以下は、よく受け取る一般的な質問です。`,
  quickReply: {
    items: [
      howToUse,
      tonightsMenuGroup,
      translationExampleGroup,
      shareWithFriend,
      tos
    ]
  }
};
