// Modules
import { TextMessage } from '@line/bot-sdk';

export const promtCharLimit: number = 60;

export const promptTooLong: string = `${promtCharLimit}文字未満のメッセージしか返信できません`;

// Keyword to which bot reacts in group and multi-person chats.
export const activateBotKeyword: string = 'bot';

// Default message for 1-on-1 chat. Uses winking LINE character emoji.
// LINE emoji info: https://developers.line.biz/en/docs/messaging-api/emoji-list/.
export const userWelcomeMessage: TextMessage = {
  type: 'text',
  text: `チャットボットをご利用いただきありがとうございます！私とのチャットを始める前に、プライバシーポリシーと利用規約をお読みください。
  最大の質問の長さは${promtCharLimit}文字です。私には何でもお聞きいただけます。以下は、よく受け取る一般的な質問です。$`,
  emojis: [
    {
      index: 0,
      productId: '5ac1bfd5040ab15980c9b435',
      emojiId: '011'
    }
  ]
};


// MEntion bot keyword
// Default message for group and multi-person chats. Uses winking LINE character emoji.
// LINE emoji info: https://developers.line.biz/en/docs/messaging-api/emoji-list/.
export const groupWelcomeMessage: TextMessage = {
  type: 'text',
  text: `皆さん、こんにちは！チャットボットをご利用いただきありがとうございます！私とのチャットを始める前に、プライバシーポリシーと利用規約をお読みください。
  最大の質問の長さは${promtCharLimit}文字です。私には何でもお聞きいただけます。以下は、よく受け取る一般的な質問です。$`,
  emojis: [
    {
      index: 0,
      productId: '5ac1bfd5040ab15980c9b435',
      emojiId: '011'
    }
  ]
};
