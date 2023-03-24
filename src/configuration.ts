// Modules
import { TextMessage } from '@line/bot-sdk';

// Max character amount user is allowed to "ask" the bot.
export const promtCharLimit: number = 100;

// Error message in case the prompt is too long.
export const promptTooLong: string = `${promtCharLimit}文字未満のメッセージしか返信できません`;

// Keyword to which bot reacts in group and multi-person chats.
export const activateBotKeyword: string = 'bot';

// Default message for 1-on-1 chat.
export const userWelcomeMessage: TextMessage = {
  type: 'text',
  text: `チャットボットをご利用いただきありがとうございます！私とのチャットを始める前に、プライバシーポリシーと利用規約をお読みください。
  最大の質問の長さは${promtCharLimit}文字です。私には何でもお聞きいただけます。以下は、よく受け取る一般的な質問です。`
};

// Default message for group and multi-person chats.
export const groupWelcomeMessage: TextMessage = {
  type: 'text',
  text: `皆さん、こんにちは！チャットボットをご利用いただきありがとうございます！私とのチャットを始める前に、プライバシーポリシーと利用規約をお読みください。
  最大の質問の長さは${promtCharLimit}文字です。私には何でもお聞きいただけます。メッセージの最初に「${activateBotKeyword}」というキーワードを含めると、ボットに質問することができます。
  以下は、よく受け取る一般的な質問です。`
};
