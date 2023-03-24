/* eslint-disable max-len */
// Modules
import { QuickReply, TextMessage } from '@line/bot-sdk';

// Terms of service URL.
const tosUrl: string = 'https://neko-ai.onrender.com/#tos';

// how to use URL.
const howToUseUrl: string = 'https://neko-ai.onrender.com/#usage';

// Max character amount user is allowed to "ask" the bot.
export const promtCharLimit: number = 100;

// Error message in case the prompt is too long.
export const promptTooLong: string = `${promtCharLimit}文字未満のメッセージしか返信できません`;

// Keyword to which bot reacts in group and multi-person chats.
export const activateBotKeyword: string = 'bot';

// Quickreply menu sent in with the first message after follow or join event.
const quickReply: QuickReply = {
  items: [
    {
      type: 'action',
      action: {
        type: 'uri',
        label: '使い方',
        uri: howToUseUrl
      }
    },
    {
      type: 'action',
      action: {
        type: 'message',
        label: '今夜の献立', // Does not work at group chat, because "bot" key missing
        text: '今夜の献立'
      }
    },
    {
      type: 'action',
      action: {
        type: 'message',
        label: '野球の英訳', // Does not work at group chat, because "bot" key missing
        text: '野球の英訳'
      }
    },
    {
      type: 'action',
      action: {
        type: 'uri',
        label: '友達に勧める',
        uri: 'https://line.me/R/nv/recommendOA/@linedevelopers'
      }
    },
    {
      type: 'action',
      action: {
        type: 'uri',
        label: '利用規約',
        uri: tosUrl
      }
    }
  ]
};

// Default message for 1-on-1 chat.
export const userWelcomeMessage: TextMessage = {
  type: 'text',
  text: `チャットボットをご利用いただきありがとうございます！私とのチャットを始める前に、プライバシーポリシーと利用規約をお読みください。最大の質問の長さは${promtCharLimit}文字です。私には何でもお聞きいただけます。以下は、よく受け取る一般的な質問です。`,
  quickReply
};

// Default message for group and multi-person chats.
export const groupWelcomeMessage: TextMessage = {
  type: 'text',
  text: `皆さん、こんにちは！チャットボットをご利用いただきありがとうございます！私とのチャットを始める前に、プライバシーポリシーと利用規約をお読みください。最大の質問の長さは${promtCharLimit}文字です。私には何でもお聞きいただけます。メッセージの最初に「${activateBotKeyword}」というキーワードを含めると、ボットに質問することができます。以下は、よく受け取る一般的な質問です。`,
  quickReply
};
